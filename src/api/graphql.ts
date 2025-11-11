import { GraphQLClient } from 'graphql-request';
import fetch from 'node-fetch';
import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';

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
  node: TaxonomyNode;
}

export interface PersonalityNode {
  id: string;
  name: string;
}

export interface PersonalityEdge {
  relation: string;
  info?: string;
  node: PersonalityNode;
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
  node: DiffusionNode;
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

const GRAPHQL_URI = process.env.GRAPHQL_URI || 'https://openapi.radiofrance.fr/v1/graphql';
const GRAPHQL_TOKEN = process.env.GRAPHQL_TOKEN!;
const HTTP_PROXY = process.env.HTTP_PROXY || process.env.http_proxy;
const HTTPS_PROXY = process.env.HTTPS_PROXY || process.env.https_proxy;

// Normalize proxy URL - add http:// if protocol is missing
const normalizeProxyUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `http://${url}`;
};

// Create proxy agent if proxy is configured
const getProxyAgent = () => {
  const proxyUrl = GRAPHQL_URI.startsWith('https://') 
    ? normalizeProxyUrl(HTTPS_PROXY || HTTP_PROXY)
    : normalizeProxyUrl(HTTP_PROXY);
  
  if (!proxyUrl) {
    return undefined;
  }

  return GRAPHQL_URI.startsWith('https://')
    ? new HttpsProxyAgent(proxyUrl)
    : new HttpProxyAgent(proxyUrl);
};

const customFetch = (url: string | URL | Request, options?: RequestInit) => {
  const agent = getProxyAgent();
  return fetch(url as any, {
    ...options,
    agent,
  } as any) as any;
};

const client = new GraphQLClient(GRAPHQL_URI, {
  headers: {
    'x-token': GRAPHQL_TOKEN,
  },
  fetch: customFetch as any,
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
  const data = await client.request<BrandsResponse>(BRANDS_QUERY);
  return data.brands;
}

export async function fetchThemes(brandId: string): Promise<Theme[]> {
  const data = await client.request<ThemesResponse>(THEMES_QUERY, { brandId });
  return data.brand?.themes || [];
}

export async function fetchShowByUrl(url: string): Promise<Emission | null> {
  const data = await client.request<ShowByUrlResponse>(SHOW_BY_URL_QUERY, { url });
  return data.showByUrl;
}

export async function fetchEpisodesByUrl(url: string, first: number = 10): Promise<DiffusionEdge[]> {
  const data = await client.request<DiffusionsByUrlResponse>(DIFFUSIONS_BY_URL_QUERY, { url, first });
  return data.diffusionsOfShowByUrl.edges;
}
