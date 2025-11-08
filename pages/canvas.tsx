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
    EdgeTypes,
    useReactFlow,
    ReactFlowInstance,
    Handle,
    Position,
    EdgeProps,
    getBezierPath,
} from "reactflow";
import "reactflow/dist/style.css";
import ChatWidget from "@/components/ChatWidget";
import TripDetailsCard from "@/components/TripDetailsCard";
import { useTheme } from "@/lib/theme-context";
import { MapPin, Plus, Minus, CornersOut, CloudCheck, CloudSlash, ClockClockwise, Moon, Sun, FilePdf } from "@phosphor-icons/react";
import { jsPDF } from "jspdf";

// Custom Edge component with distance display
const CustomEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
}: EdgeProps) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const isDark = document.documentElement.classList.contains("dark");

    return (
        <>
            <path
                id={id}
                className="react-flow__edge-path"
                d={edgePath}
                strokeWidth={1.5}
                stroke={isDark ? "#fff" : "#000"}
            />
            {data?.distance && (
                <foreignObject
                    width={120}
                    height={40}
                    x={labelX - 60}
                    y={labelY - 20}
                    className="edgebutton-foreignobject"
                    requiredExtensions="http://www.w3.org/1999/xhtml"
                >
                    <div
                        style={{
                            background: isDark ? "#1a1a1a" : "#fff",
                            color: isDark ? "#fff" : "#000",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "500",
                            textAlign: "center",
                            border: `1px solid ${isDark ? "#404040" : "#e0e0e0"}`,
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        }}
                    >
                        {data.distance}
                    </div>
                </foreignObject>
            )}
        </>
    );
};

