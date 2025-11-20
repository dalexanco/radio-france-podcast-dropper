import React, { useEffect } from "react";
import { Text, Box, useApp } from "ink";
import { fetchShowByUrl } from "../../data/graphql";
import { fetchEpisodes } from "../../data/episodes";
import EmissionComponent from "./Emission";
import { useAsync } from "react-use";
import Layout from "../Layout";
import FutureSwitch from "../FutureSwitch";
import EpisodesList from "./EpisodesList";
import { useOptions } from "../../contexts/OptionsContext";
import { fetchShow } from "../../data/shows";
import { logger } from "../../utils/logger";

interface InfoProps {
  emissionUrl?: string;
}

const Info: React.FC<InfoProps> = ({ emissionUrl }) => {
  const { exit } = useApp();
  const { options } = useOptions();
  logger.info({ options, emissionUrl }, "[Info] Command Info");
  const futureShow = useAsync(async () => {
    if (!emissionUrl) return { show: null, episodes: [] };
    const show = await fetchShow(emissionUrl);
    const podcastName = show?.title;
    if (!podcastName) return { show, episodes: [] };
    const episodes = await fetchEpisodes(
      emissionUrl,
      podcastName,
      options.output,
      options.count
    );
    return { show, episodes };
  }, []);

  // Exit when async operation completes (success or error)
  useEffect(() => {
    if (!futureShow.loading) {
      exit();
    }
  }, [futureShow.loading, exit]);

  // Table format
  return (
    <Layout title="Emission Information">
      <FutureSwitch asyncState={futureShow}>
        <EmissionComponent emission={futureShow.value?.show} />
        <EpisodesList episodes={futureShow.value?.episodes} />
      </FutureSwitch>
    </Layout>
  );
};

export default Info;
