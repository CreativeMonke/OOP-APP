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
import { useProgressStore } from "@/store/useProgressStore";
import { useAppStore } from "@/store/useAppStore";
import { getLayoutedElements } from "@/lib/layout";
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

function ConceptTreeFlow({ courses, courseStats, nextConcept, weakConcepts }: ConceptTreeProps) {
  const navigate = useNavigate();
  const { setActiveCourse, setActiveConceptIndex } = useAppStore();
  const { completedConcepts } = useProgressStore();
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
  const rf = useReactFlow();

  const toggleExpand = useCallback((id: number) => {
    setExpandedCourseId((prev) => (prev === id ? null : id));
  }, []);

  const handleConceptClick = useCallback(
    (cid: number, ci: number) => {
      setActiveCourse(cid);
      setActiveConceptIndex(ci);
      navigate("/learn");
    },
    [navigate, setActiveCourse, setActiveConceptIndex],
  );

  const { nodes, edges } = useMemo(() => {
    const nodeList: Node[] = [];
    const edgeList: Edge[] = [];

    nodeList.push({
      id: "root-cpp-oop",
      type: "root",
      position: { x: 0, y: 0 },
      data: {},
    });

    courses.forEach((c) => {
      const stats = courseStats.find((s) => s.id === c.id);
      const done = stats?.done ?? 0;
      const total = stats?.total ?? c.concepts.length;
      const nid = `c-${c.id}`;
      const nextCi =
        nextConcept !== null && nextConcept.courseId === c.id
          ? nextConcept.conceptIndex
          : null;

      nodeList.push({
        id: nid,
        type: "course",
        position: { x: 0, y: 0 },
        data: {
          courseId: c.id,
          title: c.title,
          pct: total ? (done / total) * 100 : 0,
          conceptCompletions: c.concepts.map(
            (_, ci) => completedConcepts.has(`${c.id}-${ci}`),
          ),
          isExpanded: expandedCourseId === c.id,
          hasNext: nextCi,
          onToggle: () => toggleExpand(c.id),
        },
      });

      edgeList.push({
        id: `e-root-cpp-oop-${nid}`,
        source: "root-cpp-oop",
        target: nid,
        sourceHandle: "right",
        targetHandle: "left",
        type: "smoothstep",
        style: {
          stroke:
            nextCi !== null
              ? "rgba(129,140,248,0.22)"
              : "rgba(255,255,255,0.06)",
          strokeWidth: nextCi !== null ? 1.5 : 1,
        },
        animated: nextCi !== null,
      });
    });

    if (expandedCourseId !== null) {
      const course = courses.find((c) => c.id === expandedCourseId);
      if (course) {
        course.concepts.forEach((concept, ci) => {
          const cid = `cpt-${expandedCourseId}-${ci}`;
          const ck = `${expandedCourseId}-${ci}`;
          const nxt =
            nextConcept !== null &&
            nextConcept.courseId === expandedCourseId &&
            nextConcept.conceptIndex === ci;

          nodeList.push({
            id: cid,
            type: "concept",
            position: { x: 0, y: 0 },
            data: {
              conceptIndex: ci,
              name: concept.name,
              completed: completedConcepts.has(ck),
              isNext: nxt,
              isWeak: weakConcepts.has(ck),
              onClick: () => handleConceptClick(expandedCourseId, ci),
            },
          });

          edgeList.push({
            id: `e-c-${expandedCourseId}-${cid}`,
            source: `c-${expandedCourseId}`,
            target: cid,
            sourceHandle: "right",
            targetHandle: "left",
            type: "smoothstep",
            style: {
              stroke: completedConcepts.has(ck)
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
    }

    return getLayoutedElements(nodeList, edgeList);
  }, [courses, courseStats, expandedCourseId, nextConcept, weakConcepts, completedConcepts, toggleExpand, handleConceptClick]);

  useEffect(() => {
    if (rf) {
      const t = setTimeout(
        () => rf.fitView({ padding: 0.2, duration: 200 }),
        60,
      );
      return () => clearTimeout(t);
    }
  }, [nodes.length, expandedCourseId, rf]);

  return (
    <div
      className="glass-panel rounded-xl overflow-hidden"
      style={{ height: 520 }}
    >
      <div className="px-4 pt-3 pb-1 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <Code2 size={14} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Concept tree</h3>
        </div>
        <span className="text-[10px] text-slate-500">
          {expandedCourseId !== null
            ? "click course to collapse"
            : "click a course to expand"}
        </span>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        minZoom={0.2}
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
