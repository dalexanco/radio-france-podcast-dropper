#!/usr/bin/env bun
import 'dotenv/config';
import React from 'react';
import { render } from 'ink';
import { Command } from 'commander';
import Info from './components/Info/index.js';
import Sync from './components/Sync/index.js';
import { Options, OptionsProvider, defaultOptions } from './contexts/OptionsContext.js';
import { setVerboseMode } from './utils/logger.js';

const program = new Command();

const COMMANDS = {
  INFO: 'info',
  SYNC: 'sync',
};

program
  .name('frpd')
  .description('France Radio Podcast Dropper - Download and manage podcast episodes')
  .version('0.1.0');

program
  .command(COMMANDS.INFO)
  .description('Get information about a France Radio emission')
  .option('--format <format>', 'Output format (table|json)', 'table')
  .option('-c, --count <count>', 'Number of episodes to fetch', Number.parseInt, 10)
  .option('-o, --output <path>', 'Target directory for downloaded files')
  .option('-v, --verbose', 'Enable verbose mode with detailed logging', false)
  .argument('<emission-url>', 'France Radio emission URL')
  .action(async (emissionUrl, rawOptions) => {
    const options: Options = { ...defaultOptions, ...rawOptions } as Options;
    
    // Set global verbose mode for non-React contexts
    setVerboseMode(options.verbose);
    
    const { waitUntilExit } = render(
      <OptionsProvider options={options}>
        <Info emissionUrl={emissionUrl} />
      </OptionsProvider>
    );
    
    // Wait for the app to exit (when exit() is called from within components)
    await waitUntilExit();
  });

program
  .command(COMMANDS.SYNC)
  .description('Sync podcasts from a sync list with an existing folder')
  .option('--config <path>', 'Path to the YAML sync list file', 'rfpd-list.yml')
  .option('-o, --output <path>', 'Target directory for downloaded files', 'downloads')
  .option('-v, --verbose', 'Enable verbose mode with detailed logging', false)
  .action(async (rawOptions) => {
    const options: Options = { ...defaultOptions, ...rawOptions } as Options;
    
    // Set global verbose mode for non-React contexts
    setVerboseMode(options.verbose);
    
    const { waitUntilExit } = render(
      <OptionsProvider options={options}>
        <Sync />
      </OptionsProvider>
    );
    
    // Wait for the app to exit (when exit() is called from within components)
    await waitUntilExit();
  });

program.parse();

