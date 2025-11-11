import { Box, Text } from "ink";
import { DiffusionEdge } from "../../api/graphql.js";

export default function EpisodeLine({ episode }: { episode: DiffusionEdge }) {
  const episodeDate = episode.node.published_date
    ? (() => {
        const date = new Date(Number(episode.node.published_date) * 1000);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}/${month}/${day}`;
      })()
    : "Unknown";

  return (
    <Box
      key={episode.node.id}
      marginLeft={1}
      flexDirection="column"
    >
      <Text>
        <Text color="gray">{episodeDate}</Text> -{" "}
        <Text>{episode.node.title}</Text>
      </Text>
    </Box>
  );
}
