import { Graph, layout } from '@dagrejs/dagre';
import { Position, type Node, type Edge } from '@xyflow/react';

interface LayoutOptions {
  direction?: 'TB' | 'LR' | 'BT' | 'RL';
  nodeSep?: number;
  rankSep?: number;
}

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } {
  const { direction = 'LR', nodeSep = 60, rankSep = 140 } = options;

  // 1. Force explicit graph configuration to bypass ESM/bundler translation quirks
  const g = new Graph({ directed: true, multigraph: true });

  // CRITICAL: Dagre options object keys MUST be lowercase ('rankdir', 'nodesep')
  g.setGraph({
    rankdir: direction.toUpperCase(), // Must evaluate strictly to 'LR'
    nodesep: nodeSep,
    ranksep: rankSep,
    marginx: 40,
    marginy: 40,
  });

  g.setDefaultEdgeLabel(() => ({}));

  // DIAGNOSTIC TRACE: Verify exact data counts reaching the engine
  console.log('=== DAGRE INITIALIZATION TRACE ===');
  console.log(`Nodes received: ${nodes.length} | Edges received: ${edges.length}`);
  if (edges.length > 0) {
    console.log('First 3 Edge Connections mapping:');
    edges.slice(0, 3).forEach((e, idx) => {
      console.log(`  [Edge ${idx}]: Source ID "${e.source}" ---> Target ID "${e.target}"`);
    });
  }

  // 2. Map nodes with user's clean if/else style blocks and hardcoded dimensions
  nodes.forEach((node) => {
    let width = 170;
    let height = 56;

    if (node.type === 'root') {
      width = 140;
      height = 44;
    } else if (node.type === 'concept') {
      width = 150;
      height = 32; // Applied concept height adjustment
    }

    g.setNode(node.id, { width, height });
  });

  // 3. Bind edge primitives safely to prevent proxy object reference breaks
  edges.forEach((edge) => {
    g.setEdge(String(edge.source), String(edge.target));
  });

  // Execute graph layout algorithm execution pass
  layout(g);

  // 4. Extract calculated positions and offset coordinates cleanly
  const layoutedNodes = nodes.map((node) => {
    const dagreNode = g.node(node.id);
    
    let w = 170;
    let h = 56;
    if (node.type === 'root') { w = 140; h = 44; }
    if (node.type === 'concept') { w = 150; h = 32; }

    // Enforce layout edge handles configuration rules (Left-to-Right orientation mapping)
    return {
      ...node,
      targetPosition: node.type !== 'root' ? Position.Left : undefined,
      sourcePosition: node.type !== 'concept' ? Position.Right : undefined,
      position: {
        x: dagreNode.x - w / 2,
        y: dagreNode.y - h / 2,
      },
    };
  });

  console.log('=== DAGRE LAYOUT CALCULATED EXECUTION COMPLETE ===');
  return { nodes: layoutedNodes, edges };
} 
