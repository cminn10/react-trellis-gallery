# Contributing

Thank you for your interest in contributing to react-trellis-gallery!

## Prerequisites

- [Bun](https://bun.sh/) (used for all package management and script execution)
- Node.js 24+ (used in CI alongside Bun)

## Setup

```bash
git clone https://github.com/cminn10/react-trellis-gallery.git
cd react-trellis-gallery
bun install
```

## Scripts

| Command | Description |
| --- | --- |
| `bun run build` | Build the library (ESM + CJS + type declarations) |
| `bun run lint` | Lint with Biome |
| `bun run format` | Format with Biome |
| `bun run check` | Lint + format (auto-fix) |
| `bun run typecheck` | Type-check with TypeScript |
| `bun run dev:playground` | Start the playground dev server |

## Project Structure

```
src/
├── components/         # React components
│   ├── TrellisGallery  # Main entry component
│   ├── GridRenderer    # Delegates to PaginationGrid or ScrollGrid
│   ├── PaginationGrid  # Static grid for pagination mode
│   ├── ScrollGrid      # Virtualized grid via react-window
│   ├── FloatingPanel   # Zag.js floating panel wrapper
│   ├── OverlayManager  # Manages multiple floating panels
│   ├── DefaultPagination # Built-in pagination UI
│   ├── PaginationOverlay # Positioned/draggable overlay
│   └── IconButton      # Reusable icon button
├── context/            # React context
│   └── trellis-pagination-context  # Pagination context for child components
├── core/               # Pure logic (no React)
│   ├── layout-engine   # calculateLayout, fitGrid
│   ├── constants       # Default values
│   └── types           # All TypeScript types
├── hooks/              # React hooks
│   ├── use-trellis-gallery    # All-in-one hook
│   ├── use-trellis-layout     # Layout computation
│   ├── use-trellis-pagination # Pagination state
│   ├── use-trellis-panels     # Panel management
│   ├── use-cell-interaction   # Accessible cell handlers
│   ├── use-container-size     # ResizeObserver size tracking
│   └── use-draggable          # Drag behavior
└── index.ts            # Public API exports

examples/
└── playground/         # Vite demo app for interactive testing
```

## Tooling

- **[Biome](https://biomejs.dev/)** for linting and formatting (no ESLint/Prettier)
- **[tsdown](https://github.com/nicolo-ribaudo/tsdown)** for building (ESM + CJS with declarations and source maps)
- **TypeScript** in strict mode

## Coding Conventions

- Biome enforces the style — run `bun run check` before committing
- Tabs for indentation, single quotes, semicolons as-needed
- No barrel files except `src/index.ts`
- Keep `src/core/` free of React imports — pure functions and types only

## Playground

The playground in `examples/playground/` is a Vite + React app that imports the library source directly during development. Use it to test changes interactively:

```bash
bun run dev:playground
```

In CI, the playground builds against the built `dist/` output to verify the published package works correctly.

## Pull Requests

1. Fork and create a branch from `main`
2. Make your changes
3. Run `bun run check && bun run typecheck && bun run build` to verify
4. Open a pull request against `main`

CI will automatically run lint, typecheck, library build, and playground build on your PR.
