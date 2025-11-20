import React from "react";
import { Text, Box } from "ink";
import { fetchShowByUrl } from "../../data/graphql";
import { fetchEpisodes } from "../../data/episodes";
import EmissionComponent from "./Emission";
import { useAsync } from "react-use";
import Layout from "../Layout";
import FutureSwitch from "../FutureSwitch";
import EpisodesList from "./EpisodesList";
import { useOptions } from "../../contexts/OptionsContext";
import { fetchShow } from "../../data/shows";

interface InfoProps {
  emissionUrl?: string;
}

const Info: React.FC<InfoProps> = ({ emissionUrl }) => {
  const { options } = useOptions();
  const futureShow = useAsync(async () => {
    if (!emissionUrl) return { show: null, episodes: [] };
    const show = await fetchShow(emissionUrl);
    const podcastName = show?.title;
    if (!podcastName) return { show, episodes: [] };
    const episodes = await fetchEpisodes(emissionUrl, podcastName, options.output);
    return { show, episodes };
  });

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
