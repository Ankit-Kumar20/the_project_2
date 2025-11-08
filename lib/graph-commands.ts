import { Node, Edge } from 'reactflow';

export interface GraphCommand {
    type: 'add_node' | 'remove_node' | 'add_edge' | 'remove_edge' | 'update_node' | 'update_edge' | 'none';
    payload?: any;
}

export function executeGraphCommands(
    commands: GraphCommand[],
    currentNodes: Node[],
    currentEdges: Edge[]
): { nodes: Node[], edges: Edge[] } {
    let nodes = [...currentNodes];
    let edges = [...currentEdges];

    for (const command of commands) {
        switch (command.type) {
            case 'add_node':
                nodes = executeAddNode(nodes, command.payload);
                break;
            case 'remove_node':
                const result = executeRemoveNode(nodes, edges, command.payload);
                nodes = result.nodes;
                edges = result.edges;
                break;
            case 'add_edge':
                edges = executeAddEdge(edges, command.payload);
                break;
            case 'remove_edge':
                edges = executeRemoveEdge(edges, command.payload);
                break;
            case 'update_node':
                nodes = executeUpdateNode(nodes, command.payload);
                break;
            case 'update_edge':
                edges = executeUpdateEdge(edges, command.payload);
                break;
            case 'none':
                break;
        }
    }

    return { nodes, edges };
}

function executeAddNode(nodes: Node[], payload: any): Node[] {
    if (!payload?.id || !payload?.label) {
        console.error('Invalid add_node payload:', payload);
        return nodes;
    }

    if (nodes.some(n => n.id === payload.id)) {
        console.warn(`Node with id ${payload.id} already exists`);
        return nodes;
    }

    const newNode: Node = {
        id: payload.id,
        type: 'custom',
        position: payload.position || { x: 250, y: nodes.length * 150 },
        data: {
            label: payload.label,
            day: payload.day,
            info: payload.info,
            googleMapsLink: payload.googleMapsLink,
            activities: payload.activities,
            accommodation: payload.accommodation,
            transportation: payload.transportation,
            estimatedCost: payload.estimatedCost,
            duration: payload.duration,
            tips: payload.tips,
        }
    };

    return [...nodes, newNode];
}

function executeRemoveNode(nodes: Node[], edges: Edge[], payload: any): { nodes: Node[], edges: Edge[] } {
    let nodeId = payload?.id;

    if (!nodeId && payload?.label) {
        const node = nodes.find(n =>
            n.data.label.toLowerCase().includes(payload.label.toLowerCase())
        );
        nodeId = node?.id;
    }

    if (!nodeId) {
        console.error('Cannot find node to remove:', payload);
        return { nodes, edges };
    }

    const newNodes = nodes.filter(n => n.id !== nodeId);
    const newEdges = edges.filter(e => e.source !== nodeId && e.target !== nodeId);

    return { nodes: newNodes, edges: newEdges };
}

function executeAddEdge(edges: Edge[], payload: any): Edge[] {
    if (!payload?.source || !payload?.target) {
        console.error('Invalid add_edge payload:', payload);
        return edges;
    }

    const edgeId = payload.id || `e${payload.source}-${payload.target}`;

    if (edges.some(e => e.id === edgeId)) {
        console.warn(`Edge with id ${edgeId} already exists`);
        return edges;
    }

    const newEdge: Edge = {
        id: edgeId,
        source: payload.source,
        target: payload.target,
        label: payload.label,
        type: payload.type || 'smoothstep',
        animated: false,
    };

    return [...edges, newEdge];
}

function executeRemoveEdge(edges: Edge[], payload: any): Edge[] {
    if (payload?.id) {
        return edges.filter(e => e.id !== payload.id);
    }

    if (payload?.source && payload?.target) {
        return edges.filter(e => !(e.source === payload.source && e.target === payload.target));
    }

    console.error('Invalid remove_edge payload:', payload);
    return edges;
}

function executeUpdateNode(nodes: Node[], payload: any): Node[] {
    let nodeId = payload?.id;

    if (!nodeId && payload?.label) {
        const node = nodes.find(n =>
            n.data.label.toLowerCase().includes(payload.label.toLowerCase())
        );
        nodeId = node?.id;
    }

    if (!nodeId || !payload?.updates) {
        console.error('Invalid update_node payload:', payload);
        return nodes;
    }

    return nodes.map(node => {
        if (node.id === nodeId) {
            return {
                ...node,
                data: {
                    ...node.data,
                    ...payload.updates
                }
            };
        }
        return node;
    });
}

function executeUpdateEdge(edges: Edge[], payload: any): Edge[] {
    if (!payload?.id || !payload?.updates) {
        console.error('Invalid update_edge payload:', payload);
        return edges;
    }

    return edges.map(edge => {
        if (edge.id === payload.id) {
            return {
                ...edge,
                ...payload.updates
            };
        }
        return edge;
    });
}
