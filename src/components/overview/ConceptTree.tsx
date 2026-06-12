import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  useReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/base.css";
import { useNavigate } from "react-router-dom";
import { Code2 } from "lucide-react";
import dagre from "@dagrejs/dagre";
import { useProgressStore } from "@/store/useProgressStore";
import { useAppStore } from "@/store/useAppStore";
import RootNodeComponent from "./RootNode";
import CourseNodeComponent from "./CourseNode";
import ConceptNodeComponent from "./ConceptNode";
import type { Course } from "@/types";

interface ConceptTreeProps {
  courses: Course[];
  courseStats: { id: number; done: number; total: number; pct: number }[];
  nextConcept: { courseId: number; conceptIndex: number } | null;
  weakConcepts: Set<string>;
}

const nodeTypes: NodeTypes = {
  root: RootNodeComponent,
  course: CourseNodeComponent,
  concept: ConceptNodeComponent,
};

const ROOT_W = 140;
const ROOT_H = 44;
const COURSE_W = 170;
const CONCEPT_W = 150;
const CONCEPT_H = 26;

function conceptLayout(cx: number, cy: number, count: number): { x: number; y: number }[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 6, ranksep: 32, marginx: 0, marginy: 0 });
  g.setDefaultEdgeLabel(() => ({}));
  g.setNode("_p", { width: COURSE_W, height: 40 });
  for (let i = 0; i < count; i++) {
    g.setNode(`_c${i}`, { width: CONCEPT_W, height: CONCEPT_H });
    g.setEdge("_p", `_c${i}`);
  }
  dagre.layout(g);
  const pPos = g.node("_p");
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const pos = g.node(`_c${i}`);
    positions.push({
      x: cx + COURSE_W / 2 + (pos.x - pPos.x) - CONCEPT_W / 2,
      y: cy + 50 + (pos.y - pPos.y),
    });
  }
  return positions;
}

function ConceptTreeFlow({ courses, courseStats, nextConcept, weakConcepts }: ConceptTreeProps) {
  const navigate = useNavigate();
  const { setActiveCourse, setActiveConceptIndex } = useAppStore();
  const { completedConcepts } = useProgressStore();
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
  const reactFlowInstance = useReactFlow();

  const toggleExpand = useCallback((courseId: number) => {
    setExpandedCourseId((prev) => (prev === courseId ? null : courseId));
  }, []);

  const handleConceptClick = useCallback(
    (courseId: number, conceptIndex: number) => {
      setActiveCourse(courseId);
      setActiveConceptIndex(conceptIndex);
      navigate("/learn");
    },
    [navigate, setActiveCourse, setActiveConceptIndex]
  );

      const COLS = 4;
      const GAP_X = 28;
  const GAP_Y = 90;
  const VIEW_W = 960;
  const totalW = COLS * COURSE_W + (COLS - 1) * GAP_X;
  const startX = (VIEW_W - totalW) / 2;
  const cx = (col: number) => startX + col * (COURSE_W + GAP_X);
  const cy = (row: number) => ROOT_H + 36 + row * GAP_Y;

  const { nodes, edges } = useMemo(() => {
    const result: Node[] = [];
    const edgeList: Edge[] = [];

    result.push({
      id: "root",
      type: "root",
      position: { x: VIEW_W / 2 - ROOT_W / 2, y: 8 },
      data: {},
    });

    courses.forEach((course) => {
      const idx = course.id - 1;
      const col = idx % COLS;
      const row = Math.floor(idx / COLS);
      const x = cx(col);
      const y = cy(row);
      const stats = courseStats.find((s) => s.id === course.id);
      const done = stats?.done ?? 0;
      const total = stats?.total ?? course.concepts.length;
      const conceptCompletions = course.concepts.map(
        (_, ci) => completedConcepts.has(`${course.id}-${ci}`)
      );
      const nextCi =
        nextConcept !== null && nextConcept.courseId === course.id
          ? nextConcept.conceptIndex
          : null;

      const nid = `c-${course.id}`;
      result.push({
        id: nid,
        type: "course",
        position: { x, y },
        data: {
          courseId: course.id,
          title: course.title,
          pct: total ? (done / total) * 100 : 0,
          conceptCompletions,
          isExpanded: expandedCourseId === course.id,
          hasNext: nextCi,
          onToggle: () => toggleExpand(course.id),
        },
      });

      edgeList.push({
        id: `e-root-${nid}`,
        source: "root",
        target: nid,
        sourceHandle: null,
        targetHandle: null,
        type: "smoothstep",
        style: {
          stroke: nextCi !== null
            ? "rgba(129,140,248,0.22)"
            : "rgba(255,255,255,0.06)",
          strokeWidth: nextCi !== null ? 1.5 : 1,
        },
        animated: nextCi !== null,
      });

      if (expandedCourseId === course.id) {
        const cpts = conceptLayout(x, y, course.concepts.length);
        course.concepts.forEach((concept, ci) => {
          const ck = `${course.id}-${ci}`;
          const comp = completedConcepts.has(ck);
          const nxt = nextCi === ci;
          const w = weakConcepts.has(ck);
          const p = cpts[ci];

          result.push({
            id: `cpt-${course.id}-${ci}`,
            type: "concept",
            position: p,
            data: {
              conceptIndex: ci,
              name: concept.name,
              completed: comp,
              isNext: nxt,
              isWeak: w,
              onClick: () => handleConceptClick(course.id, ci),
            },
          });

          edgeList.push({
            id: `e-${nid}-cpt-${ci}`,
            source: nid,
            target: `cpt-${course.id}-${ci}`,
            type: "smoothstep",
            style: {
              stroke: comp
                ? "rgba(52,211,153,0.18)"
                : nxt
                  ? "rgba(129,140,248,0.28)"
                  : "rgba(255,255,255,0.05)",
              strokeWidth: 1,
            },
            animated: nxt,
          });
        });
      }
    });

    return { nodes: result, edges: edgeList };
  }, [courses, courseStats, expandedCourseId, nextConcept, weakConcepts, completedConcepts, toggleExpand, handleConceptClick]);

  useEffect(() => {
    if (expandedCourseId !== null && reactFlowInstance) {
      const t = setTimeout(() => {
        reactFlowInstance.fitView({ duration: 350, padding: 0.25 });
      }, 80);
      return () => clearTimeout(t);
    }
  }, [expandedCourseId, reactFlowInstance]);

  const expanded = expandedCourseId !== null;

  return (
    <div
      className="glass-panel rounded-xl overflow-hidden"
      style={{
        height: expanded ? 640 : 460,
        transition: "height 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 size={14} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Concept tree</h3>
        </div>
        <span className="text-[10px] text-slate-500">
          {expanded ? "click course to collapse" : "click a course to expand"}
        </span>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        minZoom={0.25}
        maxZoom={2}
        panOnDrag
        zoomOnScroll
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 },
        }}
        connectionLineStyle={{ stroke: "transparent" }}
      >
        <Background gap={28} size={1} color="rgba(255,255,255,0.03)" />
        <Controls
          showInteractive={false}
          position="bottom-left"
          style={{
            display: "flex",
            gap: 4,
            background: "transparent",
            border: "none",
            boxShadow: "none",
          }}
        />
      </ReactFlow>
    </div>
  );
}

export default function ConceptTree(props: ConceptTreeProps) {
  return (
    <ReactFlowProvider>
      <ConceptTreeFlow {...props} />
    </ReactFlowProvider>
  );
}
