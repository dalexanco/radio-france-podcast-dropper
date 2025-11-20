import { fetchShow } from "./shows";
import { fetchEpisodes, Episode } from "./episodes";
import { downloadEpisode } from "../utils/download";
import { logger } from "../utils/logger";
import { EmissionConfig } from "../utils/syncList";

export interface SyncResult {
  podcastTitle: string;
  url: string;
  totalEpisodes: number;
  existingEpisodes: number;
  downloadedEpisodes: number;
  failedEpisodes: number;
  errors: Array<{ episode: string; error: string }>;
}

export interface SyncPlan {
  podcastTitle: string;
  url: string;
  totalEpisodes: number;
  existingEpisodes: number;
  episodesToDownload: Episode[];
}

export interface SyncAnalysis {
  plans: SyncPlan[];
  totalToDownload: number;
}

/**
 * Analyzes what needs to be synced without downloading
 * @param emissionConfigs - Array of emission configurations
 * @param outputPath - Output directory path
 * @returns Analysis with plans for each podcast
 */
export async function analyzeSync(
  emissionConfigs: EmissionConfig[],
  outputPath: string
): Promise<SyncAnalysis> {
  logger.debug(
    { count: emissionConfigs.length },
    "#analyzeSync Starting sync analysis"
  );

  const plans: SyncPlan[] = [];
  let totalToDownload = 0;

  // Analyze each podcast sequentially
  for (const config of emissionConfigs) {
    try {
      const { url, count } = config;
      logger.debug({ url, count }, "#analyzeSync Analyzing podcast");

      // Fetch show information
      const show = await fetchShow(url);
      if (!show) {
        logger.debug({ url }, "#analyzeSync Show not found, skipping");
        continue;
      }

      // Fetch episodes
      const episodes = await fetchEpisodes(url, show.title, outputPath, count);

      // Find episodes to download
      const episodesToDownload = episodes.filter(
        (e) => e.podcastStatus === "available"
      );

      const plan: SyncPlan = {
        podcastTitle: show.title,
        url,
        totalEpisodes: episodes.length,
        existingEpisodes: episodes.filter(
          (e) => e.podcastStatus === "existing"
        ).length,
        episodesToDownload,
      };

      plans.push(plan);
      totalToDownload += episodesToDownload.length;

      logger.debug(
        {
          title: show.title,
          total: plan.totalEpisodes,
          existing: plan.existingEpisodes,
          toDownload: episodesToDownload.length,
        },
        "#analyzeSync Podcast analysis completed"
      );
    } catch (error) {
      logger.error("#analyzeSync Failed to analyze podcast", error, {
        url: config.url,
      });
      // Continue with other podcasts even if one fails
    }
  }

  logger.debug(
    { podcasts: plans.length, totalToDownload },
    "#analyzeSync Analysis completed"
  );

  return { plans, totalToDownload };
}

/**
 * Downloads episodes for a single podcast with progress callback
 * @param plan - Sync plan for the podcast
 * @param outputPath - Output directory path
 * @param onProgress - Callback for progress updates (current, total, episodeTitle)
 * @returns Sync result with statistics
 */
