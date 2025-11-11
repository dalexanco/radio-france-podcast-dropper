import fetch from "node-fetch";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { DiffusionEdge } from "../api/graphql.js";
import { HttpProxyAgent } from "http-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";

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

export async function downloadEpisode(
  episode: DiffusionEdge,
  targetPath?: string,
  podcastName?: string
): Promise<string> {
  // Try podcastEpisode.url first, then playerUrl as fallback
  const mp3Url = episode.node.podcastEpisode?.url || episode.node.podcastEpisode?.playerUrl;
  
  if (!mp3Url) {
    throw new Error("No MP3 URL available for this episode");
  }

  // Use provided target path or default to "downloads" in current working directory
  const baseDownloadsDir = targetPath 
    ? targetPath 
    : join(process.cwd(), "downloads");

  // Sanitize podcast name for folder name
  const sanitizedPodcastName = podcastName
    ? podcastName
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase()
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 100)
    : "unknown-podcast";

  // Create podcast-specific directory
  const podcastDir = join(baseDownloadsDir, sanitizedPodcastName);
  await mkdir(podcastDir, { recursive: true });

  // Generate filename from episode title and date
  const dateStr = episode.node.published_date
    ? new Date(Number(episode.node.published_date) * 1000).toISOString().split("T")[0]
    : "unknown";
  const sanitizedTitle = episode.node.title
    .replace(/[^a-z0-9]/gi, "-")
    .toLowerCase()
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
  const filename = `${dateStr}_${sanitizedTitle}.mp3`;
  const filepath = join(podcastDir, filename);

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

