import { Text } from "ink";
import { Episode, EpisodePodcastStatus } from "../../data/episodes.js";

interface EpisodeLineProps {
  episode: Episode;
}

const EpisodeStatus = ({
  status,
}: {
  status?: EpisodePodcastStatus;
}) => {
  switch (status) {
    case "available":
      return <Text color="gray">[Available]</Text>;
    case "existing":
      return <Text color="blue">[Existing]</Text>;
    default:
      return "unknown";
  }
};

export default function EpisodeLine({ episode }: EpisodeLineProps) {
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
      <EpisodeStatus status={episode.podcastStatus} />{" "}
      <Text>
        {episode.title}
      </Text>
    </Text>
  );
}
