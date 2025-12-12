const scraper = require("./scraper");
import { Embedder } from "./embedding";
import { Chunker } from "./chunker";

import { AppDataSource } from "../model/datasource";
import { CreateEmbeddingResponse } from "openai/resources/embeddings";
import { Chunk } from "../model/entities/chunk";
import { Episode } from "../model/entities/episode";
import { Show } from "../model/entities/show";
import { ScrapingResponse } from "types/scraping";

// Reuse these instances
const embedder = new Embedder();
const chunker = new Chunker();

// Normalize embeddings before saving to DB
function normalize(v: number[]): number[] {
    let sum = 0;
    for (let i = 0; i < v.length; i++) sum += v[i] * v[i];
    const mag = Math.sqrt(sum);

    const out = new Array(v.length);
    for (let i = 0; i < v.length; i++) out[i] = v[i] / mag;
    return out;
}

export async function generateDbRecords(
    embeddings: CreateEmbeddingResponse,
    chunks: string[],
    info: ScrapingResponse
) {
    try {
        console.log(info);

        // Fetch or create show
        let show = await Show.findOneBy({ title: info.title });
        if (!show) {
            show = Show.create({ title: info.title });
            await show.save();
        }

        // Fetch or create episode with chunks relation
        let episode = await Episode.findOne({
            where: {
                show: { id: show.id },
                season: info.season,
                episode: info.episode
            },
            relations: ["chunks"]
        });

        if (!episode) {
            episode = Episode.create({
                show,
                season: info.season,
                episode: info.episode,
                title: info.episodeTitle,
                transcript: info.transcript
            });

            await episode.save();
        } else {
            // Episode exists - delete old chunks and update transcript
            if (episode.chunks?.length > 0) {
                console.log(
                    `Episode S${info.season}E${info.episode} exists with ${episode.chunks.length} chunks, deleting old data...`
                );
                await Chunk.delete({ episode: { id: episode.id } });
            }
            
            // Always update transcript to latest scraped version
            episode.transcript = info.transcript;
            episode.title = info.episodeTitle;
            await episode.save();
            console.log(`Updated episode S${info.season}E${info.episode}`);
        }

        // Build chunk entities (normalized embeddings)
        const chunkEntities = embeddings.data.map((embedding, index) => {
            const chunk = new Chunk();
            chunk.episode = episode;
            chunk.index = index;
            chunk.text = chunks[index];
            chunk.embedding = normalize(embedding.embedding);  // IMPORTANT: normalized
            return chunk;
        });

        // Bulk save (faster than per-entity save)
        await Chunk.save(chunkEntities);

    } catch (error) {
        console.error("Error generating database records:", error);
        throw error;
    }
}

export async function saveShowToDb(id: number) {
    const showInfo = await scraper.scrapeTranscript(id);

    // Process episode (will update if exists, create if new)
    const chunks = chunker.chunkText(showInfo.transcript, 300);
    const embeddingResponse = await embedder.generateEmbeddings(chunks);
    await generateDbRecords(embeddingResponse, chunks, showInfo);
}

export async function saveAllEpisodesForShow(showTitle: string) {
    const topicIds = await scraper.scrapeAllEpisodesForShow(showTitle);

    console.log(`Processing ${topicIds.length} episodes...`);

    for (let i = 0; i < topicIds.length; i++) {
        const topicId = topicIds[i];
        console.log(
            `Processing episode ${i + 1}/${topicIds.length} (Topic ID: ${topicId})`
        );

        try {
            await saveShowToDb(Number(topicId));
            console.log(`✓ Saved episode ${i + 1}`);
        } catch (error) {
            console.error(`✗ Failed to save episode ${i + 1}:`, error);
        }

        // Delay to avoid hammering target
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log("All episodes processed!");
}

if (require.main === module) {
    (async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log("DataSource initialized");
        }

        const [, , type, param] = process.argv;

        if (type === "transcript") {
            await saveShowToDb(Number(param));
        } else if (type === "show") {
            await saveAllEpisodesForShow(param);
        } else {
            console.log("Usage: npx ts-node generator.ts transcript <topicId>");
            console.log("       npx ts-node generator.ts show <showTitle>");
        }
    })();
}
