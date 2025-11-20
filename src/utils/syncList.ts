import { readFile } from "fs/promises";
import { parse } from "yaml";
import { logger } from "./logger";

export interface EmissionConfig {
  url: string;
  count: number;
}

export interface SyncList {
  emissions: EmissionConfig[];
}

/**
 * Parses a sync list YAML file
 * @param filePath - Path to the YAML file
 * @returns Parsed sync list configuration
 */
export async function parseSyncList(filePath: string): Promise<SyncList> {
  try {
    logger.debug({ filePath }, "#parseSyncList Reading sync list file");
    const fileContent = await readFile(filePath, "utf-8");
    const parsed = parse(fileContent) as SyncList;

    if (!parsed || !parsed.emissions || !Array.isArray(parsed.emissions)) {
      throw new Error("Invalid sync list format: missing 'emissions' array");
    }

    // Validate each emission config
    for (const emission of parsed.emissions) {
      if (!emission.url || typeof emission.url !== "string") {
        throw new Error("Invalid emission config: missing or invalid 'url'");
      }
      if (emission.count === undefined || typeof emission.count !== "number") {
        throw new Error("Invalid emission config: missing or invalid 'count'");
      }
    }

    logger.debug(
      { count: parsed.emissions.length },
      "#parseSyncList Successfully parsed sync list"
    );
    return parsed;
  } catch (error) {
    logger.error("#parseSyncList Failed to parse sync list", error, {
      filePath,
    });
    throw error;
  }
}
