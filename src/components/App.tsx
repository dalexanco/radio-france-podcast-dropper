import React from 'react';
import { Text, Box } from 'ink';

interface AppProps {
  command?: string;
  query?: string;
  emissionId?: string;
  options?: Record<string, any>;
}

const App: React.FC<AppProps> = ({ command, query, emissionId, options }) => {
  return (
    <Box flexDirection="column" padding={1}>
      <Text>
        <Text color="cyan" bold>France Radio Podcast Dropper</Text>
      </Text>
      <Box marginTop={1}>
        <Text>
          Command: <Text color="green">{command || 'none'}</Text>
        </Text>
      </Box>
      {query && (
        <Box marginTop={1}>
          <Text>Query: {query}</Text>
        </Box>
      )}
      {emissionId && (
        <Box marginTop={1}>
          <Text>Emission ID: {emissionId}</Text>
        </Box>
      )}
      <Box marginTop={1}>
        <Text color="yellow">🚧 This feature is under development</Text>
      </Box>
    </Box>
  );
};

export default App;

