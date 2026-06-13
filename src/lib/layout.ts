import dagre from '@dagrejs/dagre';
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

  // Safe runtime resolution for bundler environments (Vite / Next / Turbopack)
  const DagreGraph = dagre.graphlib?.Graph || (dagre as any).Graph;
  const dagreLayout = dagre.layout || (dagre as any).layout;

  if (!DagreGraph || !dagreLayout) {
    console.error("Dagre engine failed to resolve graph library references.");
    return { nodes, edges };
  }

  const g = new DagreGraph({ directed: true, multigraph: true });

  g.setGraph({
    rankdir: direction.toUpperCase(),
    nodesep: nodeSep,
    ranksep: rankSep,
    marginx: 40,
    marginy: 40,
  });

  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    let width = 170;
    let height = 56;

    if (node.type === 'root') {
      width = 140;
      height = 44;
    } else if (node.type === 'concept') {
      width = 150;
      height = 32;
    }

    g.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    g.setEdge(String(edge.source), String(edge.target));
  });

  // Execute structural ranking solver
  dagreLayout(g);

  const layoutedNodes = nodes.map((node) => {
    const dagreNode = g.node(node.id);
    
    let w = 170;
    let h = 56;
    if (node.type === 'root') { w = 140; h = 44; }
    if (node.type === 'concept') { w = 150; h = 32; }

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

  return { nodes: layoutedNodes, edges };
}
