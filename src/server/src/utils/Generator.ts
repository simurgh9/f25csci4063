const scraper = require("./scraper");
import { Embedder } from "./embedding";
import { Chunker } from "./chunker";
const embeddr = new Embedder(); 
const chunker = new Chunker(); 

import { AppDataSource } from "../model/datasource";
import { CreateEmbeddingResponse } from "openai/resources/embeddings";
import { Chunk } from "../model/entities/chunk";
import { Episode } from "../model/entities/episode";
import { Show } from "../model/entities/show";
import { ScrapingResponse } from "types/scraping";


export async function generateDbRecords(
    embeddings: CreateEmbeddingResponse,
    chunks: string[],
    info: ScrapingResponse
) {
    try {
        console.log(info);
        let show = await Show.findOneBy({ title: info.title })
        if (!show) {
            show = Show.create({ title: info.title });
            await show.save();
        }
        
        let episode = await Episode.findOne({ 
            where: {
                show: { id: show.id }, 
                season: info.season, 
                episode: info.episode
            },
            relations: ['chunks']
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
            // Episode already exists
            if (!episode.transcript) {
                episode.transcript = info.transcript;
                await episode.save();
            }
            
            // Skip if chunks already exist
            if (episode.chunks && episode.chunks.length > 0) {
                console.log(`Episode already has ${episode.chunks.length} chunks, skipping...`);
                return;
            }
        }
        
        let chunkEntities = embeddings.data.map((embedding, index) => 
            Chunk.create({
                episode, 
                index, 
                text: chunks[index],
                embedding: embedding.embedding
            })
        );

        await Promise.all(chunkEntities.map((chunk) => chunk.save()));
        
    } catch (error) {
        console.error('Error generating database records:', error);
        throw error; 
    }
}

export async function saveShowToDb(id: number){
    const showInfo = await scraper.scrapeTranscript(id);
    
    // Check if episode already exists in database first
    let show = await Show.findOneBy({ title: showInfo.title });
    if (show) {
        const existingEpisode = await Episode.findOne({
            where: {
                show: { id: show.id },
                season: showInfo.season,
                episode: showInfo.episode
            },
            relations: ['chunks']
        });
        
        if (existingEpisode && existingEpisode.chunks && existingEpisode.chunks.length > 0) {
            console.log(`  → Episode S${showInfo.season}E${showInfo.episode} already exists with ${existingEpisode.chunks.length} chunks, skipping...`);
            return;
        }
    }
    
    // Episode doesn't exist or has no chunks, proceed with scraping and embedding
    const chunker = new Chunker();
    const embedder = new Embedder();
    const chunks = chunker.chunkText(showInfo.transcript, 300);
    const embeddingResponse = await embedder.generateEmbeddings(chunks);
    await generateDbRecords(embeddingResponse, chunks, showInfo);
}

export async function saveAllEpisodesForShow(showTitle: string) {
    const topicIds = await scraper.scrapeAllEpisodesForShow(showTitle);
    
    console.log(`Processing ${topicIds.length} episodes...`);
    
    for (let i = 0; i < topicIds.length; i++) {
        const topicId = topicIds[i];
        console.log(`Processing episode ${i + 1}/${topicIds.length} (Topic ID: ${topicId})`);
        
        try {
            await saveShowToDb(Number(topicId));
            console.log(`✓ Saved episode ${i + 1}`);
        } catch (error) {
            console.error(`✗ Failed to save episode ${i + 1}:`, error);
            // Continue with next episode
        }
        
        // Add a delay between episodes to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('All episodes processed!');
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
