import { readdir, stat } from "fs/promises";
import { join } from "path";

/**
 * Checks if a path exists and is a directory.
 * @param path - Path to check
 * @returns true if path exists and is a directory, false otherwise
 */
async function isDirectory(path: string): Promise<boolean> {
  try {
    const dirStat = await stat(path);
    return dirStat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Checks if a path is a file.
 * @param path - Path to check
 * @returns true if path exists and is a file, false otherwise
 */
async function isFile(path: string): Promise<boolean> {
  try {
    const fileStat = await stat(path);
    return fileStat.isFile();
  } catch {
    return false;
  }
}

/**
 * Gets all files from a directory, skipping subdirectories.
 * @param dirPath - Path to the directory
 * @returns Array of filenames (files only, not directories)
 */
async function getFiles(dirPath: string): Promise<string[]> {
  try {
    const items = await readdir(dirPath);
    const itemPaths = items.map((item) => join(dirPath, item));
    const fileChecks = await Promise.all(
      itemPaths.map((itemPath) => isFile(itemPath))
    );
    return items.filter((_, index) => fileChecks[index]);
  } catch {
    return [];
  }
}

/**
 * Processes a single file and returns a download entry if valid.
 * @param file - Filename
 * @param filePath - Full path to the file
 * @param podcastName - Name of the podcast folder
 * @returns DownloadEntry if file is valid, null otherwise
 */
async function processFile(
  file: string,
  filePath: string,
  podcastName: string
): Promise<string | null> {
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return null;
    }

    // Remove file extension to get episode name
    const episodeName = file.replace(/\.[^/.]+$/, "");

    return `${podcastName}/${episodeName}.mp3`;
  } catch {
    return null;
  }
}

/**
 * Processes a podcast directory and returns all episode entries.
 * @param dirPath - Path to the podcast directory
 * @param podcastName - Name of the podcast folder
 * @returns Array of download entries for this podcast
 */
async function processPodcastDirectory(
  dirPath: string,
  podcastName: string
): Promise<string[]> {
  const files = await getFiles(dirPath);
  const filePaths = files.map((file) => join(dirPath, file));
  const entries = await Promise.all(
    files.map((file, index) => processFile(file, filePaths[index], podcastName))
  );
  return entries.filter((entry) => entry !== null)
}

/**
 * Scans the download folder and returns a list of entries with podcast and episode names.
 * @param outputPath - Path to the download folder (defaults to "downloads" in current working directory)
 * @returns Array of download entries with podcastName and episodeName
 */
export async function scanOutputDirectory(
  outputPath: string
): Promise<string[]> {
  const baseOutputDir = join(process.cwd(), outputPath);

  // Check if the directory exists
  if (!(await isDirectory(baseOutputDir))) {
    return [];
  }

  // Read all items in the download directory
  let items: string[];
  try {
    items = await readdir(baseOutputDir);
  } catch {
    return [];
  }

  // Process each item (should be podcast folders)
  const itemPaths = items.map((item) => join(baseOutputDir, item));
  const directoryChecks = await Promise.all(
    itemPaths.map((itemPath) => isDirectory(itemPath))
  );
  const podcastDirectories = items.filter((_, index) => directoryChecks[index]);

  // Process all podcast directories in parallel
  const podcastEntriesArrays = await Promise.all(
    podcastDirectories.map((podcastName) =>
      processPodcastDirectory(join(baseOutputDir, podcastName), podcastName)
    )
  );

  // Flatten the array of arrays into a single array
  return podcastEntriesArrays.flat();
}
