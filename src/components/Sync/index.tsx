import React, { useEffect, useState } from "react";
import { useApp, Text, Box } from "ink";
import { useAsync } from "react-use";
import TextInput from "ink-text-input";
import { parseSyncList } from "../../utils/syncList";
import {
  analyzeSync,
  downloadAllEpisodes,
  SyncPlan,
  SyncResult,
} from "../../data/sync";
import { useOptions } from "../../contexts/OptionsContext";
import { logger } from "../../utils/logger";
import Layout from "../Layout";

const PHASE_ANALYZING = 1;
const PHASE_CONFIRMING = 2;
const PHASE_DOWNLOADING = 3;
const PHASE_COMPLETED = 4;

const PhaseTitle = ({
  activePhase,
  phase,
  children,
}: {
  activePhase: number;
  phase: number;
  children: React.ReactNode;
}) => {
  if (activePhase < phase) return null;
  return (
    <Text color={activePhase == phase ? "cyan" : "gray"} bold>
      {children}
    </Text>
  );
};

const Sync: React.FC = () => {
  const { exit } = useApp();
  const { options } = useOptions();

  const syncListPath = options.config || "rfpd-list.yml";
  const outputPath = options.output;

  const [phase, setPhase] = useState<number>(PHASE_ANALYZING);
  const [analysis, setAnalysis] = useState<{
    plans: SyncPlan[];
    totalToDownload: number;
  } | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [downloadProgress, setDownloadProgress] = useState<{
    podcastIndex: number;
    totalPodcasts: number;
    episodeCurrent: number;
    episodeTotal: number;
    episodeTitle: string;
    podcastTitle: string;
  } | null>(null);
  const [results, setResults] = useState<SyncResult[] | null>(null);

  logger.info({ syncListPath, outputPath }, "[Sync] Command Sync");

  // Step 1: Analyze
  const futureAnalysis = useAsync(async () => {
    if (phase !== PHASE_ANALYZING) return null;

    logger.debug("Step 1: Starting analysis");
    // Parse sync list
    const syncList = await parseSyncList(syncListPath);

    // Analyze what needs to be synced
    const analysisResult = await analyzeSync(syncList.emissions, outputPath);

    return analysisResult;
  }, [phase, syncListPath, outputPath]);

  // Step 2: Wait for confirmation
  useEffect(() => {
    if (futureAnalysis.value && phase === PHASE_ANALYZING) {
      setAnalysis(futureAnalysis.value);
      setPhase(PHASE_CONFIRMING);
    }
    if (futureAnalysis.error && phase === PHASE_ANALYZING) {
      // Error will be displayed in render
    }
  }, [futureAnalysis.value, futureAnalysis.error, phase]);

  // Step 3: Download after confirmation
  const futureDownload = useAsync(async () => {
    if (!confirmed || !analysis || phase !== PHASE_CONFIRMING) return null;

    logger.debug("Step 3: Starting downloads");
    setPhase(PHASE_DOWNLOADING);

    const downloadResults = await downloadAllEpisodes(
      analysis.plans,
      outputPath,
      (
        podcastIndex,
        totalPodcasts,
        episodeCurrent,
        episodeTotal,
        episodeTitle,
        podcastTitle
      ) => {
        setDownloadProgress({
          podcastIndex,
          totalPodcasts,
          episodeCurrent,
          episodeTotal,
          episodeTitle,
          podcastTitle,
        });
      }
    );

    return downloadResults;
  }, [confirmed, analysis, phase, outputPath]);

  // Handle download completion
  useEffect(() => {
    if (futureDownload.value && phase === PHASE_DOWNLOADING) {
      setResults(futureDownload.value);
      setPhase(PHASE_COMPLETED);
      // Exit after a short delay to show the report
      setTimeout(() => {
        exit();
      }, 100);
    }
    if (futureDownload.error && phase === PHASE_DOWNLOADING) {
      // Error will be displayed in render
    }
  }, [futureDownload.value, futureDownload.error, phase, exit]);

  // Handle confirmation input
  const handleConfirm = (value: string) => {
    const lowerValue = value.toLowerCase().trim();
    if (lowerValue === "y" || lowerValue === "yes") {
      setConfirmed(true);
      setInputValue("");
    } else if (lowerValue === "n" || lowerValue === "no") {
      exit();
    }
  };

  return (
    <Layout title="Podcast Sync">
      <Box flexDirection="column">
        {/* Step 1: Analyzing */}
        <Box flexDirection="column" marginBottom={1}>
          <PhaseTitle activePhase={phase} phase={PHASE_ANALYZING}>
            Step 1: Analyzing...
          </PhaseTitle>
          {phase === PHASE_ANALYZING && (
            <Box flexDirection="column" marginLeft={2}>
              <Text> • Fetching episode lists</Text>
              <Text> • Scanning local folder</Text>
              <Text> • Comparing...</Text>
              {futureAnalysis.error && (
                <Box marginTop={1}>
                  <Text color="red">Error: {futureAnalysis.error.message}</Text>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Step 2: Confirmation */}
        <Box flexDirection="column" marginBottom={1}>
          <PhaseTitle activePhase={phase} phase={PHASE_CONFIRMING}>
            Step 2: Download Plan
          </PhaseTitle>
          {phase === PHASE_CONFIRMING && analysis && (
            <Box flexDirection="column" marginTop={1} marginLeft={2}>
              {analysis.plans.map((plan, index) => (
                <Box key={index} flexDirection="column" marginTop={1}>
                  <Text bold>{plan.podcastTitle}</Text>
                  <Text>
                    Total episodes: {plan.totalEpisodes} | Existing:{" "}
                    {plan.existingEpisodes} | To download:{" "}
                    {plan.episodesToDownload.length}
                  </Text>
                  {plan.episodesToDownload.length > 0 && (
                    <Box flexDirection="column" marginLeft={2} marginTop={1}>
                      <Text color="gray">Episodes to download:</Text>
                      {plan.episodesToDownload
                        .slice(0, 5)
                        .map((ep, epIndex) => (
                          <Text key={epIndex} color="gray">
                            • {ep.title}
                          </Text>
                        ))}
                      {plan.episodesToDownload.length > 5 && (
                        <Text color="gray">
                          ... and {plan.episodesToDownload.length - 5} more
                        </Text>
                      )}
                    </Box>
                  )}
                </Box>
              ))}
              <Box marginTop={2} flexDirection="column">
                <Text bold>
                  Total episodes to download: {analysis.totalToDownload}
                </Text>
                <Text>Do you want to proceed? (y/n)</Text>
                <TextInput
                  value={inputValue}
                  onChange={setInputValue}
                  onSubmit={handleConfirm}
                  placeholder=""
                />
              </Box>
            </Box>
          )}
        </Box>

        {/* Step 3: Downloading */}
        <Box flexDirection="column" marginBottom={1}>
          <PhaseTitle activePhase={phase} phase={PHASE_DOWNLOADING}>
            Step 3: Downloading...
          </PhaseTitle>
          {phase === PHASE_DOWNLOADING && (
            <Box flexDirection="column" marginTop={1} marginLeft={2}>
              {downloadProgress && (
                <>
                  <Text>
                    Podcast {downloadProgress.podcastIndex + 1}/
                    {downloadProgress.totalPodcasts}:{" "}
                    {downloadProgress.podcastTitle}
                  </Text>
                  <Text>
                    Episode {downloadProgress.episodeCurrent}/
                    {downloadProgress.episodeTotal}:{" "}
                    {downloadProgress.episodeTitle}
                  </Text>
                </>
              )}
              {futureDownload.error && (
                <Box marginTop={1}>
                  <Text color="red">Error: {futureDownload.error.message}</Text>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Step 4: Report */}
        <Box flexDirection="column">
          <PhaseTitle activePhase={phase} phase={PHASE_COMPLETED}>
            Step 4: Report
          </PhaseTitle>
          {phase === PHASE_COMPLETED && results && (
            <Box flexDirection="column" marginTop={1} marginLeft={2}>
              <Text bold>Sync completed!</Text>
              <Box flexDirection="column" marginTop={1}>
                {results.map((result, index) => (
                  <Box key={index} flexDirection="column" marginTop={1}>
                    <Text bold>{result.podcastTitle}</Text>
                    <Text>
                      Total: {result.totalEpisodes} | Existing:{" "}
                      {result.existingEpisodes} | Downloaded:{" "}
                      {result.downloadedEpisodes} | Failed:{" "}
                      {result.failedEpisodes}
                    </Text>
                    {result.errors.length > 0 && (
                      <Box flexDirection="column" marginLeft={2}>
                        {result.errors.map((err, errIndex) => (
                          <Text key={errIndex} color="red">
                            - {err.episode}: {err.error}
                          </Text>
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Layout>
  );
};

export default Sync;
