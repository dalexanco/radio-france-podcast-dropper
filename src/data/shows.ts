import { fetchShowByUrl, Emission } from "./graphql";

export interface Personality {
  name: string;
  relation?: string;
}

export interface Show {
  id: string;
  title: string;
  url: string;
  standFirst?: string;
  personalities: Personality[];
  taxonomies: string[];
  podcast?: {
    rss?: string;
    itunes?: string;
  };
}

/**
 * Fetches a show by URL and returns a simplified representation.
 * @param url - The URL of the show to fetch
 * @returns A simplified Show object without edges, containing only used fields
 */
export async function fetchShow(url: string): Promise<Show | null> {
  const emission = await fetchShowByUrl(url);

  if (!emission) {
    return null;
  }

  // Extract personalities
  const personalities =
    emission.personalitiesConnection?.edges
      .filter((edge) => edge.node.name)
      .map((edge) => ({
        name: edge.node.name,
        relation: edge.relation,
      })) || [];

  // Extract taxonomies
  const taxonomies =
    emission.taxonomiesConnection?.edges.map((edge) => edge.node.title) || [];

  return {
    id: emission.id,
    title: emission.title,
    url: emission.url,
    standFirst: emission.standFirst,
    personalities,
    taxonomies,
    podcast: emission.podcast,
  };
}
