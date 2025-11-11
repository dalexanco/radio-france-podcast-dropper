import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { DiffusionEdge } from "../../api/graphql.js";
import EpisodeLine from "./EpisodeLine.js";
import { downloadEpisode } from "../../utils/download.js";

interface SelectableEpisodesListProps {
  episodes: DiffusionEdge[];
  downloadPath?: string;
  podcastName?: string;
}

const SelectableEpisodesList: React.FC<SelectableEpisodesListProps> = ({ episodes, downloadPath, podcastName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<Record<string, "downloading" | "success" | "error">>({});
  const [downloadPaths, setDownloadPaths] = useState<Record<string, string>>({});

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

  const handleDownload = async (episode: DiffusionEdge) => {
    const episodeId = episode.node.id;
    setDownloading(episodeId);
    setDownloadStatus((prev) => ({ ...prev, [episodeId]: "downloading" }));

    try {
      const filepath = await downloadEpisode(episode, downloadPath, podcastName);
      setDownloadStatus((prev) => ({ ...prev, [episodeId]: "success" }));
      if (filepath) {
        setDownloadPaths((prev) => ({ ...prev, [episodeId]: filepath }));
      }
    } catch (error) {
      setDownloadStatus((prev) => ({ ...prev, [episodeId]: "error" }));
    } finally {
      setDownloading(null);
    }
  };

  if (episodes.length === 0) {
    return null;
  }

  return (
    <Box marginTop={1} flexDirection="column">
      <Text color="green" bold>
        Latest Episodes ({episodes.length}):
      </Text>
      <Text color="gray" dimColor>
        Use ↑/↓ to navigate, Enter to download, [q] to quit
      </Text>
      {episodes.map((edge, index) => {
        const isSelected = index === selectedIndex;
        const status = downloadStatus[edge.node.id];
        return (
          <Box key={edge.node.id} marginLeft={1} marginTop={0}>
            <Text>
              {isSelected ? <Text color="cyan">▶ </Text> : <Text>  </Text>}
              <EpisodeLine episode={edge} isSelected={isSelected} />
              {status === "downloading" && (
                <Text color="yellow"> [Downloading...]</Text>
              )}
              {status === "error" && (
                <Text color="red"> [Error]</Text>
              )}
            </Text>

            {status === "success" && (
                <Box flexDirection="column">
                  <Text color="green"> [Downloaded]</Text>
                  <Text color="gray"> {downloadPaths[edge.node.id]}</Text>
                </Box>
              )}
          </Box>
          
        );
      })}
    </Box>
  );
};

export default SelectableEpisodesList;

