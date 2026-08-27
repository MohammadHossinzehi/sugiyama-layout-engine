// Sugiyama Hierarchical Graph Layout Engine
// Implements layer-by-layer hierarchical layout for DAG visualization

export interface Node {
  id: string;
  label?: string;
  width?: number;
  height?: number;
}

export interface Edge {
  source: string;
  target: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface LayoutResult {
  nodes: Map<string, Point>;
  edges: Edge[];
}

class SugiyamaLayout {
  private nodes: Map<string, Node>;
  private edges: Edge[];
  private adjacencyList: Map<string, Set<string>>;
  private layers: string[][];
  private positions: Map<string, Point>;

  constructor(nodes: Node[], edges: Edge[]) {
    this.nodes = new Map(nodes.map(n => [n.id, n]));
    this.edges = edges;
    this.adjacencyList = this.buildAdjacencyList();
    this.layers = [];
    this.positions = new Map();
  }

  private buildAdjacencyList(): Map<string, Set<string>> {
    const adj = new Map<string, Set<string>>();
    for (const node of this.nodes.values()) {
      adj.set(node.id, new Set());
    }
    for (const edge of this.edges) {
      adj.get(edge.source)?.add(edge.target);
    }
    return adj;
  }

  // Step 1: Layering - assign nodes to layers using topological sort
  private layering(): void {
    const inDegree = new Map<string, number>();
    for (const node of this.nodes.values()) {
      inDegree.set(node.id, 0);
    }
    for (const edge of this.edges) {
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }

    const queue: string[] = [];
    for (const [id, degree] of inDegree.entries()) {
      if (degree === 0) queue.push(id);
    }

    let layer = 0;
    while (queue.length > 0) {
      const nextQueue: string[] = [];
      this.layers[layer] = [...queue];

      for (const node of queue) {
        for (const neighbor of this.adjacencyList.get(node) || []) {
          inDegree.set(neighbor, (inDegree.get(neighbor) || 1) - 1);
          if (inDegree.get(neighbor) === 0) {
            nextQueue.push(neighbor);
          }
        }
      }

      queue.length = 0;
      queue.push(...nextQueue);
      layer++;
    }
  }

  // Step 2: Position nodes within layers (left-to-right)
  private positioning(): void {
    const nodeWidth = 120;
    const nodeHeight = 60;
    const horizontalGap = 40;
    const verticalGap = 100;

    for (let layerIdx = 0; layerIdx < this.layers.length; layerIdx++) {
      const layer = this.layers[layerIdx];
      const layerWidth = layer.length * (nodeWidth + horizontalGap);
      const startX = -layerWidth / 2;

      for (let i = 0; i < layer.length; i++) {
        const nodeId = layer[i];
        const x = startX + i * (nodeWidth + horizontalGap) + nodeWidth / 2;
        const y = layerIdx * (nodeHeight + verticalGap);
        this.positions.set(nodeId, { x, y });
      }
    }
  }

  // Step 3: Minimize edge crossings using barycenter heuristic
  private minimizeCrossings(): void {
    for (let i = 1; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const prevLayer = this.layers[i - 1];

      // Calculate barycenter for each node
      const barycenters = new Map<string, number>();
      for (const node of layer) {
        let sum = 0;
        let count = 0;
        for (const prevNode of prevLayer) {
          if (this.adjacencyList.get(prevNode)?.has(node)) {
            const pos = this.positions.get(prevNode);
            if (pos) sum += prevNode.charCodeAt(0); // Use node ID as proxy for position
            count++;
          }
        }
        barycenters.set(node, count > 0 ? sum / count : node.charCodeAt(0));
      }

      // Sort layer by barycenter
      layer.sort((a, b) => (barycenters.get(a) || 0) - (barycenters.get(b) || 0));

      // Reposition nodes in sorted order
      const nodeWidth = 120;
      const nodeHeight = 60;
      const horizontalGap = 40;
      const layerWidth = layer.length * (nodeWidth + horizontalGap);
      const startX = -layerWidth / 2;

      for (let j = 0; j < layer.length; j++) {
        const nodeId = layer[j];
        const x = startX + j * (nodeWidth + horizontalGap) + nodeWidth / 2;
        const y = i * (nodeHeight + 100);
        this.positions.set(nodeId, { x, y });
      }
    }
  }

  // Main layout computation
  layout(): LayoutResult {
    if (this.nodes.size === 0) {
      return { nodes: new Map(), edges: this.edges };
    }

    this.layering();
    this.positioning();
    this.minimizeCrossings();

    return {
      nodes: this.positions,
      edges: this.edges
    };
  }
}

export function computeLayout(nodes: Node[], edges: Edge[]): LayoutResult {
  const layout = new SugiyamaLayout(nodes, edges);
  return layout.layout();
}
