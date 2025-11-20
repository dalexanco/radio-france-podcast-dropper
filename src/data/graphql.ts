import { GraphQLClient } from "graphql-request";
import fetch from "node-fetch";
import { HttpProxyAgent } from "http-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";
import { logger } from "../utils/logger.js";

export interface Brand {
  id: string;
  title: string;
  baseline?: string;
}

export interface Theme {
  id: string;
  title: string;
  description?: string;
}

export interface TaxonomyNode {
  id: string;
  path?: string;
  type: string;
  title: string;
  standFirst?: string;
}

export interface TaxonomyEdge {
  relation: string;
  info?: string;
  node?: TaxonomyNode;
}

export interface PersonalityNode {
  id: string;
  name: string;
}

export interface PersonalityEdge {
  relation: string;
  info?: string;
  node?: PersonalityNode;
}

export interface PodcastEpisode {
  url?: string;
  playerUrl?: string;
  title?: string;
}

export interface DiffusionNode {
  id: string;
  title: string;
  url: string;
  published_date?: string;
  podcastEpisode?: PodcastEpisode;
}

export interface DiffusionEdge {
  cursor: string;
  node?: DiffusionNode;
}

export interface LocalDiffusionEdge extends DiffusionEdge {
  status: "existing" | "downloading" | "success" | "error";
  filepath?: string;
}

export interface Emission {
  id: string;
  title: string;
  url: string;
  standFirst?: string;
  podcast?: {
    rss?: string;
    itunes?: string;
  };
  taxonomiesConnection?: {
    edges: TaxonomyEdge[];
  };
  personalitiesConnection?: {
    edges: PersonalityEdge[];
  };
}

const GRAPHQL_URI =
  process.env.GRAPHQL_URI || "https://openapi.radiofrance.fr/v1/graphql";
const GRAPHQL_TOKEN = process.env.GRAPHQL_TOKEN!;
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
const getProxyAgent = () => {
  const proxyUrl = GRAPHQL_URI.startsWith("https://")
    ? normalizeProxyUrl(HTTPS_PROXY || HTTP_PROXY)
    : normalizeProxyUrl(HTTP_PROXY);

  if (!proxyUrl) {
    return undefined;
  }

  return GRAPHQL_URI.startsWith("https://")
    ? new HttpsProxyAgent(proxyUrl)
    : new HttpProxyAgent(proxyUrl);
};

const customFetch = (url: string | URL | Request, options?: RequestInit) => {
  const agent = getProxyAgent();
  logger.debug(
    {
      method: options?.method || "GET",
      hasProxy: !!agent,
      hasHeaders: !!options?.headers,
    },
    `Making HTTP request to: ${url}`
  );
  return fetch(
    url as any,
    {
      ...options,
      agent,
    } as any
  ) as any;
};

const client = new GraphQLClient(GRAPHQL_URI, {
  headers: {
    "x-token": GRAPHQL_TOKEN,
  },
  fetch: customFetch as any,
  errorPolicy: "all",
});

const BRANDS_QUERY = `
  query GetBrands {
    brands {
      id
      title
      baseline
    }
  }
`;

const THEMES_QUERY = `
  query GetThemes($brandId: ID!) {
    brand(id: $brandId) {
      themes {
        id
        title
        description
      }
    }
  }
`;

const SHOW_BY_URL_QUERY = `
  query GetShowByUrl($url: String!) {
    showByUrl(url: $url) {
      id
      title
      url
      standFirst
      podcast {
        rss
        itunes
      }
      taxonomiesConnection {
        edges {
          relation
          info
          node {
            id
            type
            title
            standFirst
          }
        }
      }
      personalitiesConnection {
        edges {
          relation
          info
          node {
            id
            name
          }
        }
      }
    }
  }
`;

const DIFFUSIONS_BY_URL_QUERY = `
  query GetDiffusionsByUrl($url: String!, $first: Int!) {
    diffusionsOfShowByUrl(url: $url, first: $first) {
      edges {
        cursor
        node {
          id
          title
          url
          published_date
          podcastEpisode {
            url
            playerUrl
            title
          }
        }
      }
    }
  }
`;

interface BrandsResponse {
  brands: Brand[];
}

interface ThemesResponse {
  brand: {
    themes: Theme[];
  };
}

interface ShowByUrlResponse {
  showByUrl: Emission | null;
}

interface DiffusionsByUrlResponse {
  diffusionsOfShowByUrl: {
    edges: DiffusionEdge[];
  };
}

export async function fetchBrands(): Promise<Brand[]> {
  logger.debug({ query: "GetBrands" }, "#fetchBrands Fetching brands");
  try {
    const startTime = Date.now();
    const data = await client.request<BrandsResponse>(BRANDS_QUERY);
    const duration = Date.now() - startTime;
    logger.debug(
      {
        count: data.brands.length,
        duration: `${duration}ms`,
      },
      "#fetchBrands Fetch brands succeeded"
    );
    return data.brands;
  } catch (error) {
    logger.error("#fetchBrands Failed to fetch brands", error, {
      query: "GetBrands",
    });
    throw error;
  }
}

export async function fetchThemes(brandId: string): Promise<Theme[]> {
  logger.debug({ query: "GetThemes", brandId }, "#fetchThemes Fetching themes");
  try {
    const startTime = Date.now();
    const data = await client.request<ThemesResponse>(THEMES_QUERY, {
      brandId,
    });
    const duration = Date.now() - startTime;
    const themes = data.brand?.themes || [];
    logger.debug(
      {
        brandId,
        count: themes.length,
        duration: `${duration}ms`,
      },
      "#fetchThemes Fetch themes succeeded"
    );
    return themes;
  } catch (error) {
    logger.error("#fetchThemes Failed to fetch themes", error, {
      query: "GetThemes",
      brandId,
    });
    throw error;
  }
}

export async function fetchShowByUrl(url: string): Promise<Emission | null> {
  logger.debug(
    { query: "GetShowByUrl", url },
    "#fetchShowByUrl Fetching show by URL"
  );
  try {
    const startTime = Date.now();
    const data = await client.request<ShowByUrlResponse>(SHOW_BY_URL_QUERY, {
      url,
    });
    const duration = Date.now() - startTime;
    const show = data.showByUrl;
    logger.debug(
      {
        url,
        found: !!show,
        showId: show?.id,
        showTitle: show?.title,
        duration: `${duration}ms`,
      },
      "#fetchShowByUrl Fetch show by URL succeeded"
    );
    return show;
  } catch (error) {
    logger.error("#fetchShowByUrl Failed to fetch show by URL", error, {
      query: "GetShowByUrl",
      url,
    });
    throw error;
  }
}

export async function fetchEpisodesByUrl(
  url: string,
  count: number
): Promise<DiffusionEdge[]> {
  logger.debug(
    {
      query: "GetDiffusionsByUrl",
      url,
      count,
    },
    "#fetchEpisodesByUrl Fetching episodes by URL"
  );
  try {
    const startTime = Date.now();
    const data = await client.request<DiffusionsByUrlResponse>(
      DIFFUSIONS_BY_URL_QUERY,
      { url, first: count }
    );
    const duration = Date.now() - startTime;
    const edges = data.diffusionsOfShowByUrl.edges;
    logger.debug(
      {
        url,
        requested: count,
        received: edges.length,
        duration: `${duration}ms`,
      },
      "#fetchEpisodesByUrl Fetch episodes by URL succeeded"
    );
    return edges;
  } catch (error) {
    logger.error("#fetchEpisodesByUrl Failed to fetch episodes by URL", error, {
      query: "GetDiffusionsByUrl",
      url,
      count,
    });
    throw error;
  }
}
