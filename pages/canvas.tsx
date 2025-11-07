import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "@/lib/auth-client";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";

// Custom node component
const CustomNode = ({ data }: { data: { label: string } }) => {
  return (
    <div
      style={{
        padding: "10px 20px",
        borderRadius: "8px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        border: "2px solid #764ba2",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        minWidth: "150px",
        textAlign: "center",
        fontWeight: "500",
      }}
    >
      {data.label}
    </div>
  );
};

// Define node types
const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: { label: "Start Node" },
    position: { x: 250, y: 100 },
  },
  {
    id: "2",
    data: { label: "Process Node" },
    position: { x: 250, y: 250 },
  },
  {
    id: "3",
    type: "custom",
    data: { label: "Custom Node" },
    position: { x: 250, y: 400 },
  },
  {
    id: "4",
    type: "output",
    data: { label: "End Node" },
    position: { x: 250, y: 550 },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e2-3", source: "2", target: "3", animated: true },
];

export default function Canvas() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  // Show loading state
  if (isPending) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  // Don't render canvas if not authenticated
  if (!session?.user) {
    return null;
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

