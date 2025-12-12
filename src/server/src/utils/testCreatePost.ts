import { AppDataSource } from "../model/datasource";
import { User } from "../model/entities/User";
import { Show } from "../model/entities/show";
import { Post } from "../model/entities/post";
import { PostChunk } from "../model/entities/postChunk";
import { PostEmbeddingService } from "../services/postEmbeddingService";

/**
 * Test script to create a post and verify PostChunk creation
 */

async function testCreatePost() {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log("DataSource initialized\n");
        }

        // Get first user and show
        const user = await User.findOne({ where: {} });
        const show = await Show.findOne({ 
            where: {},
            relations: ["episodes"]
        });

        if (!user || !show) {
            console.log("❌ Need at least one user and one show in the database!");
            process.exit(1);
        }

        console.log(`Creating post for user: ${user.username || user.fireBaseId}`);
        console.log(`Show: ${show.title}\n`);

        // Create a test post
        const post = Post.create({
            user: user,
            show: show,
            content: "This is a test post to verify the optimization works! It should reference something from the show."
        });

        await post.save();
        console.log(`✅ Post created with ID: ${post.id}\n`);

        // Compute similarities
        console.log("Computing similarities...");
        const postEmbeddingService = new PostEmbeddingService();
        await postEmbeddingService.computeAndStoreSimilarities(post);
        console.log("✅ Similarities computed\n");

        // Check what was created
        const postChunks = await PostChunk.find({
            where: { post: { id: post.id } },
            relations: ["chunk", "chunk.episode"],
            order: { similarity: "DESC" }
        });

        console.log(`📊 Created ${postChunks.length} PostChunk relationships:\n`);

        if (postChunks.length === 0) {
            console.log("⚠️  No high-similarity chunks found (similarity threshold is > 0.7)");
            console.log("   This might mean:");
            console.log("   1. The post content doesn't match episode content well");
            console.log("   2. The show has no chunks/episodes");
            console.log("   3. The similarity threshold is too high\n");
        } else {
            postChunks.forEach((pc, i) => {
                console.log(`${i + 1}. Episode S${pc.chunk.episode.season}E${pc.chunk.episode.episode}`);
                console.log(`   Similarity: ${pc.similarity.toFixed(4)}`);
                console.log(`   Chunk preview: ${pc.chunk.text.substring(0, 100)}...`);
                console.log();
            });
        }

        console.log("✅ Test complete!");

    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
        process.exit(0);
    }
}

// Run if called directly
if (require.main === module) {
    console.log("🧪 Testing post creation with optimization...\n");
    testCreatePost();
}

export { testCreatePost };
