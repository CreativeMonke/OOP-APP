import { Graph, layout } from "@dagrejs/dagre";
import type { Node, Edge } from "@xyflow/react";

const DIMENSIONS: Record<string, { w: number; h: number }> = {
  root: { w: 140, h: 44 },
  course: { w: 170, h: 56 },
  concept: { w: 150, h: 30 },
};

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR" | "BT" | "RL" = "LR",
  nodeSep = 80,
  rankSep = 100,
  edgeSep = 20,
): { nodes: Node[]; edges: Edge[] } {
  const g = new Graph();
  g.setGraph({
    rankdir: direction,
    nodesep: nodeSep,
    ranksep: rankSep,
    edgesep: edgeSep,
    marginx: 40,
    marginy: 40,
  });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    const dim = DIMENSIONS[node.type ?? "concept"] ?? DIMENSIONS.concept;
    g.setNode(node.id, { width: dim.w, height: dim.h });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  layout(g);

  const layoutedNodes = nodes.map((node) => {
    const dagreNode = g.node(node.id);
    const dim = DIMENSIONS[node.type ?? "concept"] ?? DIMENSIONS.concept;
    return {
      ...node,
      position: {
        x: dagreNode.x - dim.w / 2,
        y: dagreNode.y - dim.h / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
