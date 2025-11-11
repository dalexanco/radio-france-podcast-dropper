# France Radio Podcast Dropper

A command-line tool to download and manage podcast episodes from France Radio's API.

## Table of Contents

- [Overview](#overview)
- [Requirements](#requirements)
- [Usage](#usage)
- [Development](#development)
- [Development Roadmap](#development-roadmap)
- [Contributing](#contributing)
- [License](#license)

## Overview

France Radio Podcast Dropper (FRPD) is a CLI application that enables users to:
- Info - Get information about France Radio podcast series
- Subscribe - Register a podcast
- Download - Fetch episodes from a podcast
- Synchronize - Compare existing episodes and download new ones

## Requirements

- Bun 1.0.0 or higher ([install Bun](https://bun.sh))
- France Radio API token
  - See [documentation](https://developers.radiofrance.fr/doc)
  - And [ask a token](https://developers.radiofrance.fr/signup)

## Usage

### Command Structure

```
frpd [COMMAND] [OPTIONS] [ARGUMENTS]
```

### Commands

#### Info
```bash
frpd info <emission-url>
frpd info https://www.radiofrance.fr/franceinter/podcasts/les-odyssees
```

**Options:**
- `--format json`: Output results in JSON format

## Development

### Prerequisites

Install Bun if you haven't already:
```bash
curl -fsSL https://bun.sh/install | bash
```

### Available Scripts

- `bun run build` - Compile TypeScript to JavaScript
- `bun run dev` - Run in development mode with hot reload
- `bun run start` - Run the compiled application
- `bun run type-check` - Type check without emitting files
- `bun run clean` - Remove build output directory

### Development Workflow

1. Make changes to TypeScript files in `src/`
2. Run `bun run dev` for development with auto-reload
3. Or run `bun run build` then `bun run start` for production build
4. Test your changes with the CLI commands

### Tech Stack

- **Ink**: React-based CLI framework for beautiful terminal UIs
- **Commander.js**: Command-line argument parsing
- **TypeScript**: Type-safe JavaScript
- **Bun**: Fast JavaScript runtime and package manager

## Development Roadmap

### Phase 1: Core Functionality ✅
- [x] Project setup
- [x] Basic CLI structure
- [x] Ink/React component setup
- [ ] API client implementation
- [ ] Info functionality
- [ ] Download functionality
- [ ] Subscription management

### Phase 2: Enhanced Features
- [ ] Progress bars for downloads
- [ ] Retry logic for failed downloads
- [ ] Concurrent downloads
- [ ] Episode metadata storage

### Phase 3: Advanced Features
- [ ] Custom audio format
- [ ] Custom file name format

### Phase 4: Polish
- [ ] Comprehensive error handling
- [ ] Logging system

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

## License

CC-BY-4.0