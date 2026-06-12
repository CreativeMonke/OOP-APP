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
  course: CourseNodeComponent,
  concept: ConceptNodeComponent,
};

const VIEW_W = 960;
const ROOT_Y = 8;
const ROOT_W = 130;
const ROOT_H = 40;

const COLS = 4;
const ROWS = 3;
const COURSE_W = 180;
const COURSE_GAP_X = 24;
const COURSE_GAP_Y = 80;

const CONCEPT_W = 160;
const CONCEPT_GAP = 38;

const TOTAL_COURSE_W = COLS * COURSE_W + (COLS - 1) * COURSE_GAP_X;
const START_X = (VIEW_W - TOTAL_COURSE_W) / 2;

function courseX(col: number) {
  return START_X + col * (COURSE_W + COURSE_GAP_X);
}

function courseY(row: number) {
  return ROOT_Y + ROOT_H + 22 + row * COURSE_GAP_Y;
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

  const { nodes, edges } = useMemo(() => {
    const result: Node[] = [];
    const edgeList: Edge[] = [];
    // Root node
    result.push({
      id: "root",
      type: "default",
      position: { x: VIEW_W / 2 - ROOT_W / 2, y: ROOT_Y },
      data: { label: "" },
      style: {
        width: ROOT_W,
        height: ROOT_H,
        background: "linear-gradient(135deg, rgba(129,140,248,0.2), rgba(103,232,249,0.1))",
        border: "1px solid rgba(129,140,248,0.25)",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        color: "#e2e8f0",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.02em",
        boxShadow: "0 0 24px rgba(129,140,248,0.15)",
      },
    });
    courses.forEach((course) => {
      const courseIndex = course.id - 1;
      const col = courseIndex % COLS;
      const row = Math.floor(courseIndex / COLS);
      const cx = courseX(col);
      const cy = courseY(row);
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

      const courseNodeId = `course-${course.id}`;
      result.push({
        id: courseNodeId,
        type: "course",
        position: { x: cx, y: cy },
        data: {
          courseId: course.id,
          title: course.title,
          done,
          total,
          pct: total ? (done / total) * 100 : 0,
          conceptCompletions,
          isExpanded: expandedCourseId === course.id,
          hasNext: nextCi,
          onToggle: () => toggleExpand(course.id),
        },
      });

      // Edge from root to course
      edgeList.push({
        id: `e-root-${courseNodeId}`,
        source: "root",
        target: courseNodeId,
        type: "smoothstep",
        style: {
          stroke: nextCi !== null ? "rgba(129,140,248,0.2)" : "rgba(255,255,255,0.06)",
          strokeWidth: nextCi !== null ? 1.5 : 1,
        },
        animated: nextCi !== null,
      });

      // Expanded concepts
      if (expandedCourseId === course.id) {
        const conceptsStartY = courseY(ROWS - 1) + COURSE_GAP_Y;
        const conceptBaseX = cx + COURSE_W / 2 - CONCEPT_W / 2;

        course.concepts.forEach((concept, ci) => {
          const conceptKey = `${course.id}-${ci}`;
          const completed = completedConcepts.has(conceptKey);
          const isNext = nextCi === ci;
          const isWeak = weakConcepts.has(conceptKey);

          const conceptNodeId = `concept-${course.id}-${ci}`;
          result.push({
            id: conceptNodeId,
            type: "concept",
            position: {
              x: conceptBaseX,
              y: conceptsStartY + ci * CONCEPT_GAP,
            },
            data: {
              conceptIndex: ci,
              name: concept.name,
              completed,
              isNext,
              isWeak,
              onClick: () => handleConceptClick(course.id, ci),
            },
          });

          edgeList.push({
            id: `e-${courseNodeId}-${conceptNodeId}`,
            source: courseNodeId,
            target: conceptNodeId,
            type: "smoothstep",
            style: {
              stroke: completed
                ? "rgba(52,211,153,0.15)"
                : isNext
                  ? "rgba(129,140,248,0.25)"
                  : "rgba(255,255,255,0.05)",
              strokeWidth: 1,
            },
            animated: isNext,
          });
        });
      }
    });

    return { nodes: result, edges: edgeList };
  }, [courses, courseStats, expandedCourseId, nextConcept, weakConcepts, completedConcepts, toggleExpand, handleConceptClick]);

  useEffect(() => {
    if (expandedCourseId !== null && reactFlowInstance) {
      const timeout = setTimeout(() => {
        reactFlowInstance.fitView({ duration: 350, padding: 0.25 });
      }, 60);
      return () => clearTimeout(timeout);
    }
  }, [expandedCourseId, reactFlowInstance]);

  return (
    <div className="glass-panel rounded-xl overflow-hidden" style={{ height: expandedCourseId !== null ? 620 : 460, transition: "height 0.35s cubic-bezier(0.22, 1, 0.36, 1)" }}>
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 size={14} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Concept tree</h3>
        </div>
        <span className="text-[10px] text-slate-500">
          {expandedCourseId !== null ? "click course to collapse" : "click a course to expand"}
        </span>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        maxZoom={2}
        panOnDrag
        zoomOnScroll
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 },
        }}
      >
        <Background gap={28} size={1} color="rgba(255,255,255,0.03)" />
        <Controls
          showInteractive={false}
          className="!bg-transparent !border-none"
          style={{ gap: 4 }}
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
