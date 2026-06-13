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
  const g = new Graph({ directed: true });
  g.setGraph({
    rankdir: direction,
    nodesep: nodeSep,
    ranksep: rankSep,
    edgesep: edgeSep,
    marginx: 40,
    marginy: 40,
  });
  g.setDefaultEdgeLabel(() => ({}));

  console.debug(
    "[dagre] nodes:", nodes.length,
    "edges:", edges.length,
    "sample:", edges.slice(0, 3).map((e) => `${e.source}→${e.target}`),
  );

  nodes.forEach((node) => {
    let width = 170;
    let height = 56;

    if (node.type === "root") { width = 140; height = 44; }
    if (node.type === "concept") { width = 150; height = 32; }

    g.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  layout(g);

  const layoutedNodes = nodes.map((node) => {
    const dagreNode = g.node(node.id);

    let w = 170;
    let h = 56;
    if (node.type === "root") { w = 140; h = 44; }
    if (node.type === "concept") { w = 150; h = 32; }

    return {
      ...node,
      position: {
        x: dagreNode.x - w / 2,
        y: dagreNode.y - h / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