export async function downloadPodcastEpisodes(
  plan: SyncPlan,
  outputPath: string,
  onProgress?: (current: number, total: number, episodeTitle: string) => void
): Promise<SyncResult> {
  const { url, podcastTitle, episodesToDownload } = plan;
  logger.debug({ url, podcastTitle }, "#downloadPodcastEpisodes Starting downloads");

  const result: SyncResult = {
    podcastTitle,
    url,
    totalEpisodes: plan.totalEpisodes,
    existingEpisodes: plan.existingEpisodes,
    downloadedEpisodes: 0,
    failedEpisodes: 0,
    errors: [],
  };

  // Download episodes sequentially
  for (let i = 0; i < episodesToDownload.length; i++) {
    const episode = episodesToDownload[i];
    try {
      if (onProgress) {
        onProgress(i + 1, episodesToDownload.length, episode.title);
      }

      logger.debug(
        { title: episode.title },
        `#downloadPodcastEpisodes Downloading episode: ${episode.title}`
      );
      await downloadEpisode(episode, outputPath, podcastTitle);
      result.downloadedEpisodes++;
      logger.debug(
        { title: episode.title },
        `#downloadPodcastEpisodes Successfully downloaded: ${episode.title}`
      );
    } catch (error) {
      result.failedEpisodes++;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      result.errors.push({
        episode: episode.title,
        error: errorMessage,
      });
      logger.error(
        `#downloadPodcastEpisodes Failed to download episode: ${episode.title}`,
        error,
        { episodeTitle: episode.title }
      );
    }
  }

  logger.debug(
    {
      title: podcastTitle,
      downloaded: result.downloadedEpisodes,
      failed: result.failedEpisodes,
    },
    "#downloadPodcastEpisodes Downloads completed"
  );

  return result;
}

/**
 * Downloads episodes for all podcasts in the plan
 * @param plans - Array of sync plans
 * @param outputPath - Output directory path
 * @param onProgress - Callback for overall progress (podcastIndex, totalPodcasts, episodeProgress)
 * @returns Array of sync results
 */
export async function downloadAllEpisodes(
  plans: SyncPlan[],
  outputPath: string,
  onProgress?: (
    podcastIndex: number,
    totalPodcasts: number,
    episodeCurrent: number,
    episodeTotal: number,
    episodeTitle: string,
    podcastTitle: string
  ) => void
): Promise<SyncResult[]> {
  logger.debug(
    { count: plans.length },
    "#downloadAllEpisodes Starting downloads for all podcasts"
  );

  const results: SyncResult[] = [];

  // Download podcasts sequentially
  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i];
    const episodeProgress = (
      current: number,
      total: number,
      episodeTitle: string
    ) => {
      if (onProgress) {
        onProgress(i, plans.length, current, total, episodeTitle, plan.podcastTitle);
      }
    };

    try {
      const result = await downloadPodcastEpisodes(
        plan,
        outputPath,
        episodeProgress
      );
      results.push(result);
    } catch (error) {
      // Create a failed result entry
      results.push({
        podcastTitle: plan.podcastTitle,
        url: plan.url,
        totalEpisodes: plan.totalEpisodes,
        existingEpisodes: plan.existingEpisodes,
        downloadedEpisodes: 0,
        failedEpisodes: 0,
        errors: [
          {
            episode: "N/A",
            error: error instanceof Error ? error.message : String(error),
          },
        ],
      });
      logger.error("#downloadAllEpisodes Failed to download podcast", error, {
        url: plan.url,
      });
    }
  }

  logger.debug(
    { completed: results.length },
    "#downloadAllEpisodes Completed downloads for all podcasts"
  );

  return results;
}

// Legacy function for backward compatibility
export async function syncPodcast(
  emissionConfig: EmissionConfig,
  outputPath: string
): Promise<SyncResult> {
  const { url, count } = emissionConfig;
  logger.debug({ url, count }, "#syncPodcast Starting podcast sync");

  const show = await fetchShow(url);
  if (!show) {
    throw new Error(`Show not found for URL: ${url}`);
  }

  const episodes = await fetchEpisodes(url, show.title, outputPath, count);
  const episodesToDownload = episodes.filter(
    (e) => e.podcastStatus === "available"
  );

  const plan: SyncPlan = {
    podcastTitle: show.title,
    url,
    totalEpisodes: episodes.length,
    existingEpisodes: episodes.filter((e) => e.podcastStatus === "existing")
      .length,
    episodesToDownload,
  };

  return downloadPodcastEpisodes(plan, outputPath);
}

export async function syncPodcasts(
  emissionConfigs: EmissionConfig[],
  outputPath: string
): Promise<SyncResult[]> {
  const analysis = await analyzeSync(emissionConfigs, outputPath);
  return downloadAllEpisodes(analysis.plans, outputPath);
}
