const scraper = require("./scraper");
const embedder = require("./embedding"); 
const chunker = require("./Chunker");

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
        
        let episode = await Episode.findOneBy({ 
            show: { id: show.id }, 
            season: info.season, 
            episode: info.episode
        });

        if (!episode) {
            episode = Episode.create({ 
                show, 
                season: info.season, 
                episode: info.episode, 
                title: info.episodeTitle 
            });

            await episode.save();
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
    const chunks = await chunker.chunkText(showInfo.transcript, 2000);
    const embeddingResponse = await embedder.generateEmbeddings(chunks);
    await generateDbRecords(embeddingResponse, chunks, showInfo);
}

if (require.main === module) {
  (async () => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log("✅ DataSource initialized");
    }
    const [, , type, id] = process.argv;
    if (type === "transcript") {
        await saveShowToDb(Number(id));
    } else {
        console.log("Usage: npx ts-node embedding.ts transcript <topicId>");
    }
  })();
}
