import { type Node, type Edge } from "@xyflow/react";

interface LayoutOptions {
  /** horizontal radius of the course ring, in px */
  ringRadiusX?: number;
  /** vertical radius of the course ring, in px */
  ringRadiusY?: number;
  /** clearance between a course and the nearest edge of its concept column */
  conceptRadialOffset?: number;
  /** vertical gap between stacked sibling concept nodes */
  conceptGap?: number;
}

const SIZE: Record<string, { w: number; h: number }> = {
  root: { w: 140, h: 44 },
  course: { w: 170, h: 56 },
  concept: { w: 150, h: 32 },
};

function sizeFor(type?: string) {
  return SIZE[type ?? "course"] ?? SIZE.course;
}

type Side = "top" | "right" | "bottom" | "left";

/** Which side of a node an edge should attach to, given its direction (degrees, 0 = right, 90 = down). */
function sideFromAngle(deg: number): Side {
  const a = ((deg % 360) + 360) % 360;
  if (a >= 315 || a < 45) return "right";
  if (a < 135) return "bottom";
  if (a < 225) return "left";
  return "top";
}

const OPPOSITE: Record<Side, Side> = { top: "bottom", bottom: "top", left: "right", right: "left" };

/**
 * Radial ring layout for the concept tree.
 *
 * The root sits at the center; courses are distributed evenly around an ellipse
 * (a full 360° ring rather than a one-sided fan or column). The concepts of the
 * currently-expanded course branch outward from it. Each edge is given the
 * handle sides that face its endpoints, so connectors read as clean spokes.
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {},
): { nodes: Node[]; edges: Edge[] } {
  const {
    ringRadiusX = 440,
    ringRadiusY = 215,
    conceptRadialOffset = 70,
    conceptGap = 38,
  } = options;

  const centers = new Map<string, { x: number; y: number }>();

  const root = nodes.find((n) => n.type === "root");
  if (root) centers.set(root.id, { x: 0, y: 0 });

  const courseNodes = nodes.filter((n) => n.type === "course");
  const N = courseNodes.length;

  // Distribute courses around the ellipse, starting at the top and going clockwise.
  courseNodes.forEach((node, i) => {
    const angle = (-90 + (i * 360) / Math.max(N, 1)) * (Math.PI / 180);
    centers.set(node.id, {
      x: ringRadiusX * Math.cos(angle),
      y: ringRadiusY * Math.sin(angle),
    });
  });

  // Concepts branch outward from their parent course, fanned tangentially.
  const conceptsByCourse = new Map<string, Node[]>();
  nodes
    .filter((n) => n.type === "concept")
    .forEach((node) => {
      // id shape: concept-{courseId}-{conceptIndex}
      const courseKey = `course-${node.id.split("-")[1]}`;
      const arr = conceptsByCourse.get(courseKey) ?? [];
      arr.push(node);
      conceptsByCourse.set(courseKey, arr);
    });

  conceptsByCourse.forEach((concepts, courseKey) => {
    const base = centers.get(courseKey);
    if (!base) return;
    const M = concepts.length;
    // Concepts stack vertically (they are short and wide, so a column packs
    // tightly without overlap regardless of where the course sits on the ring).
    const colHalf = ((M - 1) * conceptGap) / 2 + SIZE.concept.h / 2;
    // Push the whole column past the course along the outward radial direction,
    // by enough that it always clears the course node (dynamic in M).
    const len = Math.hypot(base.x, base.y) || 1;
    const ux = base.x / len;
    const uy = base.y / len;
    const dist = conceptRadialOffset + colHalf;
    const colX = base.x + ux * dist;
    const colY = base.y + uy * dist;
    const startY = colY - ((M - 1) * conceptGap) / 2;
    concepts.forEach((node, j) => {
      centers.set(node.id, { x: colX, y: startY + j * conceptGap });
    });
  });

  const layoutedNodes = nodes.map((node) => {
    const center = centers.get(node.id) ?? { x: 0, y: 0 };
    const { w, h } = sizeFor(node.type);
    return { ...node, position: { x: center.x - w / 2, y: center.y - h / 2 } };
  });

  // Assign each edge the handle sides facing its endpoints, and draw as a spoke.
  const layoutedEdges = edges.map((edge) => {
    const sc = centers.get(String(edge.source));
    const tc = centers.get(String(edge.target));
    if (!sc || !tc) return edge;
    const deg = (Math.atan2(tc.y - sc.y, tc.x - sc.x) * 180) / Math.PI;
    const srcSide = sideFromAngle(deg);
    const tgtSide = OPPOSITE[srcSide];
    return {
      ...edge,
      type: "straight",
      sourceHandle: `s-${srcSide}`,
      targetHandle: `t-${tgtSide}`,
    };
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
}
