import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://transcripts.foreverdreaming.org";

export async function scrapeOverview(pageExtension: number) {
	try {
		const link = `${BASE_URL}/viewforum.php?f=${pageExtension}`;
		const { data } = await axios.get(link);
		const selector = cheerio.load(data);

		
		const episodesH2 = selector("h2").filter((_, el) => selector(el).text().trim() === "Topics");

		const episodes = episodesH2
			.nextAll(".topics")
			.find(".topictitle")
			.map((_, el) => {
				const title = selector(el).text().trim();
				const relativeHref = selector(el).attr("href"); 
				const absoluteUrl = new URL(relativeHref!, BASE_URL).href;
				const topicId = new URL(absoluteUrl).searchParams.get("t"); 
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


export async function scrapeAllTranscripts(pageExtension: number) {
	const { showName, episodes } = await scrapeOverview(pageExtension);
	console.log(`Found ${episodes.length} episodes for ${showName}. Scraping transcripts...`);

	const results = [];
	for (const ep of episodes) {
		if (!ep.topicId) continue; 
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
			const { episodeTitle, transcript } = await scrapeTranscript(id);
		} else if (type === "all") {
			console.log(await scrapeAllTranscripts(Number(id)));
		} else {
			console.log("Usage: npx ts-node scraper.ts <overview|transcript|all> <pageExtensionOrTopicId>");
		}
	})();
}
