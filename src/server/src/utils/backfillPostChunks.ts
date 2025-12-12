import { AppDataSource } from "../model/datasource";
import { Post } from "../model/entities/post";
import { PostEmbeddingService } from "../services/postEmbeddingService";

/**
 * Script to backfill PostChunk relationships for existing posts
 * Run this once after deploying the optimization
 */

async function backfillPostSimilarities() {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log("DataSource initialized");
        }

        console.log("Fetching all posts...");
        const posts = await Post.find({ 
            relations: ["show", "show.episodes"],
            order: { createdAt: "DESC" }
        });

        console.log(`Found ${posts.length} posts to process\n`);

        if (posts.length === 0) {
            console.log("No posts found. Create some posts first!");
            process.exit(0);
        }

        // Import PostChunk to check for existing relationships
        const { PostChunk } = await import("../model/entities/postChunk");

        const postEmbeddingService = new PostEmbeddingService();
        let processed = 0;
        let skipped = 0;
        let failed = 0;

        for (const post of posts) {
            try {
                // Check if post already has PostChunk relationships
                const existingCount = await PostChunk.count({
                    where: { post: { id: post.id } }
                });

                if (existingCount > 0) {
                    console.log(`⏭️  Skipping post ${post.id} - already has ${existingCount} chunks (${skipped + 1} skipped)`);
                    skipped++;
                    continue;
                }

                console.log(`Processing post ${post.id} (${processed + 1}/${posts.length - skipped})...`);
                await postEmbeddingService.computeAndStoreSimilarities(post);
                processed++;
            } catch (error) {
                console.error(`Failed to process post ${post.id}:`, error);
                failed++;
            }
        }

        console.log("\n=== Backfill Complete ===");
        console.log(`✅ Successfully processed: ${processed}`);
        console.log(`⏭️  Skipped (already processed): ${skipped}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📊 Total: ${posts.length}`);

    } catch (error) {
        console.error("Backfill error:", error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
        process.exit(0);
    }
}

// Run if called directly
if (require.main === module) {
    console.log("🚀 Starting PostChunk backfill...\n");
    backfillPostSimilarities();
}

export { backfillPostSimilarities };
