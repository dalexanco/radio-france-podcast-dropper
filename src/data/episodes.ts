import { getEpisodeFilePath } from "../utils/download";
import { fetchEpisodesByUrl } from "./graphql";

export interface Episode {
  id: string;
  title: string;
  podcastUrl: string;
  podcastPublishedDate: string;
  pageUrl?: string;
  podcastPlayerUrl?: string;
  podcastFilePath?: string;
}

export async function fetchEpisodes(
  url: string,
  podcastName: string | undefined = undefined,
  first: number = 10
): Promise<Episode[]> {
  const data = await fetchEpisodesByUrl(url, first);

  return data
    .filter(
      (edge) =>
        edge.node.title !== null &&
        edge.node.podcastEpisode !== null &&
        edge.node.podcastEpisode?.url !== null &&
        edge.node.published_date !== null
    )
    .map((edge) => {
      const episode: Episode = {
        id: edge.node.id,
        title: edge.node.title,
        podcastUrl: edge.node.podcastEpisode?.url || "",
        podcastPublishedDate: edge.node.published_date || "",
        pageUrl: edge.node.url,
        podcastPlayerUrl: edge.node.podcastEpisode?.playerUrl || "",
      };
      if (podcastName) { 
        episode.podcastFilePath = getEpisodeFilePath(episode, podcastName);
      }
      return episode;
    });
}
