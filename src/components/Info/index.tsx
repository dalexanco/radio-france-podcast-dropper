import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
import { Emission, DiffusionEdge, fetchShowByUrl, fetchEpisodesByUrl } from '../../api/graphql.js';
import EmissionComponent from './Emission.js';

interface InfoProps {
  emissionUrl?: string;
  options?: {
    format?: string;
  };
}

const Info: React.FC<InfoProps> = ({ emissionUrl, options }) => {
  const [emission, setEmission] = useState<Emission | null>(null);
  const [episodes, setEpisodes] = useState<DiffusionEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!emissionUrl) {
      setError('No emission URL provided');
      setLoading(false);
      return;
    }

    const loadEmission = async () => {
      try {
        setLoading(true);
        setError(null);
        const [emissionData, episodesData] = await Promise.all([
          fetchShowByUrl(emissionUrl),
          fetchEpisodesByUrl(emissionUrl, 10)
        ]);
        
        if (!emissionData) {
          setError(`Emission not found: ${emissionUrl}`);
        } else {
          setEmission(emissionData);
          setEpisodes(episodesData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch emission');
      } finally {
        setLoading(false);
      }
    };

    loadEmission();
  }, [emissionUrl]);

  if (loading) {
    return (
      <Box>
        <Text color="cyan">Loading emission information...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  if (!emission) {
    return (
      <Box>
        <Text color="yellow">No emission data available</Text>
      </Box>
    );
  }

  const format = options?.format || 'table';

  if (format === 'json') {
    return (
      <Box>
        <Text>{JSON.stringify(emission, null, 2)}</Text>
      </Box>
    );
  }

  // Table format
  return <EmissionComponent emission={emission} episodes={episodes} />;
};

export default Info;

