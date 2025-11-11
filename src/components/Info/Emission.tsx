import React from "react";
import { Text, Box } from "ink";
import { Emission as EmissionType, DiffusionEdge } from "../../api/graphql.js";
import Divider from "../../ui/Divider.js";
import SelectableEpisodesList from "./SelectableEpisodesList.js";

interface EmissionProps {
  emission: EmissionType;
  episodes: DiffusionEdge[];
  downloadPath?: string;
}

const RELATION_HIDDEN = ["staff"];

const Emission: React.FC<EmissionProps> = ({ emission, episodes, downloadPath }) => {
  return (
    <Box flexDirection="column" padding={1}>
      <Box flexDirection="column" marginBottom={1}>
        <Divider type="-" width={20} />
        <Box>
          <Text bold>Emission Information</Text>
        </Box>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Box>
          <Text color="cyan" bold>
            {emission.title}
          </Text>
        </Box>

        {emission.standFirst && (
          <Box marginTop={1}>
            <Text>{emission.standFirst}</Text>
          </Box>
        )}

        {emission.personalitiesConnection &&
          emission.personalitiesConnection.edges.length > 0 && (
            <Box marginTop={1} flexDirection="column">
              <Text color="gray" bold>
                Personalities
              </Text>
              <Text color="gray">
                {emission.personalitiesConnection.edges
                  .map(
                    (edge) =>
                      `${edge.node.name}` +
                      (edge.relation &&
                      !RELATION_HIDDEN.includes(edge.relation.toLowerCase())
                        ? ` (${edge.relation})`
                        : "")
                  )
                  .join(" - ")}
              </Text>
            </Box>
          )}

        {emission.taxonomiesConnection &&
          emission.taxonomiesConnection.edges.length > 0 && (
            <Box marginTop={1} flexDirection="column">
              <Text color="gray" bold>
                Taxonomies
              </Text>
              <Text color="gray">
                {emission.taxonomiesConnection.edges
                  .map((edge) => edge.node.title)
                  .join(" / ")}
              </Text>
            </Box>
          )}

        {emission.podcast && (
          <Box marginTop={1} flexDirection="column">
            {emission.url && (
              <Box>
                <Text>
                  <Text color="yellow">Page:</Text> {emission.url}
                </Text>
              </Box>
            )}
            {emission.podcast.rss && (
              <Box>
                <Text>
                  <Text color="yellow">RSS:</Text> {emission.podcast.rss}
                </Text>
              </Box>
            )}
            {emission.podcast.itunes && (
              <Box>
                <Text>
                  <Text color="yellow">iTunes:</Text> {emission.podcast.itunes}
                </Text>
              </Box>
            )}
          </Box>
        )}

        <SelectableEpisodesList 
          episodes={episodes} 
          downloadPath={downloadPath}
          podcastName={emission.title}
        />
      </Box>
      
      <Box marginTop={2}>
        <Text color="gray" dimColor>
          [↑/↓] navigate  [Enter] download  [q] quit
        </Text>
      </Box>
    </Box>
  );
};

export default Emission;
