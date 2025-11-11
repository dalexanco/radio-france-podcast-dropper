import { Text } from "ink";
import { DiffusionEdge } from "../../api/graphql.js";

interface EpisodeLineProps {
  episode: DiffusionEdge;
  isSelected?: boolean;
}

export default function EpisodeLine({ episode, isSelected = false }: EpisodeLineProps) {
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
    <Text>
      <Text color="gray">{episodeDate}</Text> -{" "}
      <Text color={isSelected ? "cyan" : undefined} bold={isSelected}>
        {episode.node.title}
      </Text>
    </Text>
  );
}
