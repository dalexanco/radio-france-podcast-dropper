import React from "react";
import { Box, Text } from "ink";
import { Episode } from "../../data/episodes.js";
import EpisodeLine from "./EpisodeLine.js";

interface SelectableEpisodesListProps {
  episodes?: Episode[];
}

const EpisodesList: React.FC<SelectableEpisodesListProps> = ({
  episodes = [],
}) => {
  return (
    <Box marginTop={1} flexDirection="column">
      <Text color="green" bold>
        Latest Episodes ({episodes?.length || 0}):
      </Text>
      {episodes?.map((episode, index) => {
        return (
          <Box key={episode.id} marginLeft={1} marginTop={0}>
            <EpisodeLine episode={episode} />
          </Box>
        );
      })}
    </Box>
  );
};

export default EpisodesList;
