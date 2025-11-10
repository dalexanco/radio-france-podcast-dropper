#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { Command } from 'commander';
import App from './components/App.js';
import Wizard from './components/Wizard.js';

const program = new Command();

program
  .name('fipd')
  .description('France Inter Podcast Dropper - Download and manage podcast episodes')
  .version('0.1.0');

program
  .command('search')
  .description('Search for France Inter emissions')
  .argument('<query>', 'Search query')
  .option('-l, --limit <number>', 'Limit number of results', '10')
  .option('--format <format>', 'Output format (table|json)', 'table')
  .action((query, options) => {
    render(<App command="search" query={query} options={options} />);
  });

program
  .command('download')
  .description('Download episodes from an emission')
  .argument('<emission-id>', 'Emission ID')
  .option('--latest <number>', 'Download N latest episodes')
  .option('--from <date>', 'Download from date (YYYY-MM-DD)')
  .option('--episode <id>', 'Download specific episode by ID')
  .option('-o, --output <path>', 'Download directory', './episodes')
  .option('--format <format>', 'Audio format preference', 'mp3')
  .action((emissionId, options) => {
    render(<App command="download" emissionId={emissionId} options={options} />);
  });

program
  .command('subscribe')
  .description('Subscribe to an emission')
  .argument('<emission-id>', 'Emission ID')
  .option('--auto-download', 'Automatically download new episodes')
  .option('--latest <number>', 'Keep N latest episodes when auto-downloading')
  .action((emissionId, options) => {
    render(<App command="subscribe" emissionId={emissionId} options={options} />);
  });

const subscriptionsCommand = program
  .command('subscriptions')
  .description('Manage subscriptions');

subscriptionsCommand
  .command('list')
  .description('List all subscriptions')
  .action(() => {
    render(<App command="subscriptions-list" />);
  });

subscriptionsCommand
  .command('show')
  .description('Show subscription details')
  .argument('<emission-id>', 'Emission ID')
  .action((emissionId) => {
    render(<App command="subscriptions-show" emissionId={emissionId} />);
  });

subscriptionsCommand
  .command('remove')
  .description('Unsubscribe from an emission')
  .argument('<emission-id>', 'Emission ID')
  .action((emissionId) => {
    render(<App command="subscriptions-remove" emissionId={emissionId} />);
  });

subscriptionsCommand
  .command('update')
  .description('Update subscriptions and check for new episodes')
  .option('--download', 'Download new episodes automatically')
  .action((options) => {
    render(<App command="subscriptions-update" options={options} />);
  });

// Global options
program
  .option('--config <path>', 'Config file path')
  .option('--verbose', 'Enable verbose logging')
  .option('--quiet', 'Suppress non-essential output');

// Add default action to show wizard when no command is provided
program.action(() => {
  render(
    <Wizard
      onSelect={(command, args = [], options = {}) => {
        // Map wizard selections to actual command execution
        if (command === 'search') {
          render(<App command="search" query={args[0]} options={options} />);
        } else if (command === 'download') {
          render(<App command="download" emissionId={args[0]} options={options} />);
        } else if (command === 'subscribe') {
          render(<App command="subscribe" emissionId={args[0]} options={options} />);
        } else if (command === 'subscriptions-list') {
          render(<App command="subscriptions-list" />);
        } else if (command === 'subscriptions-show') {
          render(<App command="subscriptions-show" emissionId={args[0]} />);
        } else if (command === 'subscriptions-remove') {
          render(<App command="subscriptions-remove" emissionId={args[0]} />);
        } else if (command === 'subscriptions-update') {
          render(<App command="subscriptions-update" options={options} />);
        }
      }}
    />
  );
});

program.parse();

