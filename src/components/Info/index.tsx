import React from "react";
import { Text, Box } from "ink";
import { fetchShowByUrl } from "../../data/graphql";
import { fetchEpisodes } from "../../data/episodes";
import EmissionComponent from "./Emission";
import { useAsync } from "react-use";
import Layout from "../Layout";
import FutureSwitch from "../FutureSwitch";
import SelectableEpisodesList from "./SelectableEpisodesList";
import { useOptions } from "../../contexts/OptionsContext";

interface InfoProps {
  emissionUrl?: string;
}

const Info: React.FC<InfoProps> = ({ emissionUrl }) => {
  const futureEmission = useAsync(() => fetchShowByUrl(emissionUrl!));

  // Table format
  return (
    <Layout title="Emission Information">
      <FutureSwitch asyncState={futureEmission}>
        <EmissionComponent emission={futureEmission.value} />
        <SelectableEpisodesList
          emissionUrl={emissionUrl!}
          podcastName={futureEmission.value?.title || ""}
        />
      </FutureSwitch>
    </Layout>
  );
};

export default Info;
