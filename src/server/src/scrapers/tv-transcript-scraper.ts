import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeOverview(pageExtension: number) {
	try {
		const link = `https://transcripts.foreverdreaming.org/viewforum.php?f=${pageExtension}`;
		const { data } = await axios.get(link);

		const selector = cheerio.load(data);

		// find the h2 that designates where the episodes start so we don't take topic titles from the announcements section of the page
		const episodesH2 = selector("h2").filter((_, el) => selector(el).text().trim() === "Topics");

		console.log({
			showName: selector(".forum-title").text().trim(),
			episodes: episodesH2
				.nextAll(".topics") // find the topics list After the h2
				.find(".topictitle") // find nested topic titles
				.map((_, el) => selector(el).text().trim()) // get the text within each title element
				.get(), // get titles as a plain array
		});
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

export async function scrapeTranscript(pageExtension: number) {
	try {
		const link = `https://transcripts.foreverdreaming.org/viewtopic.php?t=${pageExtension}`;
		const { data } = await axios.get(link);

		const selector = cheerio.load(data);
		console.log({
			episodeTitle: selector(".topic-title").first().text().trim(),
			transcript: selector("div.content").text().trim(),
		});
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
