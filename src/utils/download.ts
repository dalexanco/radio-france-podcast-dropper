import fetch from "node-fetch";
import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { Episode } from "../data/episodes.js";
import { HttpProxyAgent } from "http-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";
import { sanitizeFilename } from "./sanitize.js";

const HTTP_PROXY = process.env.HTTP_PROXY || process.env.http_proxy;
const HTTPS_PROXY = process.env.HTTPS_PROXY || process.env.https_proxy;

// Normalize proxy URL - add http:// if protocol is missing
const normalizeProxyUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `http://${url}`;
};

// Create proxy agent if proxy is configured
const getProxyAgent = (url: string) => {
  const proxyUrl = url.startsWith("https://")
    ? normalizeProxyUrl(HTTPS_PROXY || HTTP_PROXY)
    : normalizeProxyUrl(HTTP_PROXY);

  if (!proxyUrl) {
    return undefined;
  }

  return url.startsWith("https://")
    ? new HttpsProxyAgent(proxyUrl)
    : new HttpProxyAgent(proxyUrl);
};

/**
 * Generates a filepath for an episode based on its metadata.
 * @param episode - The episode to generate a filepath for
 * @param targetPath - Optional target directory (defaults to "downloads" in current working directory)
 * @param podcastName - Optional podcast name for folder structure (defaults to "unknown-podcast")
 * @returns The full filepath where the episode should be saved
 */
export function getEpisodeFilePath(
  episode: Episode,
  podcastName?: string
): string {
  // Sanitize podcast name for folder name
  const podcastDir = podcastName
    ? sanitizeFilename(podcastName, 100)
    : "unknown-podcast";

  // Generate filename from episode title and date
  const dateStr = episode.podcastPublishedDate
    ? new Date(Number(episode.podcastPublishedDate) * 1000).toISOString().split("T")[0]
    : "unknown";
  const sanitizedTitle = sanitizeFilename(episode.title, 80);
  const filename = `${dateStr}-${sanitizedTitle}.mp3`;
  
  return join(podcastDir, filename);
}

export async function downloadEpisode(
  episode: Episode,
  targetPath?: string,
  podcastName?: string
): Promise<string> {
  // Try podcastUrl first, then podcastPlayerUrl as fallback
  const mp3Url = episode.podcastUrl || episode.podcastPlayerUrl;
  
  if (!mp3Url) {
    throw new Error("No MP3 URL available for this episode");
  }

  // Generate filepath for the episode
  const baseDownloadsDir = targetPath 
    ? targetPath 
    : join(process.cwd(), "downloads");
  const podcastPath = getEpisodeFilePath(episode, podcastName);
  const filepath = join(baseDownloadsDir, podcastPath);
  
  // Create podcast-specific directory
  const podcastDir = dirname(filepath);
  await mkdir(podcastDir, { recursive: true });

  // Download the file
  const agent = getProxyAgent(mp3Url);
  const response = await fetch(mp3Url, {
    agent: agent as any,
  });

  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText} (${response.status})`);
  }

  const buffer = await response.buffer();
  await writeFile(filepath, buffer);

  return filepath;
}

