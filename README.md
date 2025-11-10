# France Inter Podcast Dropper

A command-line tool to download and manage podcast episodes from France Inter's API.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Data Models](#data-models)
- [Configuration](#configuration)
- [Development Roadmap](#development-roadmap)

## Overview

France Inter Podcast Dropper (FIPD) is a CLI application that enables users to:
- Search and discover France Inter podcast series
- Download episodes from specific series
- Manage subscriptions to automatically track and download new episodes
- Maintain a local state of downloaded content

## Features

### 1. Search
- Search across all France Inter emissions (podcast series)
- Display search results with relevant metadata (title, description, etc.)
- Preview/search before subscribing or downloading

**Use Cases:**
- Find a specific emission by name
- Discover new podcasts
- Verify emission details before subscription

### 2. Download
- Download episodes from a specific series
- Flexible download options:
  - Download the N latest episodes
  - Download episodes from a specific date onwards
  - Download a single episode by ID
- Progress indication during downloads
- Automatic file naming and organization

**Use Cases:**
- One-time download of recent episodes
- Catch up on missed episodes from a specific date
- Download specific episodes manually

### 3. Subscription Management
- Subscribe to emissions to track them
- Maintain subscription state in a JSON file
- Track which episodes have been downloaded per subscription
- Automatic detection of new episodes
- Update subscription state after downloads

**Use Cases:**
- Automatically keep up with favorite shows
- Track download history per series
- Manage multiple podcast subscriptions

## Requirements

### Technical Requirements
- **Runtime:** Node.js >= 18.0.0
- **Package Manager:** pnpm
- **Language:** TypeScript
- **CLI Framework:** Ink (React for CLI)
- **HTTP Client:** _(To be added - e.g., node-fetch or axios)_
- **File I/O:** Node.js built-in `fs` module
- **CLI Parsing:** Commander.js
- **Date/Time:** Native JavaScript Date or date-fns

### System Requirements
- Operating System: macOS, Linux, Windows
- Node.js 18.0.0 or higher
- pnpm installed globally (`npm install -g pnpm`)
- Network: Internet connection for API access and downloads
- Storage: Sufficient disk space for downloaded episodes

## Installation

### Prerequisites

Install pnpm if you haven't already:
```bash
npm install -g pnpm
```

### Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd france-inter-podcast-dropper
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the project:
```bash
pnpm build
```

4. Run the CLI:
```bash
# Development mode (with hot reload)
pnpm dev

# Production mode
pnpm start

# Or use the binary directly
./dist/index.js --help
```

### Global Installation (Future)

Once published, install globally:
```bash
pnpm add -g france-inter-podcast-dropper
```

Then use the `fipd` command from anywhere:
```bash
fipd search "le 7/9"
```

## Usage

### Command Structure

```
fipd [COMMAND] [OPTIONS] [ARGUMENTS]
```

### Commands

#### Search
```bash
fipd search <query>
fipd search "le 7/9"
```

**Options:**
- `--limit N`: Limit number of results (default: 10)
- `--format json`: Output results in JSON format

#### Download
```bash
# Download N latest episodes
fipd download <emission-id> --latest N

# Download from a specific date
fipd download <emission-id> --from YYYY-MM-DD

# Download specific episode
fipd download <emission-id> --episode <episode-id>

# Download to specific directory
fipd download <emission-id> --output /path/to/directory
```

**Options:**
- `--latest N`: Download the N most recent episodes
- `--from DATE`: Download episodes from this date onwards (format: YYYY-MM-DD)
- `--episode ID`: Download a specific episode by ID
- `--output PATH`: Specify download directory (default: `./episodes/`)
- `--format FORMAT`: Audio format preference (if multiple available)

#### Subscribe
```bash
# Subscribe to an emission
fipd subscribe <emission-id>

# Subscribe with auto-download settings
fipd subscribe <emission-id> --auto-download --latest 5
```

**Options:**
- `--auto-download`: Automatically download new episodes
- `--latest N`: When auto-downloading, keep N latest episodes

#### Subscription Management
```bash
# List all subscriptions
fipd subscriptions list

# Show subscription details
fipd subscriptions show <emission-id>

# Unsubscribe
fipd subscriptions remove <emission-id>

# Update subscriptions (check for new episodes)
fipd subscriptions update [--download]
```

#### General Options
- `--config PATH`: Specify custom config file location
- `--verbose`: Enable verbose logging
- `--quiet`: Suppress non-essential output

## Project Structure

```
france-inter-podcast-dropper/
├── README.md
├── LICENSE
├── .gitignore
├── package.json              # Node.js dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── pnpm-lock.yaml            # pnpm lock file
├── config/
│   └── default.json          # Default configuration
├── src/
│   ├── index.tsx             # CLI entry point (Ink/React)
│   ├── components/
│   │   ├── App.tsx           # Main App component
│   │   ├── Search.tsx        # Search command component
│   │   ├── Download.tsx      # Download command component
│   │   └── Subscriptions.tsx # Subscriptions command component
│   ├── api/
│   │   └── franceInter.ts    # API client
│   ├── commands/
│   │   ├── search.ts         # Search command logic
│   │   ├── download.ts       # Download command logic
│   │   └── subscribe.ts      # Subscribe command logic
│   ├── models/
│   │   ├── Emission.ts       # Emission data model
│   │   ├── Episode.ts        # Episode data model
│   │   └── Subscription.ts   # Subscription data model
│   ├── storage/
│   │   └── subscriptionManager.ts  # JSON state management
│   └── utils/
│       ├── downloader.ts     # File download utilities
│       └── formatter.ts      # Output formatting
├── dist/                     # Compiled JavaScript output
├── tests/
│   ├── api.test.ts
│   ├── download.test.ts
│   └── subscriptions.test.ts
└── docs/
    └── API.md                # API documentation
```

## API Integration

### France Inter API

**Base URL:** `https://www.franceinter.fr/api/` _(To be verified)_

**Endpoints:**
- `GET /emissions` - List all emissions
- `GET /emissions/{id}` - Get emission details
- `GET /emissions/{id}/episodes` - Get episodes for an emission
- `GET /search?q={query}` - Search emissions
- `GET /episodes/{id}` - Get episode details

**Authentication:** _(To be determined - may not be required)_

**Rate Limiting:** _(To be documented)_

## Data Models

### Emission
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "image_url": "string",
  "rss_feed": "string",
  "category": "string"
}
```

### Episode
```json
{
  "id": "string",
  "emission_id": "string",
  "title": "string",
  "description": "string",
  "published_date": "ISO 8601 date",
  "duration": "number (seconds)",
  "audio_url": "string",
  "image_url": "string"
}
```

### Subscription State (JSON file)
```json
{
  "subscriptions": [
    {
      "emission_id": "string",
      "emission_title": "string",
      "subscribed_date": "ISO 8601 date",
      "last_checked": "ISO 8601 date",
      "downloaded_episodes": [
        {
          "episode_id": "string",
          "downloaded_date": "ISO 8601 date",
          "file_path": "string"
        }
      ],
      "settings": {
        "auto_download": false,
        "keep_latest": null
      }
    }
  ],
  "last_updated": "ISO 8601 date"
}
```

## Configuration

### Configuration File Location
- Default: `~/.fipd/config.json`
- Customizable via `--config` flag or `FIPD_CONFIG` environment variable

### Configuration Options
```json
{
  "download_directory": "./episodes",
  "subscription_file": "~/.fipd/subscriptions.json",
  "default_format": "mp3",
  "concurrent_downloads": 3,
  "api_base_url": "https://www.franceinter.fr/api/",
  "user_agent": "France-Inter-Podcast-Dropper/1.0"
}
```

## Development

### Available Scripts

- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm dev` - Run in development mode with hot reload (tsx watch)
- `pnpm start` - Run the compiled application
- `pnpm type-check` - Type check without emitting files
- `pnpm clean` - Remove build output directory

### Development Workflow

1. Make changes to TypeScript files in `src/`
2. Run `pnpm dev` for development with auto-reload
3. Or run `pnpm build` then `pnpm start` for production build
4. Test your changes with the CLI commands

### Tech Stack

- **Ink**: React-based CLI framework for beautiful terminal UIs
- **Commander.js**: Command-line argument parsing
- **TypeScript**: Type-safe JavaScript
- **pnpm**: Fast, disk space efficient package manager

## Development Roadmap

### Phase 1: Core Functionality ✅
- [x] Project setup (Node.js, TypeScript, Ink, pnpm)
- [x] Basic CLI structure with Commander.js
- [x] Ink/React component setup
- [ ] API client implementation
- [ ] Search functionality
- [ ] Basic download functionality
- [ ] Subscription state management (JSON file)

### Phase 2: Enhanced Features
- [ ] Progress bars for downloads (using Ink components)
- [ ] Retry logic for failed downloads
- [ ] Concurrent downloads
- [ ] Episode metadata extraction and storage

### Phase 3: Advanced Features
- [ ] Auto-update subscriptions
- [ ] Scheduled checks for new episodes
- [ ] Export/import subscription lists
- [ ] Episode filtering and sorting

### Phase 4: Polish
- [ ] Comprehensive error handling
- [ ] Logging system
- [ ] Unit and integration tests (Jest/Vitest)
- [ ] Documentation and examples

## Contributing

_(To be added)_

## License

_(To be determined)_