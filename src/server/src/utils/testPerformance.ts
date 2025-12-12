import { AppDataSource } from "../model/datasource";
import { User } from "../model/entities/User";
import { Post } from "../model/entities/post";
import { SpoilerService } from "../services/spoilerService";
import { GeminiController } from "../controllers/llm/geminiController";
import { In, LessThan, Not } from "typeorm";

/**
 * Performance comparison script
 * Compares old LLM-based approach vs new optimized approach
 */

async function comparePerformance() {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log("DataSource initialized\n");
        }

        // Get a test user
        const user = await User.findOne({
            where: {},
            relations: ["shows", "subscriptions", "subscriptions.show", "subscriptions.currentEpisode"]
        });

        if (!user) {
            console.log("No users found. Create a user first!");
            process.exit(0);
        }

        console.log(`Testing with user: ${user.username || user.fireBaseId}\n`);

        const showIds = user.shows.map(show => show.id);
        const limit = 10;
        const cursor = new Date();
        cursor.setHours(cursor.getHours() + 6);

        // Fetch posts
        const posts = await Post.find({
            where: { 
                show: In(showIds),
                createdAt: LessThan(cursor),
                user: { fireBaseId: Not(user.fireBaseId) }
            },
            relations: ["show", "show.episodes", "user"],
            order: { createdAt: "DESC" },
            take: limit
        });

        console.log(`Found ${posts.length} posts to check\n`);

        if (posts.length === 0) {
            console.log("No posts found. Create some posts first!");
            process.exit(0);
        }

        // Test OLD approach (LLM-based)
        console.log("=== OLD APPROACH (LLM-based) ===");
        const geminiController = new GeminiController();
        const startOld = Date.now();
        const oldResults = await geminiController.checkSpoiler(posts, user);
        const endOld = Date.now();
        const oldTime = endOld - startOld;
        console.log(`⏱️  Time: ${oldTime}ms`);
        console.log(`📊 Results: ${oldResults.filter(r => r.spoiler === 1).length} spoilers, ${oldResults.filter(r => r.spoiler === 0).length} safe\n`);

        // Test NEW approach (Optimized Hybrid: Pre-computed chunks + LLM)
        console.log("=== NEW APPROACH (Optimized Hybrid) ===");
        const spoilerService = new SpoilerService();
        const startNew = Date.now();
        
        const newResults = await spoilerService.checkSpoilersOptimized(posts, user);
        
        const endNew = Date.now();
        const newTime = endNew - startNew;
        console.log(`⏱️  Time: ${newTime}ms`);
        console.log(`📊 Results: ${newResults.filter(r => r.spoiler === 1).length} spoilers, ${newResults.filter(r => r.spoiler === 0).length} safe\n`);

        // Compare
        console.log("=== COMPARISON ===");
        const speedup = Math.round((oldTime / newTime) * 10) / 10;
        const timeSaved = oldTime - newTime;
        console.log(`⚡ Speedup: ${speedup}x faster`);
        console.log(`⏰ Time saved: ${timeSaved}ms`);
        console.log(`� Optimization: Pre-computed chunks (no embedding/similarity calc at request time)`);
        console.log(`   Both use LLM for classification, but new approach skips expensive computations\n`);

        // Check for differences
        let differences = 0;
        for (let i = 0; i < posts.length; i++) {
            if (oldResults[i].spoiler !== newResults[i].spoiler) {
                differences++;
                console.log(`⚠️  Difference found for post ${posts[i].id}:`);
                console.log(`   Old: ${oldResults[i].spoiler}, New: ${newResults[i].spoiler}`);
            }
        }

        if (differences === 0) {
            console.log("✅ Perfect match! Both approaches gave identical results.");
        } else {
            console.log(`⚠️  Found ${differences} differences between approaches.`);
            console.log("   This may be due to LLM non-determinism or different logic.");
        }

    } catch (error) {
        console.error("Performance test error:", error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
        process.exit(0);
    }
}

// Run if called directly
if (require.main === module) {
    console.log("🔬 Starting performance comparison...\n");
    comparePerformance();
}

export { comparePerformance };
