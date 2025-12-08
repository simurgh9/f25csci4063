import axios from "axios";
import * as cheerio from "cheerio";
import { ScrapingResponse } from "types/scraping";

const BASE_URL = "https://transcripts.foreverdreaming.org";
const TV_SHOW_PAGE_URL = "https://transcripts.foreverdreaming.org/viewforum.php?f=1662";

interface ShowSearchResult {
	title: string;
	forumId: string;
	topicCount: number;
}

interface EpisodeListing {
	topicId: string;
	episodeCode: string;
	title: string;
}

export async function scrapeOverview(pageExtension: number) {
	try {
		const link = `${BASE_URL}/viewforum.php?f=${pageExtension}`;
		const { data } = await axios.get(link);
		const selector = cheerio.load(data);

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

export async function findShowByTitle(showTitle: string): Promise<ShowSearchResult | null> {
	try {
		const { data } = await axios.get(TV_SHOW_PAGE_URL, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
			}
		});

		const $ = cheerio.load(data);
		let foundShow: ShowSearchResult | null = null;

		// Search through all forum listings - they're in <dl class="row-item forum_read"> elements
		$('dl.row-item').each((_, element) => {
			// The title is in a <dt> > <div class="list-inner"> > <a> with class "forumtitle"
			const titleElement = $(element).find('a.forumtitle');
			const title = titleElement.text().trim();
			
			// Case-insensitive search
			if (title.toLowerCase().includes(showTitle.toLowerCase())) {
				const forumLink = titleElement.attr('href');
				
				// Topics count is in <dd class="topics">
				const topicCountText = $(element).find('dd.topics').text().trim();
				
				if (forumLink) {
					// Extract forum ID from URL (e.g., ./viewforum.php?f=1234)
					const forumIdMatch = forumLink.match(/f=(\d+)/);
					if (forumIdMatch) {
						foundShow = {
							title: title,
							forumId: forumIdMatch[1],
							topicCount: parseInt(topicCountText.replace(/\D/g, '')) || 0
						};
						console.log(`Found show match: ${title} (ID: ${forumIdMatch[1]})`);
						return false; // Break the loop
					}
				}
			}
		});

		if (!foundShow) {
			console.log(`No show found matching: "${showTitle}"`);
			// List available shows for debugging
			console.log('\nAvailable shows:');
			$('dl.row-item').each((_, element) => {
				const title = $(element).find('dt.icon a.forum-title').text().trim();
				if (title) console.log(`  - ${title}`);
			});
		}

		return foundShow;
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Show search error:", error.message);
			throw error;
		}
		throw error;
	}
}

export async function getAllEpisodesForShow(forumId: string): Promise<EpisodeListing[]> {
	try {
		const episodes: EpisodeListing[] = [];
		const seenTopicIds = new Set<string>(); // Track duplicates
		let page = 0;
		let hasMorePages = true;

		while (hasMorePages) {
			const url = page === 0 
				? `${BASE_URL}/viewforum.php?f=${forumId}`
				: `${BASE_URL}/viewforum.php?f=${forumId}&start=${page * 50}`;

			console.log(`Fetching page ${page + 1}...`);
			
			await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting

			const { data } = await axios.get(url, {
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
				}
			});

			const $ = cheerio.load(data);
			let foundOnThisPage = 0;

			// Find all topic rows - they're in <dl class="row-item"> elements
			$('dl.row-item').each((_, element) => {
				// Topic title is in <dt> > <div class="list-inner"> > <a class="topictitle">
				const titleElement = $(element).find('a.topictitle');
				const topicLink = titleElement.attr('href');
				const fullTitle = titleElement.text().trim();

				// Extract episode code (e.g., "01x03") from title
				const episodeMatch = fullTitle.match(/^(\d+x\d+)/);
				
				if (topicLink && episodeMatch) {
					const topicIdMatch = topicLink.match(/t=(\d+)/);
					if (topicIdMatch) {
						const topicId = topicIdMatch[1];
						
						// Skip if we've already seen this topic
						if (!seenTopicIds.has(topicId)) {
							seenTopicIds.add(topicId);
							episodes.push({
								topicId: topicId,
								episodeCode: episodeMatch[1],
								title: fullTitle
							});
							foundOnThisPage++;
						}
					}
				}
			});

			console.log(`Found ${foundOnThisPage} new episodes on page ${page + 1} (total: ${episodes.length})`);

			// If we found no new episodes on this page, we're probably done
			if (foundOnThisPage === 0) {
				console.log('No new episodes found, stopping pagination');
				hasMorePages = false;
				break;
			}

			// Check if there's a next page - look for pagination
			const pagination = $('.pagination');
			const nextButton = pagination.find('a.button[rel="next"]');
			
			// If there's a "Next" button, there are more pages
			hasMorePages = nextButton.length > 0;
			page++;
			
			// Safety limit to prevent infinite loops
			if (page > 20) {
				console.warn('Reached page limit of 20, stopping pagination');
				hasMorePages = false;
			}
		}

		console.log(`Total unique episodes found: ${episodes.length}`);
		return episodes;
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Episode listing error:", error.message);
			throw error;
		}
		throw error;
	}
}

export async function scrapeAllEpisodesForShow(showTitle: string): Promise<string[]> {
	try {
		console.log(`Searching for show: ${showTitle}`);
		const show = await findShowByTitle(showTitle);
		
		if (!show) {
			throw new Error(`Show "${showTitle}" not found`);
		}

		console.log(`Found show: ${show.title} (Forum ID: ${show.forumId}, ${show.topicCount} topics)`);
		
		const episodes = await getAllEpisodesForShow(show.forumId);
		console.log(`Found ${episodes.length} episodes`);

		// Return array of topic IDs for processing
		return episodes.map(ep => ep.topicId);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Show scraping error:", error.message);
			throw error;
		}
		throw error;
	}
}

export async function scrapeTranscript(topicId: string): Promise<ScrapingResponse> {
	try {
		const link = `${BASE_URL}/viewtopic.php?t=${topicId}`;
		
		await new Promise(resolve => setTimeout(resolve, 1000));
		
		const { data } = await axios.get(link, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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
		}
		throw error;
	}
}