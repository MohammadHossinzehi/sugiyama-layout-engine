# Sugiyama Hierarchical Graph Layout Engine

A high-performance TypeScript implementation of the Sugiyama hierarchical graph layout algorithm for directed acyclic graphs (DAGs). Perfect for visualizing flowcharts, dependency graphs, organizational hierarchies, and other hierarchical structures.

## What It Does

This library computes hierarchical layouts for DAGs using the Sugiyama layering algorithm, which is particularly useful for:

- **Flowchart visualization**: Automatically arrange flowchart nodes in layers
- **Dependency graphs**: Visualize software dependencies, project tasks, or build systems
- **Organizational charts**: Render hierarchies with clear visual hierarchy
- **Tree-like structures**: Any acyclic directed graph benefits from this layout

The algorithm works in three phases:

1. **Layering**: Assigns nodes to layers using topological sort
2. **Positioning**: Places nodes within their layers using configurable spacing
3. **Crossing minimization**: Reduces edge crossings using barycenter heuristics

## How It Works

The Sugiyama algorithm is fundamentally different from force-directed layouts (like Fruchterman-Reingold). Instead of simulating physics, it:

1. Computes an in-degree for each node
2. Assigns nodes to layers based on topological ordering
3. Sorts nodes within layers to minimize edge crossings using the barycenter method
4. Positions nodes at consistent vertical intervals

This approach guarantees a layered structure with edges generally flowing left-to-right, making hierarchies visually apparent.

## Installation

```bash
npm install sugiyama-layout-engine
```

## Usage

```typescript
import { computeLayout, Node, Edge } from 'sugiyama-layout-engine';

const nodes: Node[] = [
  { id: 'a', label: 'Start' },
  { id: 'b', label: 'Process' },
  { id: 'c', label: 'Decision' },
  { id: 'd', label: 'End' },
];

const edges: Edge[] = [
  { source: 'a', target: 'b' },
  { source: 'b', target: 'c' },
  { source: 'c', target: 'd' },
];

const layout = computeLayout(nodes, edges);

// layout.nodes is a Map<string, { x: number, y: number }>
// Use these coordinates to render nodes in your visualization
layout.nodes.forEach((pos, nodeId) => {
  console.log(`Node ${nodeId} at (${pos.x}, ${pos.y})`);
});
```

## Design Decisions

### Three-Phase Approach
The classic Sugiyama algorithm uses four phases; this implementation uses three:
- **Omitted phase**: Long edge elimination (dummy node insertion). For simplicity and performance, we don't split long edges, accepting that some edges may span multiple layers. This is acceptable for most visualization use cases.
- **Included optimization**: Barycenter-based crossing minimization in the positioning phase rather than iterative layer-by-layer refinement, trading slightly more crossings for O(n log n) performance.

### Coordinate System
- Origin (0, 0) is at the center of the layout
- X increases left-to-right within layers
- Y increases top-to-bottom across layers
- Layer vertical spacing is fixed at 100 units; node horizontal spacing is 160 units

### Performance
- Time complexity: O(n + m) for layering, O(n log n) for sorting
- Space complexity: O(n + m)
- Suitable for graphs with hundreds to thousands of nodes

## Testing

Run the test suite:

```bash
npm run build
npm test
```

Tests verify:
- Correct layer assignment for various DAG structures
- Proper positioning of nodes within layers
- Crossing minimization on complex graphs
- Edge case handling (single node, linear chain, fully connected)

## API Reference

### `computeLayout(nodes: Node[], edges: Edge[]): LayoutResult`

Main entry point. Computes hierarchical positions for all nodes.

**Parameters:**
- `nodes`: Array of nodes with unique IDs
- `edges`: Array of edges (source must come before target in topological order)

**Returns:** LayoutResult with a Map of node positions and edge list

### Interfaces

```typescript
interface Node {
  id: string;
  label?: string;
  width?: number;
  height?: number;
}

interface Edge {
  source: string;
  target: string;
}

interface Point {
  x: number;
  y: number;
}

interface LayoutResult {
  nodes: Map<string, Point>;
  edges: Edge[];
}
```

## Related Work

- **Force-directed layouts** (Fruchterman-Reingold, D3 simulations): Better for general networks, less suitable for hierarchies
- **Tree layouts** (radial, balloon): Specialized for trees only
- **Layered layouts** (Sugiyama, Graphviz): Optimized for DAGs and hierarchies

This implementation follows the classic Sugiyama algorithm design patterns found in Graphviz and academic literature.

## License

MIT

## Author

Mohammad Hossinzehi
