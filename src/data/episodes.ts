import { getEpisodeFilePath } from "../utils/download";
import { scanOutputDirectory } from "../utils/scanDownloads";
import { fetchEpisodesByUrl } from "./graphql";
import { logger } from "../utils/logger";

export type EpisodePodcastStatus = "available" | "existing";
export interface Episode {
  id: string;
  title: string;
  podcastUrl: string;
  podcastPublishedDate: string;
  pageUrl?: string;
  podcastPlayerUrl?: string;
  podcastFilePath?: string;
  podcastStatus?: EpisodePodcastStatus;
}

export async function fetchEpisodes(
  url: string,
  podcastName: string,
  outputPath: string,
  count: number
): Promise<Episode[]> {
  try {
    const startTime = Date.now();

    logger.debug(
      { url, podcastName, outputPath, first: count },
      "#fetchEpisodes Fetching episodes"
    );
    const data = await fetchEpisodesByUrl(url, count);
    logger.debug(
      { data: data.length },
      "#fetchEpisodes Fetched episodes from GraphQL API"
    );

    logger.debug(
      { outputPath },
      "#fetchEpisodes Scanning output directory for existing episodes"
    );
    const existingEpisodes = await scanOutputDirectory(outputPath);
    logger.debug(
      { count: existingEpisodes.length },
      "#fetchEpisodes Found existing episode files"
    );

    const episodes = data
      .filter(
        (edge) =>
          edge.node &&
          edge.node.title !== null &&
          edge.node.podcastEpisode !== null &&
          edge.node.podcastEpisode?.url !== null &&
          edge.node.published_date !== null
      )
      .map((edge) => {
        const node = edge.node!; // Safe after filter
        const episode: Episode = {
          id: node.id,
          title: node.title,
          podcastUrl: node.podcastEpisode?.url || "",
          podcastPublishedDate: node.published_date || "",
          pageUrl: node.url,
          podcastPlayerUrl: node.podcastEpisode?.playerUrl || "",
        };
        if (podcastName) {
          episode.podcastFilePath = getEpisodeFilePath(episode, podcastName);
          const hasFile = existingEpisodes.includes(episode.podcastFilePath!);
          episode.podcastStatus = hasFile ? "existing" : "available";
        }
        return episode;
      });

    const duration = Date.now() - startTime;
    const existingCount = episodes.filter(
      (e) => e.podcastStatus === "existing"
    ).length;
    const availableCount = episodes.filter(
      (e) => e.podcastStatus === "available"
    ).length;

    logger.debug(
      {
        url,
        podcastName,
        total: episodes.length,
        existing: existingCount,
        available: availableCount,
        duration: `${duration}ms`,
      },
      "#fetchEpisodes Fetch episodes succeeded"
    );

    return episodes;
  } catch (error) {
    logger.error("#fetchEpisodes Failed to fetch episodes", error, {
      url,
      podcastName,
      outputPath,
      first: count,
    });
    throw error;
  }
}
