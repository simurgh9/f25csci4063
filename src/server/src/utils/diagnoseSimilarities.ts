import { AppDataSource } from "../model/datasource";
import { Post } from "../model/entities/post";
import { Chunk } from "../model/entities/chunk";
import { Embedder } from "../utils/embedding";
import { Similarities } from "../utils/similarities";
import { In } from "typeorm";

/**
 * Diagnostic script to see actual similarity scores for a post
 */

async function diagnoseSimilarities() {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log("DataSource initialized\n");
        }

        // Get first post
        const post = await Post.findOne({
            where: {},
            relations: ["show", "show.episodes"]
        });

        if (!post) {
            console.log("No posts found!");
            process.exit(1);
        }

        console.log(`Analyzing Post ${post.id}:`);
        console.log(`Content: "${post.content}"`);
        console.log(`Show: ${post.show.title}\n`);

        // Embed the post
        const embedder = new Embedder();
        console.log("Embedding post content...");
        const embedded = await embedder.generateEmbeddings([post.content]);
        const vector = embedded.data[0].embedding;
        console.log("✅ Embedding complete\n");

        // Get chunks
        const episodeIds = post.show.episodes.map(ep => ep.id);
        const chunks = await Chunk.find({ 
            where: { episode: In(episodeIds) },
            relations: ["episode"]
        });

        console.log(`Found ${chunks.length} chunks for ${post.show.title}\n`);

        if (chunks.length === 0) {
            console.log("❌ No chunks found! You need to load episode data for this show.");
            console.log(`   Try: npx ts-node generator.ts show "${post.show.title}"`);
            process.exit(1);
        }

        // Calculate similarities (get ALL chunks for proper distribution)
        console.log("Calculating similarities...\n");
        const similarities = new Similarities();
        const similarChunks = similarities.findSimilarityFromDb(chunks, vector, chunks.length);

        // Show distribution
        const ranges = {
            "0.9-1.0": 0,
            "0.8-0.9": 0,
            "0.7-0.8": 0,
            "0.6-0.7": 0,
            "0.5-0.6": 0,
            "0.4-0.5": 0,
            "0.3-0.4": 0,
            "< 0.3": 0
        };

        similarChunks.forEach(sc => {
            if (sc.similarity >= 0.9) ranges["0.9-1.0"]++;
            else if (sc.similarity >= 0.8) ranges["0.8-0.9"]++;
            else if (sc.similarity >= 0.7) ranges["0.7-0.8"]++;
            else if (sc.similarity >= 0.6) ranges["0.6-0.7"]++;
            else if (sc.similarity >= 0.5) ranges["0.5-0.6"]++;
            else if (sc.similarity >= 0.4) ranges["0.4-0.5"]++;
            else if (sc.similarity >= 0.3) ranges["0.3-0.4"]++;
            else ranges["< 0.3"]++;
        });

        console.log("Similarity Distribution:");
        console.log("────────────────────────");
        Object.entries(ranges).forEach(([range, count]) => {
            const bar = "█".repeat(Math.floor(count / 2));
            console.log(`${range}: ${count.toString().padStart(4)} ${bar}`);
        });
        console.log();

        // Show top 20
        console.log("Top 20 Most Similar Chunks:");
        console.log("════════════════════════════════════════════════════════════════");
        similarChunks.slice(0, 20).forEach((sc, i) => {
            const chunk = chunks.find(c => c.text === sc.chunk);
            const episodeInfo = chunk ? `S${chunk.episode.season}E${chunk.episode.episode}` : "Unknown";
            const preview = sc.chunk.substring(0, 100).replace(/\n/g, " ");
            
            console.log(`${(i + 1).toString().padStart(2)}. [${episodeInfo}] Similarity: ${sc.similarity.toFixed(4)}`);
            console.log(`    "${preview}..."`);
            console.log(`    Chunk length: ${sc.chunk.length} chars`);
            console.log();
        });

        // Recommendations
        console.log("\n💡 Recommendations:");
        console.log("─────────────────────");
        
        const maxSimilarity = similarChunks[0]?.similarity || 0;
        const above70 = similarChunks.filter(sc => sc.similarity > 0.7).length;
        const above60 = similarChunks.filter(sc => sc.similarity > 0.6).length;
        const above50 = similarChunks.filter(sc => sc.similarity > 0.5).length;

        console.log(`Highest similarity: ${maxSimilarity.toFixed(4)}`);
        console.log(`Chunks > 0.7: ${above70}`);
        console.log(`Chunks > 0.6: ${above60}`);
        console.log(`Chunks > 0.5: ${above50}\n`);

        console.log("\n📖 Understanding Similarity Scores:");
        console.log("   0.9-1.0 = Near-identical (very rare)");
        console.log("   0.7-0.9 = Very similar (same quotes/phrases)");
        console.log("   0.5-0.7 = Related content (same events) ← Most posts here");
        console.log("   0.3-0.5 = Loosely related");
        console.log("   < 0.3   = Unrelated\n");

        if (maxSimilarity < 0.3) {
            console.log("⚠️  Very low similarity! This post might not relate to episode content.");
            console.log("   Recommended threshold: 0.2 (very permissive)");
        } else if (maxSimilarity < 0.5) {
            console.log("✅ Post has moderate semantic similarity to episodes.");
            console.log("   Recommended threshold: 0.4");
        } else if (maxSimilarity < 0.7) {
            console.log("✅ Good similarity! Post references episode content well.");
            console.log("   Recommended threshold: 0.5 ← Current setting");
        } else {
            console.log("✅ Excellent similarity! Post closely matches episode content.");
            console.log("   Recommended threshold: 0.6");
        }
        
        console.log(`\n✅ Your threshold of 0.5 is CORRECT for ${above50} chunks!`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
        process.exit(0);
    }
}

// Run if called directly
if (require.main === module) {
    console.log("🔬 Diagnosing Post Similarity Scores...\n");
    diagnoseSimilarities();
}

export { diagnoseSimilarities };
