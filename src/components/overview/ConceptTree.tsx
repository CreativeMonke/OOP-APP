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
const COURSE_H = 56;
const CONCEPT_W = 150;
const CONCEPT_H = 30;
const ORBIT_R = 200;
const CONCEPT_R_MIN = 85;
const CONCEPT_R_MAX = 220;
const SPREAD_DEG = 100;

function rectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

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

  const rootCenter = useMemo(() => ({ x: 480, y: 310 }), []);

  const courseAngles = useMemo(
    () =>
      courses.map((_, i) => ({
        angle: (i / courses.length) * 2 * Math.PI - Math.PI / 2,
        idx: i,
      })),
    [courses],
  );

  const courseCenters = useMemo(
    () =>
      courseAngles.map(({ angle }) => ({
        x: rootCenter.x + ORBIT_R * Math.cos(angle),
        y: rootCenter.y + ORBIT_R * Math.sin(angle),
      })),
    [courseAngles, rootCenter],
  );

  const { nodes, edges } = useMemo(() => {
    const nodeList: Node[] = [];
    const edgeList: Edge[] = [];

    nodeList.push({
      id: "root",
      type: "root",
      position: { x: rootCenter.x - ROOT_W / 2, y: rootCenter.y - ROOT_H / 2 },
      data: {},
    });

    const expandedIdx = expandedCourseId !== null ? courses.findIndex((c) => c.id === expandedCourseId) : -1;

    const otherRects: { x: number; y: number; w: number; h: number }[] = [];

    courses.forEach((c, i) => {
      const { x, y } = courseCenters[i];
      const stats = courseStats.find((s) => s.id === c.id);
      const done = stats?.done ?? 0;
      const total = stats?.total ?? c.concepts.length;
      const nid = `c-${c.id}`;
      const nextCi = nextConcept !== null && nextConcept.courseId === c.id ? nextConcept.conceptIndex : null;

      const px = x - COURSE_W / 2;
      const py = y - COURSE_H / 2;

      nodeList.push({
        id: nid,
        type: "course",
        position: { x: px, y: py },
        data: {
          courseId: c.id,
          title: c.title,
          pct: total ? (done / total) * 100 : 0,
          conceptCompletions: c.concepts.map((_, ci) => completedConcepts.has(`${c.id}-${ci}`)),
          isExpanded: expandedCourseId === c.id,
          hasNext: nextCi,
          onToggle: () => toggleExpand(c.id),
        },
      });

      otherRects.push({ x: px, y: py, w: COURSE_W, h: COURSE_H });

      edgeList.push({
        id: `e-root-${nid}`,
        source: "root",
        target: nid,
        type: "smoothstep",
        style: {
          stroke: nextCi !== null ? "rgba(129,140,248,0.22)" : "rgba(255,255,255,0.06)",
          strokeWidth: nextCi !== null ? 1.5 : 1,
        },
        animated: nextCi !== null,
      });
    });

    let finalR = CONCEPT_R_MIN;

    if (expandedIdx !== -1) {
      const course = courses[expandedIdx];
      const { angle } = courseAngles[expandedIdx];
      const ctr = courseCenters[expandedIdx];
      const N = course.concepts.length;

      for (let r = CONCEPT_R_MIN; r <= CONCEPT_R_MAX; r += 10) {
        const conceptRects: { x: number; y: number }[] = [];
        for (let k = 0; k < N; k++) {
          const spreadRad = (SPREAD_DEG * Math.PI) / 180;
          const ca = angle - spreadRad / 2 + (k / (Math.max(N - 1, 1))) * spreadRad;
          conceptRects.push({
            x: ctr.x + r * Math.cos(ca) - CONCEPT_W / 2,
            y: ctr.y + r * Math.sin(ca) - CONCEPT_H / 2,
          });
        }

        let collision = false;
        for (let k = 0; k < N && !collision; k++) {
          const cr = conceptRects[k];
          for (const or of otherRects) {
            if (rectsOverlap({ ...cr, w: CONCEPT_W, h: CONCEPT_H }, or)) {
              collision = true;
              break;
            }
          }
          if (!collision) {
            for (let j = 0; j < k; j++) {
              if (rectsOverlap({ ...cr, w: CONCEPT_W, h: CONCEPT_H }, { ...conceptRects[j], w: CONCEPT_W, h: CONCEPT_H })) {
                collision = true;
                break;
              }
            }
          }
        }

        if (!collision) {
          finalR = r;
          break;
        }
      }

      const spreadRad = (SPREAD_DEG * Math.PI) / 180;
      course.concepts.forEach((concept, ci) => {
        const ca = angle - spreadRad / 2 + (ci / (Math.max(N - 1, 1))) * spreadRad;
        const cid = `cpt-${expandedCourseId}-${ci}`;
        const ck = `${expandedCourseId}-${ci}`;
        const nxt = nextConcept !== null && nextConcept.courseId === expandedCourseId && nextConcept.conceptIndex === ci;

        nodeList.push({
          id: cid,
          type: "concept",
          position: {
            x: ctr.x + finalR * Math.cos(ca) - CONCEPT_W / 2,
            y: ctr.y + finalR * Math.sin(ca) - CONCEPT_H / 2,
          },
          data: {
            conceptIndex: ci,
            name: concept.name,
            completed: completedConcepts.has(ck),
            isNext: nxt,
            isWeak: weakConcepts.has(ck),
            onClick: () => handleConceptClick(expandedCourseId!, ci),
          },
        });

        edgeList.push({
          id: `e-c-${expandedCourseId}-${cid}`,
          source: `c-${expandedCourseId}`,
          target: cid,
          type: "default",
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

    return { nodes: nodeList, edges: edgeList };
  }, [courses, courseStats, expandedCourseId, nextConcept, weakConcepts, completedConcepts, toggleExpand, handleConceptClick, rootCenter, courseAngles, courseCenters]);

  useEffect(() => {
    if (expandedCourseId !== null && rf) {
      const t = setTimeout(() => rf.fitView({ duration: 350, padding: 0.3 }), 60);
      return () => clearTimeout(t);
    }
  }, [expandedCourseId, rf]);

  return (
    <div
      className="glass-panel rounded-xl overflow-hidden"
      style={{
        height: 560,
        transition: "height 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div className="px-4 pt-3 pb-1 flex items-center justify-between pointer-events-none">
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
