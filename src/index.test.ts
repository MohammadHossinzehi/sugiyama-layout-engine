import { computeLayout, Node, Edge } from './index';

describe('Sugiyama Layout Engine', () => {
  test('single node layout', () => {
    const nodes: Node[] = [{ id: 'a' }];
    const edges: Edge[] = [];
    
    const layout = computeLayout(nodes, edges);
    expect(layout.nodes.size).toBe(1);
    expect(layout.nodes.has('a')).toBe(true);
  });

  test('two node linear graph', () => {
    const nodes: Node[] = [
      { id: 'a' },
      { id: 'b' },
    ];
    const edges: Edge[] = [{ source: 'a', target: 'b' }];
    
    const layout = computeLayout(nodes, edges);
    expect(layout.nodes.size).toBe(2);
    
    const posA = layout.nodes.get('a');
    const posB = layout.nodes.get('b');
    
    expect(posA).toBeDefined();
    expect(posB).toBeDefined();
    // B should be in a lower layer (higher Y)
    expect((posB?.y || 0) > (posA?.y || 0)).toBe(true);
  });

  test('three node chain', () => {
    const nodes: Node[] = [
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
    ];
    const edges: Edge[] = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
    ];
    
    const layout = computeLayout(nodes, edges);
    expect(layout.nodes.size).toBe(3);
    
    const posA = layout.nodes.get('a');
    const posB = layout.nodes.get('b');
    const posC = layout.nodes.get('c');
    
    // Verify layering: A before B before C
    expect((posA?.y || 0) < (posB?.y || 0)).toBe(true);
    expect((posB?.y || 0) < (posC?.y || 0)).toBe(true);
  });

  test('diamond shaped DAG', () => {
    const nodes: Node[] = [
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
      { id: 'd' },
    ];
    const edges: Edge[] = [
      { source: 'a', target: 'b' },
      { source: 'a', target: 'c' },
      { source: 'b', target: 'd' },
      { source: 'c', target: 'd' },
    ];
    
    const layout = computeLayout(nodes, edges);
    expect(layout.nodes.size).toBe(4);
    
    const posA = layout.nodes.get('a');
    const posB = layout.nodes.get('b');
    const posC = layout.nodes.get('c');
    const posD = layout.nodes.get('d');
    
    // A is in layer 0
    expect(posA?.y).toEqual(0);
    // B and C in layer 1
    expect(posB?.y).toEqual(posC?.y);
    expect((posB?.y || 0) > 0).toBe(true);
    // D in layer 2
    expect((posD?.y || 0) > (posB?.y || 0)).toBe(true);
  });

  test('complex DAG with multiple paths', () => {
    const nodes: Node[] = [
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
      { id: 'd' },
      { id: 'e' },
    ];
    const edges: Edge[] = [
      { source: 'a', target: 'b' },
      { source: 'a', target: 'c' },
      { source: 'b', target: 'd' },
      { source: 'c', target: 'd' },
      { source: 'c', target: 'e' },
      { source: 'd', target: 'e' },
    ];
    
    const layout = computeLayout(nodes, edges);
    expect(layout.nodes.size).toBe(5);
    
    // Verify layering property: source Y < target Y for all edges
    for (const edge of edges) {
      const sourcePos = layout.nodes.get(edge.source);
      const targetPos = layout.nodes.get(edge.target);
      expect((sourcePos?.y || 0) < (targetPos?.y || 0)).toBe(true);
    }
  });

  test('wide graph with many nodes in one layer', () => {
    const nodeCount = 20;
    const nodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({
      id: `node_${i}`,
    }));
    const edges: Edge[] = Array.from({ length: nodeCount - 1 }, (_, i) => ({
      source: `node_${i}`,
      target: `node_${i + 1}`,
    }));
    
    const layout = computeLayout(nodes, edges);
    expect(layout.nodes.size).toBe(nodeCount);
    
    // All positions should be defined
    for (const node of nodes) {
      expect(layout.nodes.has(node.id)).toBe(true);
    }
  });

  test('empty graph', () => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    const layout = computeLayout(nodes, edges);
    expect(layout.nodes.size).toBe(0);
  });

  test('return value has edges preserved', () => {
    const nodes: Node[] = [
      { id: 'a' },
      { id: 'b' },
    ];
    const edges: Edge[] = [{ source: 'a', target: 'b' }];
    
    const layout = computeLayout(nodes, edges);
    expect(layout.edges).toEqual(edges);
  });
});
