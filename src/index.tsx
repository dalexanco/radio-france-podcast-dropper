#!/usr/bin/env bun
import 'dotenv/config';
import React from 'react';
import { render } from 'ink';
import { Command } from 'commander';
import Info from './components/Info/index.js';
import { OptionsProvider, defaultOptions } from './contexts/OptionsContext.js';
import { setVerboseMode } from './utils/logger.js';

const program = new Command();

const COMMANDS = {
  INFO: 'info',
};

program
  .name('frpd')
  .description('France Radio Podcast Dropper - Download and manage podcast episodes')
  .version('0.1.0');

program
  .command(COMMANDS.INFO)
  .description('Get information about a France Radio emission')
  .option('--format <format>', 'Output format (table|json)', 'table')
  .option('-o, --output <path>', 'Target directory for downloaded files')
  .option('-v, --verbose', 'Enable verbose mode with detailed logging', false)
  .argument('<emission-url>', 'France Radio emission URL')
  .action(async (emissionUrl, rawOptions) => {
    const options = { ...defaultOptions, ...rawOptions };
    
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

program.parse();

