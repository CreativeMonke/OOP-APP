import { Graph, layout } from "@dagrejs/dagre";
import type { Node, Edge } from "@xyflow/react";

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

  function dims(type: string | undefined): { w: number; h: number } {
    switch (type) {
      case "root":
        return { w: 140, h: 44 };
      case "concept":
        return { w: 150, h: 30 };
      default:
        return { w: 170, h: 56 };
    }
  }

  nodes.forEach((node) => {
    const d = dims(node.type);
    g.setNode(node.id, {
      width: node.width ?? d.w,
      height: node.height ?? d.h,
    });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  layout(g);

  const layoutedNodes = nodes.map((node) => {
    const dagreNode = g.node(node.id);
    const d = dims(node.type);
    return {
      ...node,
      position: {
        x: dagreNode.x - (node.width ?? d.w) / 2,
        y: dagreNode.y - (node.height ?? d.h) / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
