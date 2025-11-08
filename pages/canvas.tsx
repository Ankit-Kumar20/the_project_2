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

// Custom node component - Simple black and white wireframe style
const CustomNode = ({ data }: { data: { 
  label: string; 
  googleMapsLink?: string;
  info?: string;
  day?: number;
} }) => {
  // Debug: Log node data to console
  console.log('CustomNode rendered:', { label: data.label, hasGoogleMapsLink: !!data.googleMapsLink, googleMapsLink: data.googleMapsLink });
  
  return (
    <div
      style={{
        padding: "14px 18px",
        borderRadius: "4px",
        background: "#ffffff",
        color: "#000000",
        border: "1.5px solid #000000",
        boxShadow: "none",
        minWidth: "180px",
        textAlign: "center",
        fontWeight: "400",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ fontWeight: "600", marginBottom: "6px", fontSize: "14px", color: "#000" }}>
        {data.label}
      </div>
      {data.day && (
        <div style={{ 
          fontSize: "11px", 
          color: "#666", 
          marginBottom: "8px",
          fontWeight: "400"
        }}>
          Day {data.day}
        </div>
      )}
      {data.googleMapsLink && (
        <a
          href={data.googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "11px",
            color: "#000",
            textDecoration: "none",
            background: "#fff",
            border: "1px solid #000",
            padding: "4px 10px",
            borderRadius: "2px",
            marginTop: "2px",
            transition: "all 0.2s",
            fontWeight: "500",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#000";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.color = "#000";
          }}
          onClick={(e) => {
            e.stopPropagation();
            console.log('Google Maps link clicked:', data.googleMapsLink);
          }}
        >
          📍 View on Maps
        </a>
      )}
    </div>
  );
};

// Define node types - use CustomNode as default for all types
const nodeTypes: NodeTypes = {
  custom: CustomNode,
  default: CustomNode,
  input: CustomNode,
  output: CustomNode,
};

const initialNodes: Node[] = [
  {
    id: "1",
    type: "custom",
    data: { 
      label: "Delhi",
      day: 1,
      googleMapsLink: "https://www.google.com/maps/search/?api=1&query=Delhi+India"
    },
    position: { x: 250, y: 100 },
  },
  {
    id: "2",
    type: "custom",
    data: { 
      label: "Taj Mahal, Agra",
      day: 2,
      googleMapsLink: "https://www.google.com/maps/search/?api=1&query=Taj+Mahal+Agra"
    },
    position: { x: 250, y: 250 },
  },
  {
    id: "3",
    type: "custom",
    data: { 
      label: "Jaipur City Palace",
      day: 3,
      googleMapsLink: "https://www.google.com/maps/search/?api=1&query=City+Palace+Jaipur"
    },
    position: { x: 250, y: 400 },
  },
];

const initialEdges: Edge[] = [
  { 
    id: "e1-2", 
    source: "1", 
    target: "2", 
    animated: false, 
    label: "4h drive",
    style: { stroke: '#000', strokeWidth: 1.5 },
    labelStyle: { fill: '#000', fontWeight: 400, fontSize: 11 },
    labelBgStyle: { fill: '#fff', fillOpacity: 0.9 }
  },
  { 
    id: "e2-3", 
    source: "2", 
    target: "3", 
    animated: false, 
    label: "5h drive",
    style: { stroke: '#000', strokeWidth: 1.5 },
    labelStyle: { fill: '#000', fontWeight: 400, fontSize: 11 },
    labelBgStyle: { fill: '#fff', fillOpacity: 0.9 }
  },
];

export default function Canvas() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Load flow data from query params
  useEffect(() => {
    if (router.query.flowData) {
      try {
        const flowData = JSON.parse(router.query.flowData as string);
        if (flowData.nodes && flowData.edges) {
          // Ensure all nodes use 'custom' type to display Google Maps links
          const processedNodes = flowData.nodes.map((node: Node) => ({
            ...node,
            type: node.type || 'custom'
          }));
          setNodes(processedNodes);
          setEdges(flowData.edges);
        }
      } catch (error) {
        console.error("Error parsing flow data:", error);
      }
    }
  }, [router.query.flowData, setNodes, setEdges]);

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
    <div style={{ width: "100vw", height: "100vh", background: "#fafafa" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          style: { stroke: '#000', strokeWidth: 1.5 },
          type: 'smoothstep',
        }}
      >
        <Background color="#e0e0e0" gap={16} size={1} />
        <Controls />
        <MiniMap 
          nodeColor="#ffffff"
          nodeStrokeColor="#000000"
          nodeStrokeWidth={2}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}