// Custom node component - Simple black and white wireframe style
const CustomNode = ({
    data,
}: {
    data: {
        label: string;
        googleMapsLink?: string;
        info?: string;
        day?: number;
        theme?: string;
        coordinates?: { lat: number; lng: number };
    };
}) => {
    // Debug: Log node data to console
    console.log("CustomNode rendered:", {
        label: data.label,
        hasGoogleMapsLink: !!data.googleMapsLink,
        googleMapsLink: data.googleMapsLink,
    });

    const isDark = data.theme === "dark";

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
                        e.currentTarget.style.background = isDark ? "#fff" : "#000";
                        e.currentTarget.style.color = isDark ? "#000" : "#fff";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = isDark ? "#1a1a1a" : "#fff";
                        e.currentTarget.style.color = isDark ? "#fff" : "#000";
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

// Define edge types
const edgeTypes: EdgeTypes = {
    default: CustomEdge,
    smoothstep: CustomEdge,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Custom Controls Component
const CustomControls = ({ nodes, tripDetails }: { nodes: Node[], tripDetails: any }) => {
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const { theme, toggleTheme } = useTheme();
    const [isExporting, setIsExporting] = useState(false);

    const exportToPdf = async () => {
        setIsExporting(true);
        try {
            const response = await fetch('/api/enhance-pdf-details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tripDetails, nodes })
            });

            const result = await response.json();
            if (result.success) {
                const { tripOverview, enhancedLocations } = result.data;
                
                // Create PDF
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const margin = 15;
                const maxWidth = pageWidth - (margin * 2);
                let yPosition = margin;

                // Helper function to add text with word wrap
                const addText = (text: string, fontSize: number, isBold: boolean = false, isTitle: boolean = false) => {
                    pdf.setFontSize(fontSize);
                    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
                    
                    const lines = pdf.splitTextToSize(text, maxWidth);
                    
                    lines.forEach((line: string, index: number) => {
                        if (yPosition + 10 > pageHeight - margin) {
                            pdf.addPage();
                            yPosition = margin;
                        }
                        
                        if (isTitle && index === 0) {
                            pdf.text(line, pageWidth / 2, yPosition, { align: 'center' });
                        } else {
                            pdf.text(line, margin, yPosition);
                        }
                        yPosition += fontSize * 0.5;
                    });
                };

                // Helper function to add bullet points
                const addBulletPoints = (points: string[], fontSize: number = 11) => {
                    pdf.setFontSize(fontSize);
                    pdf.setFont('helvetica', 'normal');
                    
                    points.forEach((point: string) => {
                        // Remove existing bullet if present
                        const cleanPoint = point.replace(/^[•\-\*]\s*/, '');
                        const bulletWidth = 5;
                        const textMaxWidth = maxWidth - bulletWidth;
                        const lines = pdf.splitTextToSize(cleanPoint, textMaxWidth);
                        
                        lines.forEach((line: string, index: number) => {
                            if (yPosition + 10 > pageHeight - margin) {
                                pdf.addPage();
                                yPosition = margin;
                            }
                            
                            if (index === 0) {
                                // Add bullet for first line
                                pdf.text('•', margin, yPosition);
                                pdf.text(line, margin + bulletWidth, yPosition);
                            } else {
                                // Indent continuation lines
                                pdf.text(line, margin + bulletWidth, yPosition);
                            }
                            yPosition += fontSize * 0.45;
                        });
                        yPosition += 2; // Extra space after each bullet point
                    });
                };

                // Title
                addText(tripDetails?.name || 'Travel Itinerary', 22, true, true);
                yPosition += 5;

                // Trip Details
                if (tripDetails?.destinations) {
                    addText(`Destinations: ${tripDetails.destinations}`, 11, false);
                    yPosition += 3;
                }
                if (tripDetails?.startDate && tripDetails?.endDate) {
                    const startDate = new Date(tripDetails.startDate).toLocaleDateString();
                    const endDate = new Date(tripDetails.endDate).toLocaleDateString();
                    addText(`Dates: ${startDate} - ${endDate}`, 11, false);
                    yPosition += 3;
                }
                if (tripDetails?.travellers) {
                    addText(`Travellers: ${tripDetails.travellers}`, 11, false);
                    yPosition += 3;
                }
                if (tripDetails?.budget) {
                    addText(`Budget: ${tripDetails.budget}`, 11, false);
                    yPosition += 3;
                }
                
                yPosition += 10;

                // Trip Overview
                addText('Trip Overview', 16, true);
                yPosition += 5;
                if (Array.isArray(tripOverview)) {
                    addBulletPoints(tripOverview);
                } else {
                    addText(tripOverview, 11, false);
                }
                yPosition += 10;

                // Enhanced Locations
                addText('Detailed Itinerary', 16, true);
                yPosition += 8;

                enhancedLocations.forEach((location: any) => {
                    addText(`Day ${location.day}: ${location.location}`, 14, true);
                    yPosition += 5;
                    if (Array.isArray(location.points)) {
                        addBulletPoints(location.points);
                    } else if (location.enhancedInfo) {
                        addText(location.enhancedInfo, 11, false);
                    }
                    yPosition += 8;
                });

                // Download PDF
                const fileName = `${tripDetails?.name || 'Trip'}_Itinerary.pdf`;
                pdf.save(fileName);
            } else {
                alert('Failed to enhance PDF details: ' + result.error);
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export PDF');
        } finally {
            setIsExporting(false);
        }
    };

    const buttonClass =
        "w-[44px] h-[44px] border-none rounded-full cursor-pointer font-light text-[18px] flex items-center justify-center transition-all duration-200";

    return (
        <div className="absolute bottom-[20px] left-[20px] z-[1000] flex flex-col gap-[8px]">
            <button
                onClick={exportToPdf}
                disabled={isExporting}
                className={buttonClass}
                style={{
                    background: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
                    color: theme === "dark" ? "#fff" : "#000",
                    opacity: isExporting ? 0.5 : 1,
                    cursor: isExporting ? 'wait' : 'pointer'
                }}
                onMouseEnter={(e) => {
                    if (!isExporting) {
                        if (theme === "dark") {
                            e.currentTarget.style.background = "#fff";
                            e.currentTarget.style.color = "#000";
                        } else {
                            e.currentTarget.style.background = "#000";
                            e.currentTarget.style.color = "#fff";
                        }
                    }
                }}
                onMouseLeave={(e) => {
                    if (theme === "dark") {
                        e.currentTarget.style.background = "#1a1a1a";
                        e.currentTarget.style.color = "#fff";
                    } else {
                        e.currentTarget.style.background = "#f3f4f6";
                        e.currentTarget.style.color = "#000";
                    }
                }}
            >
                <FilePdf size={20} weight="bold" />
            </button>
            <button
                onClick={toggleTheme}
                className={buttonClass}
                style={{
                    background: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
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
                        e.currentTarget.style.background = "#f3f4f6";
                        e.currentTarget.style.color = "#000";
                    }
                }}
            >
                {theme === "dark" ? <Sun size={20} weight="bold" /> : <Moon size={20} weight="bold" />}
            </button>
            <button
                onClick={() => zoomIn()}
                className={buttonClass}
                style={{
                    background: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
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
                        e.currentTarget.style.background = "#f3f4f6";
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
                    background: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
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
                        e.currentTarget.style.background = "#f3f4f6";
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
                    background: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
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
                        e.currentTarget.style.background = "#f3f4f6";
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
    const [isLoadingTrip, setIsLoadingTrip] = useState(true);
    const [loadingDistances, setLoadingDistances] = useState(false);

    // Calculate distance between two nodes
    const calculateDistance = useCallback(async (sourceNode: Node, targetNode: Node) => {
        const sourceCoords = sourceNode.data.coordinates;
        const targetCoords = targetNode.data.coordinates;
        
        if (!sourceCoords || !targetCoords) {
            return null;
        }

        try {
            const response = await fetch('/api/distance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    origins: `${sourceCoords.lat},${sourceCoords.lng}`,
                    destinations: `${targetCoords.lat},${targetCoords.lng}`,
                }),
            });

            const data = await response.json();
            return data.distance || null;
        } catch (error) {
            console.error('Error calculating distance:', error);
            return null;
        }
    }, []);

    // Update edges with distances
    const updateEdgesWithDistances = useCallback(async (nodesToProcess: Node[], edgesToProcess: Edge[]) => {
        setLoadingDistances(true);
        const updatedEdges = await Promise.all(
            edgesToProcess.map(async (edge) => {
                const sourceNode = nodesToProcess.find(n => n.id === edge.source);
                const targetNode = nodesToProcess.find(n => n.id === edge.target);
                
                if (sourceNode && targetNode) {
                    const distance = await calculateDistance(sourceNode, targetNode);
                    if (distance) {
                        return {
                            ...edge,
                            data: { ...edge.data, distance }
                        };
                    }
                }
                return edge;
            })
        );
        setLoadingDistances(false);
        return updatedEdges;
    }, [calculateDistance]);

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
                            // Remove per-edge styles and type to let defaultEdgeOptions apply
                            const processedEdges = flowData.edges.map(({ style, type, ...edge }: any) => edge);
                            setNodes(processedNodes);
                            
                            // Calculate distances for edges
                            const edgesWithDistances = await updateEdgesWithDistances(processedNodes, processedEdges);
                            setEdges(edgesWithDistances);
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
                } finally {
                    setIsLoadingTrip(false);
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
                        // Remove per-edge styles and type to let defaultEdgeOptions apply
                        const processedEdges = flowData.edges.map(({ style, type, ...edge }: any) => edge);
                        setNodes(processedNodes);
                        setEdges(processedEdges);
                        setShouldAutoFit(true);
                    }
                } catch (error) {
                    console.error("Error parsing flow data:", error);
                } finally {
                    setIsLoadingTrip(false);
                }
            } else {
                setIsLoadingTrip(false);
            }
        };

        loadTripData();
    }, [router.query.tripId, router.query.flowData, setNodes, setEdges, updateEdgesWithDistances]);

    // Update nodes and edges theme when theme changes
    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    theme,
                },
            }))
        );
        setEdges((eds) =>
            eds.map((edge) => ({
                ...edge,
                labelStyle: {
                    fill: theme === "dark" ? "#fff" : "#000",
                    fontSize: 12,
                    fontWeight: 500,
                },
                labelBgStyle: {
                    fill: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
                    fillOpacity: 1,
                },
                labelBgPadding: [8, 12] as [number, number],
                labelBgBorderRadius: 12,
            }))
        );
    }, [theme, setNodes, setEdges]);

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
    if (isPending || isLoadingTrip) {
        return (
            <div 
                className="flex flex-col justify-center items-center h-screen gap-4"
                style={{ background: theme === "dark" ? "#0a0a0a" : "#fafafa" }}
            >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme === "dark" ? "#fff" : "#000" }}></div>
                <p style={{ color: theme === "dark" ? "#fff" : "#000" }}>Loading trip...</p>
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
                    background: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
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
                        e.currentTarget.style.background = "#f3f4f6";
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
                        background: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
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
                edgeTypes={edgeTypes}
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
                    type: "default",
                    labelStyle: {
                        fill: theme === "dark" ? "#fff" : "#000",
                        fontSize: 12,
                        fontWeight: 500,
                    },
                    labelBgStyle: {
                        fill: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
                        fillOpacity: 1,
                    },
                    labelBgPadding: [8, 12] as [number, number],
                    labelBgBorderRadius: 12,
                }}
            >
                <Background
                    color={theme === "dark" ? "#404040" : "#bfbfbf"}
                    gap={16}
                    size={2}
                />
                <CustomControls nodes={nodes} tripDetails={tripDetails} />
            </ReactFlow>
            {tripDetails && <TripDetailsCard tripData={tripDetails} />}
            <ChatWidget
                nodes={nodes}
                edges={edges}
                onGraphUpdate={async (newNodes, newEdges) => {
                    setHistory(prev => [...prev.slice(0, historyIndex + 1), { nodes, edges }]);
                    setHistoryIndex(prev => prev + 1);
                    setNodes(newNodes);
                    
                    // Calculate distances for new edges
                    const edgesWithDistances = await updateEdgesWithDistances(newNodes, newEdges);
                    setEdges(edgesWithDistances);
                    debouncedSave(newNodes, edgesWithDistances);
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
