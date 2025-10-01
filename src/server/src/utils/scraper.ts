import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapingResponse{
	title: string, 
	episodeTitle: string,
	season: number,
	episode: number,
	transcript: string
}

const BASE_URL = "https://transcripts.foreverdreaming.org";

export async function scrapeOverview(pageExtension: number) {
	try {
		const link = `${BASE_URL}/viewforum.php?f=${pageExtension}`;
		const { data } = await axios.get(link);
		const selector = cheerio.load(data);

		
		const episodesH2 = selector("h2").filter((_, el) => selector(el).text().trim() === "Topics");

		return {
			showName: selector(".forum-title").text().trim(),
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

export async function scrapeTranscript(topicId: string): Promise<ScrapingResponse> {
	try {
		const link = `${BASE_URL}/viewtopic.php?t=${topicId}`;
		
		// Add delay to avoid rate limiting
		await new Promise(resolve => setTimeout(resolve, 1000));
		
		const { data } = await axios.get(link, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
				'Accept-Language': 'en-US,en;q=0.9',
				'Accept-Encoding': 'gzip, deflate, br',
				'Connection': 'keep-alive',
				'Upgrade-Insecure-Requests': '1',
				'Sec-Fetch-Dest': 'document',
				'Sec-Fetch-Mode': 'navigate',
				'Sec-Fetch-Site': 'none',
				'Cache-Control': 'max-age=0',
				'Referer': `${BASE_URL}/`
			}
		});

		const selector = cheerio.load(data);
		const title = selector("#nav-breadcrumbs > li.breadcrumbs > span:nth-child(4) > a > span")
		.first()
		.text()
		.trim();
		const episodeTitleSelector = selector(".topic-title").first().text().trim();
		const transcript = selector("div.content").text().trim();
		const parts = episodeTitleSelector.split(" ");
		const episodeTitle = parts.slice(2).join(" ");
		const [season, episode] = parts[0].split("x").map(Number);

		return {
			title: title,
			episodeTitle: episodeTitle,
			season: season,
			episode: episode,
			transcript: transcript
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


// export async function scrapeAllTranscripts(pageExtension: number) {
// 	const { showName, episodes } = await scrapeOverview(pageExtension);
// 	console.log(`Found ${episodes.length} episodes for ${showName}. Scraping transcripts...`);

// 	const results = [];
// 	for (const ep of episodes) {
// 		if (!ep.topicId) continue; 
// 		const transcriptData = await scrapeTranscript(ep.topicId);
// 		results.push({ ...ep, ...transcriptData });
// 	}

// 	return { showName, episodes: results };
// }

if (require.main === module) {
	(async () => {
		const [, , type, id] = process.argv;
		if (type === "overview") {
			console.log(await scrapeOverview(Number(id)));
		} else if (type === "transcript") {
			const response = await scrapeTranscript(id);
			console.log(response);
		} else if (type === "all") {
			// console.log(await scrapeAllTranscripts(Number(id)));
		} else {
			console.log("Usage: npx ts-node scraper.ts <overview|transcript|all> <pageExtensionOrTopicId>");
		}
	})();
}
