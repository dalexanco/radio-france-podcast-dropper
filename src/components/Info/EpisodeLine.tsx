import { Text } from "ink";
import { Episode } from "../../data/episodes.js";

type EpisodeStatus = "downloading" | "success" | "error" | "existing";

interface EpisodeLineProps {
  episode: Episode;
  isSelected?: boolean;
  status: EpisodeStatus;
}

const EpisodeStatus = ({
  status,
}: {
  status: EpisodeStatus;
}) => {
  switch (status) {
    case "downloading":
      return <Text color="yellow">[Downloading...]</Text>;
    case "success":
      return <Text color="green">[Downloaded]</Text>;
    case "existing":
      return <Text color="blue">[Existing]</Text>;
    case "error":
      return <Text color="red">[Error]</Text>;
    default:
      return null;
  }
};

export default function EpisodeLine({ episode, isSelected = false, status }: EpisodeLineProps) {
  const episodeDate = episode.podcastPublishedDate
    ? (() => {
        const date = new Date(Number(episode.podcastPublishedDate) * 1000);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}/${month}/${day}`;
      })()
    : "Unknown";

  return (
    <Text>
      <Text color="gray">{episodeDate}</Text> -{" "}
      <EpisodeStatus status={status} />{" "}
      <Text color={isSelected ? "cyan" : undefined} bold={isSelected}>
        {episode.title}
      </Text>
    </Text>
  );
}
