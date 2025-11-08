import { useState, useCallback, useEffect, useRef } from "react";
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
    NodeTypes,
    useReactFlow,
    ReactFlowInstance,
    Handle,
    Position,
} from "reactflow";
import "reactflow/dist/style.css";
import ChatWidget from "@/components/ChatWidget";
import TripDetailsCard from "@/components/TripDetailsCard";
import { useTheme } from "@/lib/theme-context";
import { MapPin, Plus, Minus, CornersOut, CloudCheck, CloudSlash, ClockClockwise } from "@phosphor-icons/react";

// Custom node component - Simple black and white wireframe style
const CustomNode = ({
    data,
}: {
    data: {
        label: string;
        googleMapsLink?: string;
        info?: string;
        day?: number;
    };
}) => {
    // Debug: Log node data to console
    console.log("CustomNode rendered:", {
        label: data.label,
        hasGoogleMapsLink: !!data.googleMapsLink,
        googleMapsLink: data.googleMapsLink,
    });

    const isDark = document.documentElement.classList.contains("dark");

    return (
        <div
            className="py-[14px] px-[18px] rounded-[24px] min-w-[180px] text-center font-normal border-none shadow-none"
            style={{
                background: isDark ? "#1a1a1a" : "#ffffff",
                color: isDark ? "#ffffff" : "#000000",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
        >
            <Handle type="target" position={Position.Top} />
            <div
                className="font-semibold mb-[6px] text-[14px]"
                style={{ color: isDark ? "#fff" : "#000" }}
            >
                {data.label}
            </div>
            {data.day && (
                <div
                    className="text-[11px] mb-[8px] font-normal"
                    style={{ color: isDark ? "#a0a0a0" : "#666" }}
                >
                    Day {data.day}
                </div>
            )}
            {data.googleMapsLink && (
                <a
                    href={data.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-[4px] text-[11px] no-underline border-none py-[4px] px-[10px] rounded-[24px] mt-[2px] transition-all duration-200 font-medium"
                    style={{
                        color: isDark ? "#fff" : "#000",
                        background: isDark ? "#1a1a1a" : "#fff",
                    }}
                    onMouseEnter={(e) => {
                        const dark = document.documentElement.classList.contains("dark");
                        e.currentTarget.style.background = dark ? "#fff" : "#000";
                        e.currentTarget.style.color = dark ? "#000" : "#fff";
                    }}
                    onMouseLeave={(e) => {
                        const dark = document.documentElement.classList.contains("dark");
                        e.currentTarget.style.background = dark ? "#1a1a1a" : "#fff";
                        e.currentTarget.style.color = dark ? "#fff" : "#000";
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log("Google Maps link clicked:", data.googleMapsLink);
                    }}
                >
                    <MapPin size={14} weight="fill" />
                    View on Maps
                </a>
            )}
            <Handle type="source" position={Position.Bottom} />
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
            googleMapsLink:
                "https://www.google.com/maps/search/?api=1&query=Delhi+India",
        },
        position: { x: 250, y: 100 },
    },
    {
        id: "2",
        type: "custom",
        data: {
            label: "Taj Mahal, Agra",
            day: 2,
            googleMapsLink:
                "https://www.google.com/maps/search/?api=1&query=Taj+Mahal+Agra",
        },
        position: { x: 250, y: 250 },
    },
    {
        id: "3",
        type: "custom",
        data: {
            label: "Jaipur City Palace",
            day: 3,
            googleMapsLink:
                "https://www.google.com/maps/search/?api=1&query=City+Palace+Jaipur",
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
    },
    {
        id: "e2-3",
        source: "2",
        target: "3",
        animated: false,
        label: "5h drive",
    },
];

// Custom Controls Component
const CustomControls = () => {
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const { theme } = useTheme();

    const buttonClass =
        "w-[44px] h-[44px] border-none rounded-full cursor-pointer font-light text-[18px] flex items-center justify-center transition-all duration-200";

    return (
        <div className="absolute bottom-[20px] left-[20px] z-[1000] flex flex-col gap-[8px]">
            <button
                onClick={() => zoomIn()}
                className={buttonClass}
                style={{
                    background: theme === "dark" ? "#1a1a1a" : "#fff",
                    color: theme === "dark" ? "#fff" : "#000",
                }}
                onMouseEnter={(e) => {
                    if (theme === "dark") {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = "#000";
                    } else {
                        e.currentTarget.style.background = "#000";
                        e.currentTarget.style.color = "#fff";
                    }
                }}
                onMouseLeave={(e) => {
                    if (theme === "dark") {
                        e.currentTarget.style.background = "#1a1a1a";
                        e.currentTarget.style.color = "#fff";
                    } else {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = "#000";
                    }
                }}
            >
                <Plus size={20} weight="bold" />
            </button>
            <button
                onClick={() => zoomOut()}
                className={buttonClass}
                style={{
                    background: theme === "dark" ? "#1a1a1a" : "#fff",
                    color: theme === "dark" ? "#fff" : "#000",
                }}
                onMouseEnter={(e) => {
                    if (theme === "dark") {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = "#000";
                    } else {
                        e.currentTarget.style.background = "#000";
                        e.currentTarget.style.color = "#fff";
                    }
                }}
                onMouseLeave={(e) => {
                    if (theme === "dark") {
                        e.currentTarget.style.background = "#1a1a1a";
                        e.currentTarget.style.color = "#fff";
                    } else {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = "#000";
                    }
                }}
            >
                <Minus size={20} weight="bold" />
            </button>
            <button
                onClick={() => fitView({ padding: 0.3, maxZoom: 0.9 })}
                className={buttonClass}
                style={{
                    background: theme === "dark" ? "#1a1a1a" : "#fff",
                    color: theme === "dark" ? "#fff" : "#000",
                }}
                onMouseEnter={(e) => {
                    if (theme === "dark") {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = "#000";
                    } else {
                        e.currentTarget.style.background = "#000";
                        e.currentTarget.style.color = "#fff";
                    }
                }}
                onMouseLeave={(e) => {
                    if (theme === "dark") {
                        e.currentTarget.style.background = "#1a1a1a";
                        e.currentTarget.style.color = "#fff";
                    } else {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = "#000";
                    }
                }}
            >
                <CornersOut size={20} weight="bold" />
            </button>
        </div>
    );
};

export default function Canvas() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const { theme } = useTheme();
    const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>(initialEdges);
    const rfRef = useRef<ReactFlowInstance | null>(null);
    const [shouldAutoFit, setShouldAutoFit] = useState(false);
    const [tripDetails, setTripDetails] = useState<any>(null);
    const [history, setHistory] = useState<Array<{ nodes: Node[], edges: Edge[] }>>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load flow data from trip ID or query params
    useEffect(() => {
        const loadTripData = async () => {
            // Load from tripId if provided
            if (router.query.tripId) {
                try {
                    const response = await fetch(`/api/trips/${router.query.tripId}`);
                    const result = await response.json();

                    if (result.success && result.trip?.tripData) {
                        const flowData = result.trip.tripData;
                        if (flowData.nodes && flowData.edges) {
                            const processedNodes = flowData.nodes.map((node: Node) => ({
                                ...node,
                                type: node.type || "custom",
                            }));
                            // Remove per-edge styles to let defaultEdgeOptions apply
                            const processedEdges = flowData.edges.map(({ style, ...edge }: any) => edge);
                            setNodes(processedNodes);
                            setEdges(processedEdges);
                            setShouldAutoFit(true);
                        }
                    }
                    
                    if (result.success && result.trip) {
                        setTripDetails({
                            name: result.trip.name,
                            destinations: result.trip.destinations,
                            startDate: result.trip.startDate,
                            endDate: result.trip.endDate,
                            travellers: result.trip.travellers,
                            pace: result.trip.pace,
                            budget: result.trip.budget,
                            interests: result.trip.interests,
                            mustSees: result.trip.mustSees,
                            avoid: result.trip.avoid,
                            mobilityConstraints: result.trip.mobilityConstraints,
                            travelModes: result.trip.travelModes,
                        });
                    }
                } catch (error) {
                    console.error("Error loading trip data:", error);
                }
            }
            // Fallback to flowData query param (legacy support)
            else if (router.query.flowData) {
                try {
                    const flowData = JSON.parse(router.query.flowData as string);
                    if (flowData.nodes && flowData.edges) {
                        const processedNodes = flowData.nodes.map((node: Node) => ({
                            ...node,
                            type: node.type || "custom",
                        }));
                        // Remove per-edge styles to let defaultEdgeOptions apply
                        const processedEdges = flowData.edges.map(({ style, ...edge }: any) => edge);
                        setNodes(processedNodes);
                        setEdges(processedEdges);
                        setShouldAutoFit(true);
                    }
                } catch (error) {
                    console.error("Error parsing flow data:", error);
                }
            }
        };

        loadTripData();
    }, [router.query.tripId, router.query.flowData, setNodes, setEdges]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isPending && !session?.user) {
            router.push("/login");
        }
    }, [session, isPending, router]);

    // One-time fit after async data loads
    useEffect(() => {
        if (!rfRef.current || !shouldAutoFit || nodes.length === 0) return;
        let raf1 = 0, raf2 = 0;
        raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => {
                rfRef.current?.fitView({ padding: 0.3, maxZoom: 0.9, duration: 200 });
                setShouldAutoFit(false);
            });
        });
        return () => {
            cancelAnimationFrame(raf1);
            cancelAnimationFrame(raf2);
        };
    }, [shouldAutoFit, nodes.length]);

    // Save trip data to database
    const saveTripData = useCallback(async (nodesToSave: Node[], edgesToSave: Edge[]) => {
        const tripId = router.query.tripId;
        if (!tripId || typeof tripId !== 'string') return;

        setIsSaving(true);
        try {
            const response = await fetch(`/api/trips/${tripId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nodes: nodesToSave,
                    edges: edgesToSave
                })
            });

            const result = await response.json();
            if (result.success) {
                setLastSaved(new Date());
            } else {
                console.error('Failed to save trip:', result.error);
            }
        } catch (error) {
            console.error('Error saving trip:', error);
        } finally {
            setIsSaving(false);
        }
    }, [router.query.tripId]);

    // Auto-save with debounce
    const debouncedSave = useCallback((nodesToSave: Node[], edgesToSave: Edge[]) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            saveTripData(nodesToSave, edgesToSave);
        }, 1500);
    }, [saveTripData]);

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
            <div className="flex justify-center items-center h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    // Don't render canvas if not authenticated
    if (!session?.user) {
        return null;
    }

    return (
        <div
            className="w-screen h-screen relative"
            style={{ background: theme === "dark" ? "#0a0a0a" : "#fafafa" }}
        >
            <button
                onClick={() => router.push("/")}
                className="absolute top-[20px] left-[20px] z-[1000] w-[44px] h-[44px] border-none rounded-full cursor-pointer font-light text-[18px] flex items-center justify-center transition-all duration-200"
                style={{
                    background: theme === "dark" ? "#1a1a1a" : "#fff",
                    color: theme === "dark" ? "#fff" : "#000",
                }}
                onMouseEnter={(e) => {
                    if (theme === "dark") {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = "#000";
                    } else {
                        e.currentTarget.style.background = "#000";
                        e.currentTarget.style.color = "#fff";
                    }
                }}
                onMouseLeave={(e) => {
                    if (theme === "dark") {
                        e.currentTarget.style.background = "#1a1a1a";
                        e.currentTarget.style.color = "#fff";
                    } else {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = "#000";
                    }
                }}
            >
                ←
            </button>
            {tripDetails && (
                <div
                    className="absolute top-[20px] left-1/2 transform -translate-x-1/2 z-[1000] py-[12px] px-[28px] font-normal text-[14px]"
                    style={{
                        background: theme === "dark" ? "#1a1a1a" : "#fff",
                        color: theme === "dark" ? "#fff" : "#000",
                        borderRadius: "30px",
                    }}
                >
                    {tripDetails.name || tripDetails.destinations || "Trip"}
                </div>
            )}
        

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.3, maxZoom: 0.9 }}
                onInit={(inst) => {
                    rfRef.current = inst;
                    if (nodes.length) inst.fitView({ padding: 0.3, maxZoom: 0.9 });
                }}
                defaultEdgeOptions={{
                    style: {
                        stroke: theme === "dark" ? "#fff" : "#000",
                        strokeWidth: 1.5,
                    },
                    type: "smoothstep",
                }}
            >
                <Background
                    color={theme === "dark" ? "#404040" : "#bfbfbf"}
                    gap={16}
                    size={2}
                />
                <CustomControls />
            </ReactFlow>
            {tripDetails && <TripDetailsCard tripData={tripDetails} />}
            <ChatWidget
                nodes={nodes}
                edges={edges}
                onGraphUpdate={(newNodes, newEdges) => {
                    setHistory(prev => [...prev.slice(0, historyIndex + 1), { nodes, edges }]);
                    setHistoryIndex(prev => prev + 1);
                    setNodes(newNodes);
                    setEdges(newEdges);
                    debouncedSave(newNodes, newEdges);
                }}
                onUndo={() => {
                    if (historyIndex > 0) {
                        const prevState = history[historyIndex - 1];
                        setNodes(prevState.nodes);
                        setEdges(prevState.edges);
                        setHistoryIndex(prev => prev - 1);
                        debouncedSave(prevState.nodes, prevState.edges);
                    }
                }}
                onRedo={() => {
                    if (historyIndex < history.length - 1) {
                        const nextState = history[historyIndex + 1];
                        setNodes(nextState.nodes);
                        setEdges(nextState.edges);
                        setHistoryIndex(prev => prev + 1);
                        debouncedSave(nextState.nodes, nextState.edges);
                    }
                }}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
            />
        </div>
    );
}
