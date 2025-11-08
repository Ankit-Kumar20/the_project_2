import React, { useState, useRef, useEffect } from "react";
import { Trash, PaperPlaneTilt, ChatCircle, Sparkle, ArrowCounterClockwise, ArrowClockwise } from "@phosphor-icons/react";
import { useTheme } from "@/lib/theme-context";
import { Node, Edge } from "reactflow";

interface ChatWidgetProps {
    nodes: Node[];
    edges: Edge[];
    onGraphUpdate: (nodes: Node[], edges: Edge[]) => void;
    onUndo?: () => void;
    onRedo?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
}

export default function ChatWidget({ nodes, edges, onGraphUpdate, onUndo, onRedo, canUndo, canRedo }: ChatWidgetProps) {
    const { theme } = useTheme();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Array<{ id: string; role: string; text: string }>>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);
    
    const isDark = theme === "dark";

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTo({
                top: listRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { id: Date.now().toString(), role: "user", text: input };
        setMessages([...messages, userMessage]);
        const currentInput = input;
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch('/api/chatbot/graph-command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: currentInput,
                    nodes: nodes,
                    edges: edges,
                    conversationHistory: messages
                })
            });

            const result = await response.json();

            if (result.success && result.data) {
                const assistantMessage = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    text: result.data.message
                };
                setMessages(prev => [...prev, assistantMessage]);

                // If the graph was changed by the LLM, use the complete new graph structure
                if (result.data.graphChanged && result.data.graph) {
                    console.log('📊 Applying complete graph from LLM:', {
                        nodes: result.data.graph.nodes.length,
                        edges: result.data.graph.edges.length
                    });
                    onGraphUpdate(result.data.graph.nodes, result.data.graph.edges);
                }
            } else {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    text: "Sorry, I encountered an error processing your request."
                }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                text: "Sorry, I couldn't process your request. Please try again."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = () => {
        setMessages([]);
        setInput("");
        if (listRef.current) {
            listRef.current.scrollTo({ top: 0, behavior: "auto" });
        }
    };

    return (
        <React.Fragment>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-5 right-5 z-[102] w-[44px] h-[44px] border-none rounded-full cursor-pointer font-light text-[18px] flex items-center justify-center transition-all duration-200"
                    style={{
                        background: isDark ? "#1a1a1a" : "#f3f4f6",
                        color: isDark ? "#fff" : "#000",
                    }}
                    onMouseEnter={(e) => {
                        if (isDark) {
                            e.currentTarget.style.background = "#fff";
                            e.currentTarget.style.color = "#000";
                        } else {
                            e.currentTarget.style.background = "#000";
                            e.currentTarget.style.color = "#fff";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (isDark) {
                            e.currentTarget.style.background = "#1a1a1a";
                            e.currentTarget.style.color = "#fff";
                        } else {
                            e.currentTarget.style.background = "#f3f4f6";
                            e.currentTarget.style.color = "#000";
                        }
                    }}
                    title="Open chat"
                >
                    <Sparkle size={20} weight="bold" />
                </button>
            )}

            {isOpen && (
                <div className={`fixed bottom-4 right-4 z-[102] w-[400px] h-[500px] rounded-[24px] overflow-hidden flex flex-col border-[1.5px] ${
                    isDark 
                        ? "bg-[#1a1a1a] text-white border-[#2a2a2a] shadow-[0_4px_6px_rgba(0,0,0,0.5)]" 
                        : "bg-[#f3f4f6] text-black border-[#e5e5e5] shadow-[0_4px_6px_rgba(0,0,0,0.1)]"
                }`}>
                    <div className={`flex items-center justify-between px-4 py-3 border-b ${
                        isDark 
                            ? "bg-[rgba(26,26,26,0.95)] border-[#2a2a2a]" 
                            : "bg-[rgba(243,244,246,0.95)] border-[#e5e5e5]"
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                isDark ? "bg-[#2a2a2a]" : "bg-[#f5f5f5]"
                            }`}>
                                <ChatCircle size={20} weight="regular" color={isDark ? "#a0a0a0" : "#666"} />
                            </div>
                            <div>
                                <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-black"}`}>AI Assistant</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {onUndo && (
                                <button
                                    onClick={onUndo}
                                    disabled={!canUndo}
                                    className={`h-8 w-8 rounded-[24px] border-none bg-transparent cursor-pointer flex items-center justify-center transition-all duration-200 ${
                                        isDark ? "hover:bg-[#2a2a2a]" : "hover:bg-[#f5f5f5]"
                                    } ${!canUndo ? "opacity-30 cursor-not-allowed" : ""}`}
                                    title="Undo"
                                >
                                    <ArrowCounterClockwise size={18} weight="regular" color={isDark ? "#a0a0a0" : "#666"} />
                                </button>
                            )}
                            {onRedo && (
                                <button
                                    onClick={onRedo}
                                    disabled={!canRedo}
                                    className={`h-8 w-8 rounded-[24px] border-none bg-transparent cursor-pointer flex items-center justify-center transition-all duration-200 ${
                                        isDark ? "hover:bg-[#2a2a2a]" : "hover:bg-[#f5f5f5]"
                                    } ${!canRedo ? "opacity-30 cursor-not-allowed" : ""}`}
                                    title="Redo"
                                >
                                    <ArrowClockwise size={18} weight="regular" color={isDark ? "#a0a0a0" : "#666"} />
                                </button>
                            )}
                            <button
                                onClick={handleClearChat}
                                className={`h-8 w-8 rounded-[24px] border-none bg-transparent cursor-pointer flex items-center justify-center transition-all duration-200 ${
                                    isDark ? "hover:bg-[#2a2a2a]" : "hover:bg-[#f5f5f5]"
                                }`}
                                title="Delete chat"
                            >
                                <Trash size={18} weight="regular" color={isDark ? "#a0a0a0" : "#666"} />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className={`h-8 w-8 rounded-[24px] border-none bg-transparent cursor-pointer flex items-center justify-center transition-all duration-200 text-xl font-medium ${
                                    isDark ? "text-[#a0a0a0] hover:bg-[#2a2a2a]" : "text-[#666] hover:bg-[#f5f5f5]"
                                }`}
                                title="Close chat"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <div
                        ref={listRef}
                        className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-4"
                    >
                        {messages.length === 0 && (
                            <div className={`text-center text-[13px] mt-[60px] ${
                                isDark ? "text-[#666]" : "text-[#999]"
                            }`}>
                                Start a conversation...
                            </div>
                        )}
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex flex-col gap-2 ${
                                    m.role === "user" ? "items-end" : "items-start"
                                }`}
                            >
                                <div className={`max-w-[85%] rounded-lg px-4 py-3 text-[13px] leading-[1.5] border ${
                                    m.role === "user"
                                        ? isDark
                                            ? "bg-white text-black border-[rgba(255,255,255,0.2)] shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                                            : "bg-black text-white border-[rgba(0,0,0,0.2)] shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                                        : isDark
                                            ? "bg-[#2a2a2a] text-white border-[#333] shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                                            : "bg-[#f5f5f5] text-black border-[#e5e5e5] shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                                }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start">
                                <div className={`max-w-[85%] rounded-lg px-4 py-3 text-[13px] leading-[1.5] border ${
                                    isDark
                                        ? "bg-[#2a2a2a] text-white border-[#333] shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                                        : "bg-[#f5f5f5] text-black border-[#e5e5e5] shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                                }`}>
                                    <div className="flex gap-1">
                                        <span className="animate-bounce">●</span>
                                        <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                                        <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <form
                        onSubmit={handleSend}
                        className={`p-4 border-t ${
                            isDark 
                                ? "bg-[rgba(26,26,26,0.95)] border-[#2a2a2a]" 
                                : "bg-[rgba(243,244,246,0.95)] border-[#e5e5e5]"
                        }`}
                    >
                        <div className="flex gap-3">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                className={`flex-1 h-9 rounded-[24px] px-3 border outline-none text-[13px] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] ${
                                    isDark 
                                        ? "bg-[#2a2a2a] border-[#333] text-white" 
                                        : "bg-[#f5f5f5] border-[#e5e5e5] text-black"
                                }`}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className={`h-9 w-9 rounded-[24px] border flex items-center justify-center text-base transition-all duration-200 ${
                                    input.trim() && !isLoading
                                        ? isDark
                                            ? "bg-white border-[#333] text-black cursor-pointer"
                                            : "bg-black border-[#e5e5e5] text-white cursor-pointer"
                                        : isDark
                                            ? "bg-[#2a2a2a] border-[#333] text-[#666] cursor-not-allowed"
                                            : "bg-[#f5f5f5] border-[#e5e5e5] text-[#999] cursor-not-allowed"
                                }`}
                                title="Send message"
                            >
                                <PaperPlaneTilt 
                                    size={18} 
                                    weight="regular" 
                                    color={input.trim() && !isLoading ? (isDark ? "#000" : "#fff") : (isDark ? "#666" : "#999")} 
                                />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </React.Fragment>
    );
}
