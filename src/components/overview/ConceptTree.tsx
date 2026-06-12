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

const COURSE_X = 20;
const COURSE_Y_START = 20;
const COURSE_Y_GAP = 88;
const CONCEPT_X_OFFSET = 310;
const CONCEPT_Y_GAP = 46;

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

    courses.forEach((course, i) => {
      const stats = courseStats.find((s) => s.id === course.id);
      const done = stats?.done ?? 0;
      const total = stats?.total ?? course.concepts.length;
      const pct = total ? (done / total) * 100 : 0;
      const hasNext = nextConcept !== null && nextConcept.courseId === course.id;

      const courseNodeId = `course-${course.id}`;
      result.push({
        id: courseNodeId,
        type: "course",
        position: { x: COURSE_X, y: COURSE_Y_START + i * COURSE_Y_GAP },
        data: {
          courseId: course.id,
          title: course.title,
          done,
          total,
          pct,
          isExpanded: expandedCourseId === course.id,
          hasNext,
          onToggle: () => toggleExpand(course.id),
        },
      });

      if (expandedCourseId === course.id) {
        course.concepts.forEach((concept, ci) => {
          const conceptKey = `${course.id}-${ci}`;
          const completed = completedConcepts.has(conceptKey);
          const isNext =
            nextConcept !== null &&
            nextConcept.courseId === course.id &&
            nextConcept.conceptIndex === ci;
          const isWeak = weakConcepts.has(conceptKey);

          const conceptNodeId = `concept-${course.id}-${ci}`;
          result.push({
            id: conceptNodeId,
            type: "concept",
            position: {
              x: COURSE_X + CONCEPT_X_OFFSET,
              y: COURSE_Y_START + i * COURSE_Y_GAP + ci * CONCEPT_Y_GAP,
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
          });
        });
      }
    });

    return { nodes: result, edges: edgeList };
  }, [courses, courseStats, expandedCourseId, nextConcept, weakConcepts, completedConcepts, toggleExpand, handleConceptClick]);

  useEffect(() => {
    if (expandedCourseId !== null && reactFlowInstance) {
      const timeout = setTimeout(() => {
        reactFlowInstance.fitView({ duration: 300, padding: 0.2 });
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [expandedCourseId, reactFlowInstance]);

  return (
    <div className="glass-panel rounded-xl overflow-hidden" style={{ height: 460 }}>
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Concept tree</h3>
        <span className="text-[10px] text-slate-500">click a course to expand</span>
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
          style: { stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 },
        }}
      >
        <Background gap={24} size={1} color="rgba(255,255,255,0.04)" />
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
