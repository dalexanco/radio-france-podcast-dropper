import React, { useEffect, useState } from "react";
import { Box, Text, useInput } from "ink";
import { Episode, fetchEpisodes } from "../../data/episodes.js";
import EpisodeLine from "./EpisodeLine.js";
import { downloadEpisode } from "../../utils/download.js";
import { useAsync } from "react-use";
import { scanOutputDirectory } from "../../utils/scanDownloads.js";
import { useOptions } from "../../contexts/OptionsContext.js";
import FutureSwitch from "../FutureSwitch.js";

interface SelectableEpisodesListProps {
  emissionUrl: string;
  podcastName?: string;
}

const SelectableEpisodesList: React.FC<SelectableEpisodesListProps> = ({
  podcastName,
  emissionUrl,
}) => {
  const { options } = useOptions();
  const futureEpisodes = useAsync(() =>
    fetchEpisodes(emissionUrl, podcastName)
  );
  const futureExistingEpisodes = useAsync(() =>
    scanOutputDirectory(options.output)
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<
    Record<string, "downloading" | "success" | "error" | "existing">
  >({});
  const [downloadPaths, setDownloadPaths] = useState<Record<string, string>>(
    {}
  );
  const episodes = futureEpisodes.value || [];

  useEffect(() => {
    if (!futureExistingEpisodes.value) return;
    futureExistingEpisodes.value.forEach((episode) => {
      setDownloadStatus((prev) => ({ ...prev, [episode]: "existing" }));
    });
  }, [futureExistingEpisodes.value]);

  useInput((input, key) => {
    if (input === "q" || input === "Q") {
      // Quit shortcut
      process.exit(0);
    } else if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : episodes.length - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => (prev < episodes.length - 1 ? prev + 1 : 0));
    } else if (input === "\r" || input === "\n") {
      // Enter key pressed
      const selectedEpisode = episodes[selectedIndex];
      if (selectedEpisode && !downloading) {
        handleDownload(selectedEpisode);
      }
    }
  });

  const handleDownload = async (episode: Episode) => {
    const filePath = episode.podcastFilePath!;
    setDownloading(filePath);
    setDownloadStatus((prev) => ({ ...prev, [filePath]: "downloading" }));

    try {
      const filepath = await downloadEpisode(
        episode,
        options.output,
        podcastName
      );
      setDownloadStatus((prev) => ({ ...prev, [filePath]: "success" }));
      if (filepath) {
        setDownloadPaths((prev) => ({ ...prev, [filePath]: filepath }));
      }
    } catch (error) {
      setDownloadStatus((prev) => ({ ...prev, [filePath]: "error" }));
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Box marginTop={1} flexDirection="column">
      <FutureSwitch asyncState={futureEpisodes}>
        <Text color="green" bold>
          Latest Episodes ({futureEpisodes.value?.length || 0}):
        </Text>
        {futureEpisodes.value?.map((episode, index) => {
          const isSelected = index === selectedIndex;
          const status = downloadStatus[episode.podcastFilePath!];
          return (
            <Box key={episode.id} marginLeft={1} marginTop={0}>
              <Text>
                {isSelected ? <Text color="cyan">▸ </Text> : <Text> </Text>}
                <EpisodeLine
                  episode={episode}
                  isSelected={isSelected}
                  status={status}
                />
              </Text>
            </Box>
          );
        })}
      </FutureSwitch>

      <Box marginTop={2}>
        <Text color="gray" dimColor>
          [↑/↓] navigate [Enter] download [q] quit
        </Text>
      </Box>
    </Box>
  );
};

export default SelectableEpisodesList;
