#!/usr/bin/env bun
import 'dotenv/config';
import React from 'react';
import { render } from 'ink';
import { Command } from 'commander';
import Info from './components/Info/index.js';

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
  .argument('<emission-url>', 'France Radio emission URL')
  .action((emissionUrl, options) => {
    render(<Info emissionUrl={emissionUrl} options={options} />);
  });

program.parse();

