import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://transcripts.foreverdreaming.org";

export async function scrapeOverview(pageExtension: number) {
	try {
		const link = `${BASE_URL}/viewforum.php?f=${pageExtension}`;
		const { data } = await axios.get(link);
		const selector = cheerio.load(data);

		// find the h2 that designates where the episodes start so we don't take topic titles from announcements
		const episodesH2 = selector("h2").filter((_, el) => selector(el).text().trim() === "Topics");

		// Build an array of { title, url, topicId }
		const episodes = episodesH2
			.nextAll(".topics")
			.find(".topictitle")
			.map((_, el) => {
				const title = selector(el).text().trim();
				const relativeHref = selector(el).attr("href"); // e.g. ./viewtopic.php?t=12345
				const absoluteUrl = new URL(relativeHref!, BASE_URL).href;
				const topicId = new URL(absoluteUrl).searchParams.get("t"); // extract just the t=xxxx
				return { title, url: absoluteUrl, topicId };
			})
			.get();

		return {
			showName: selector(".forum-title").text().trim(),
			episodes,
		};
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Scraping error:", error.message);
			throw error;
		} else {
			console.error("Scraping error:", "an unknown error occurred");
			throw error;
		}
	}
}

export async function scrapeTranscript(topicId: string) {
	try {
		const link = `${BASE_URL}/viewtopic.php?t=${topicId}`;
		const { data } = await axios.get(link);

		const selector = cheerio.load(data);
		const episodeTitle = selector(".topic-title").first().text().trim();
		const transcript = selector("div.content").text().trim();

		return { episodeTitle, transcript };
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Scraping error:", error.message);
			throw error;
		} else {
			console.error("Scraping error:", "an unknown error occurred");
			throw error;
		}
	}
}

// New function to scrape ALL episodes + transcripts
export async function scrapeAllTranscripts(pageExtension: number) {
	const { showName, episodes } = await scrapeOverview(pageExtension);
	console.log(`Found ${episodes.length} episodes for ${showName}. Scraping transcripts...`);

	const results = [];
	for (const ep of episodes) {
		console.log(`Scraping: ${ep.title}`);
		if (!ep.topicId) continue; // safety check
		const transcriptData = await scrapeTranscript(ep.topicId);
		results.push({ ...ep, ...transcriptData });
	}

	return { showName, episodes: results };
}

if (require.main === module) {
	(async () => {
		const [, , type, id] = process.argv;
		if (type === "overview") {
			console.log(await scrapeOverview(Number(id)));
		} else if (type === "transcript") {
			console.log(await scrapeTranscript(id));
		} else if (type === "all") {
			console.log(await scrapeAllTranscripts(Number(id)));
		} else {
			console.log("Usage: npx ts-node scraper.ts <overview|transcript|all> <pageExtensionOrTopicId>");
		}
	})();
}
