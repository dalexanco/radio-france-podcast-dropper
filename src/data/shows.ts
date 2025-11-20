import { fetchShowByUrl, Emission } from "./graphql";
import { logger } from "../utils/logger";

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
  logger.debug({ url }, "#fetchShow Fetching show");
  try {
    const startTime = Date.now();

    const emission = await fetchShowByUrl(url);

    if (!emission) {
      logger.debug({ url }, "#fetchShow No emission found for URL");
      const duration = Date.now() - startTime;
      logger.debug(
        { url, found: false, duration: `${duration}ms` },
        "#fetchShow Fetch show completed"
      );
      return null;
    }

    logger.debug(
      {
        id: emission.id,
        title: emission.title,
        hasPersonalities: !!emission.personalitiesConnection,
        hasTaxonomies: !!emission.taxonomiesConnection,
      },
      "#fetchShow Processing emission data"
    );

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

    const show = {
      id: emission.id,
      title: emission.title,
      url: emission.url,
      standFirst: emission.standFirst,
      personalities,
      taxonomies,
      podcast: emission.podcast,
    };

    const duration = Date.now() - startTime;
    logger.debug(
      {
        url,
        showId: show.id,
        showTitle: show.title,
        personalitiesCount: personalities.length,
        taxonomiesCount: taxonomies.length,
        hasPodcast: !!show.podcast,
        duration: `${duration}ms`,
      },
      "#fetchShow Fetch show succeeded"
    );

    return show;
  } catch (error) {
    logger.error("#fetchShow Failed to fetch show", error, { url });
    throw error;
  }
}
