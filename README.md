# react-trellis-gallery

[![CI](https://github.com/cminn10/react-trellis-gallery/actions/workflows/ci.yml/badge.svg)](https://github.com/cminn10/react-trellis-gallery/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/react-trellis-gallery)](https://www.npmjs.com/package/react-trellis-gallery)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-trellis-gallery)](https://bundlephobia.com/package/react-trellis-gallery)
[![license](https://img.shields.io/npm/l/react-trellis-gallery)](./LICENSE)

High-performance trellis/gallery layout for React with paginated grids, virtualized scrolling, and floating detail panels.

**[Live Playground](https://cminn10.github.io/react-trellis-gallery/)** — try every option interactively.

<!-- TODO: add a GIF or screenshot of the playground here -->

## Features

- **Two display modes** — paginated grid or virtualized infinite scroll (powered by [react-window](https://github.com/bvaughn/react-window))
- **Responsive auto layout** — computes rows and columns from minimum item dimensions
- **Manual layout** — fixed rows × columns for precise control
- **Floating detail panels** — double-click any cell to open a draggable, resizable panel with pin, minimize, maximize, and close controls (powered by [Zag.js](https://zagjs.com/))
- **Controlled & uncontrolled pagination** — manage page state externally or let the component handle it
- **Custom pagination UI** — provide your own render function, use the built-in default, or hide controls entirely
- **Draggable pagination overlay** — reposition the pagination bar by dragging
- **Keyboard accessible** — cells support Enter/Space activation alongside double-click
- **SSR-safe** — uses isomorphic layout effects for server-side rendering compatibility
- **Fully typed** — written in TypeScript with all types exported
- **Tree-shakable** — ships ESM + CJS with no side effects

## Installation

```bash
npm install react-trellis-gallery
```

Peer dependencies: `react >= 18` and `react-dom >= 18`.

## Quick Start

```tsx
import { TrellisGallery } from 'react-trellis-gallery'

const items = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  title: `Item ${i + 1}`,
}))

function App() {
  return (
    <div style={{ width: 800, height: 600 }}>
      <TrellisGallery
        items={items}
        mode="pagination"
        layout={{ type: 'auto', minItemWidth: 180, minItemHeight: 140 }}
        pagination={{ mode: 'uncontrolled' }}
        renderItem={(item) => <div>{item.title}</div>}
        renderExpandedItem={(item) => <div><h2>{item.title}</h2><p>Detail view</p></div>}
      />
    </div>
  )
}
```

The container must have explicit width and height — the gallery fills its parent.

## Usage Examples

### Virtualized Scroll Mode

For large datasets, switch to scroll mode which virtualizes rows via `react-window`:

```tsx
<TrellisGallery
  items={items}
  mode="scroll"
  layout={{ type: 'auto', minItemWidth: 200, minItemHeight: 150 }}
  overscanCount={2}
  renderItem={(item) => <div>{item.title}</div>}
  renderExpandedItem={(item) => <div>{item.title}</div>}
/>
```

### Manual Layout

Set an exact grid of 3 columns × 2 rows per page:

```tsx
<TrellisGallery
  items={items}
  mode="pagination"
  layout={{ type: 'manual', rows: 2, cols: 3 }}
  gap={8}
  pagination={{ mode: 'uncontrolled' }}
  renderItem={(item) => <div>{item.title}</div>}
  renderExpandedItem={(item) => <div>{item.title}</div>}
/>
```

### Controlled Pagination

Manage page state yourself:

```tsx
const [page, setPage] = useState(0)

<TrellisGallery
  items={items}
  mode="pagination"
  layout={{ type: 'auto', minItemWidth: 200, minItemHeight: 150 }}
  pagination={{
    mode: 'controlled',
    page,
    onPageChange: setPage,
    position: 'bottom',
    align: 'center',
  }}
  renderItem={(item) => <div>{item.title}</div>}
  renderExpandedItem={(item) => <div>{item.title}</div>}
/>
```

### Custom Pagination Controls

Replace the built-in pagination UI with your own:

```tsx
<TrellisGallery
  items={items}
  mode="pagination"
  layout={{ type: 'auto', minItemWidth: 200, minItemHeight: 150 }}
  pagination={{
    mode: 'uncontrolled',
    renderControl: (vm) => (
      <div>
        <button onClick={vm.prev} disabled={!vm.hasPrev}>Prev</button>
        <span>{vm.currentPage + 1} / {vm.totalPages}</span>
        <button onClick={vm.next} disabled={!vm.hasNext}>Next</button>
      </div>
    ),
  }}
  renderItem={(item) => <div>{item.title}</div>}
  renderExpandedItem={(item) => <div>{item.title}</div>}
/>
```

Pass `renderControl: false` to hide pagination controls entirely.

### Custom Panel Headers

Customize the floating panel header for each item:

```tsx
<TrellisGallery
  items={items}
  mode="pagination"
  layout={{ type: 'auto', minItemWidth: 200, minItemHeight: 150 }}
  pagination={{ mode: 'uncontrolled' }}
  panelTitle={(item) => item.title}
  renderPanelHeader={(item, api) => (
    <div>
      <span>{item.title}</span>
      <button onClick={api.togglePin}>{api.isPinned ? 'Unpin' : 'Pin'}</button>
      <button onClick={api.close}>Close</button>
    </div>
  )}
  renderItem={(item) => <div>{item.title}</div>}
  renderExpandedItem={(item) => <div>{item.title}</div>}
/>
```

### Headless Usage

Use the hooks directly for full control over rendering:

```tsx
import { useTrellisGallery } from 'react-trellis-gallery'

function CustomGallery({ items }) {
  const { containerRef, layout, pagination, panels } = useTrellisGallery({
    items,
    mode: 'pagination',
    layout: { type: 'auto', minItemWidth: 200, minItemHeight: 150 },
    pagination: { mode: 'uncontrolled' },
  })

  const pageItems = items.slice(pagination.startIndex, pagination.endIndex)

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${layout.cols}, ${layout.cellWidth}px)`,
        gridTemplateRows: `repeat(${layout.rows}, ${layout.cellHeight}px)`,
      }}>
        {pageItems.map((item, i) => (
          <div key={i} onDoubleClick={() => panels.open(pagination.startIndex + i)}>
            {item.title}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## API Reference

### `<TrellisGallery>`

The main component. Renders a grid with optional pagination and floating panels.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `T[]` | — | Array of data items to display |
| `mode` | `'pagination' \| 'scroll'` | — | Display mode |
| `layout` | `LayoutConfig` | — | Layout strategy (see below) |
| `gap` | `number` | `0` | Gap between cells in pixels |
| `overscanCount` | `number` | `1` | Extra rows rendered outside the viewport (scroll mode) |
| `pagination` | `PaginationConfig` | — | Pagination options (required for pagination mode) |
| `panelDefaults` | `Partial<FloatingPanelDefaults>` | `{ size: { width: 600, height: 400 }, minSize: { width: 300, height: 180 } }` | Default floating panel dimensions |
| `renderItem` | `(item: T, index: number) => ReactNode` | — | Renders each grid cell |
| `renderExpandedItem` | `(item: T, index: number) => ReactNode` | — | Renders the content inside a floating panel |
| `panelTitle` | `(item: T, index: number) => ReactNode` | — | Panel title text |
| `renderPanelHeader` | `(item: T, api: PanelHeaderAPI) => ReactNode` | — | Custom panel header (overrides default) |
| `onPanelOpen` | `(item: T, index: number) => void` | — | Called when a panel opens |
| `onPanelClose` | `(item: T, index: number) => void` | — | Called when a panel closes |
| `className` | `string` | — | CSS class for the container |
| `style` | `CSSProperties` | — | Inline styles for the container |

### Layout Config

**Auto layout** — calculates the grid from minimum item dimensions:

```ts
{ type: 'auto', minItemWidth: 200, minItemHeight: 150 }
```

**Manual layout** — fixed grid dimensions:

```ts
{ type: 'manual', rows: 3, cols: 4 }
```

### Pagination Config

**Uncontrolled** — the component manages page state internally:

```ts
{
  mode: 'uncontrolled',
  defaultPage?: number,        // initial page (0-indexed)
  onPageChange?: (page) => {}, // notified on change
  renderControl?: (vm) => {},  // custom UI, or false to hide
  position?: 'top' | 'bottom', // default: 'bottom'
  align?: 'start' | 'center' | 'end', // default: 'center'
  draggable?: boolean,         // make the overlay draggable
  label?: ReactNode | (vm) => ReactNode,
}
```

**Controlled** — you own the page state:

```ts
{
  mode: 'controlled',
  page: number,                // current page (0-indexed)
  onPageChange?: (page) => {}, // update your state here
  // ...same options as uncontrolled
}
```

### PaginationVM

The view model passed to `renderControl` and available via `useTrellisPaginationContext()`:

| Property | Type | Description |
| --- | --- | --- |
| `currentPage` | `number` | Current page index (0-based) |
| `totalPages` | `number` | Total number of pages |
| `totalItems` | `number` | Total number of items |
| `itemsPerPage` | `number` | Items fitting on one page |
| `startIndex` | `number` | First visible item index |
| `endIndex` | `number` | Index after last visible item |
| `hasNext` | `boolean` | Whether a next page exists |
| `hasPrev` | `boolean` | Whether a previous page exists |
| `goToPage(page)` | `function` | Navigate to a specific page |
| `next()` | `function` | Go to the next page |
| `prev()` | `function` | Go to the previous page |

### PanelHeaderAPI

Passed to `renderPanelHeader` for controlling individual panels:

| Property | Type | Description |
| --- | --- | --- |
| `close()` | `function` | Close the panel |
| `pin()` / `unpin()` / `togglePin()` | `function` | Pin/unpin the panel |
| `isPinned` | `boolean` | Whether the panel is pinned |
| `minimize()` / `maximize()` / `restore()` | `function` | Window state controls |
| `isMinimized` / `isMaximized` | `boolean` | Current window state |

### PanelManagerAPI

Returned by `useTrellisPanels()` and available on `useTrellisGallery().panels`:

| Property | Type | Description |
| --- | --- | --- |
| `openPanels` | `PanelState[]` | Currently open panels |
| `open(itemIndex)` | `function` | Open a panel for an item |
| `activate(id)` | `function` | Bring a panel to front |
| `close(id)` | `function` | Close a panel by ID |
| `closeAll()` | `function` | Close all panels |
| `closeUnpinned()` | `function` | Close all unpinned panels |
| `togglePin(id)` | `function` | Toggle pin state |
| `isOpen(itemIndex)` | `function` | Check if an item's panel is open |

### Hooks

| Hook | Description |
| --- | --- |
| `useTrellisGallery(options)` | All-in-one hook returning `containerRef`, `containerSize`, `layout`, `pagination`, and `panels` |
| `useTrellisLayout(containerSize, itemCount, config, gap?)` | Computes grid layout from container dimensions |
| `useTrellisPagination(layout, totalItems, config)` | Manages pagination state and navigation |
| `useTrellisPanels(callbacks?)` | Manages floating panel open/close/pin state |
| `useCellInteraction(onActivate)` | Returns props (`role`, `tabIndex`, `onDoubleClick`, `onKeyDown`) for accessible cell activation |
| `useContainerSize(ref)` | Tracks element dimensions via ResizeObserver |
| `useTrellisPaginationContext()` | Reads pagination state from context (for child components of `TrellisGallery`) |

### Utility Functions

| Function | Description |
| --- | --- |
| `calculateLayout(width, height, itemCount, config, gap)` | Pure function that computes grid layout. Returns `LayoutResult` with `rows`, `cols`, `cellWidth`, `cellHeight`, `itemsPerPage`, `totalPages`. |
| `fitGrid(itemCount, maxRows, maxCols)` | Finds the smallest grid (rows × cols) that fits `itemCount` items within bounds. Prefers fewer rows, then fewer columns. |

## Browser Support

Requires browsers with [ResizeObserver](https://caniuse.com/resizeobserver) support (all modern browsers). The library uses `useIsomorphicLayoutEffect` for SSR safety.

## License

[MIT](./LICENSE)
