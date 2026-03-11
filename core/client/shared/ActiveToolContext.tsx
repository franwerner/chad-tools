import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type ToolId = "monitor" | "editor" | null;

// Shift+Fn → tool mapping (centralised keyboard shortcuts)
const HOTKEYS: Record<string, ToolId> = {
  F1: "monitor",
  F2: null,       // F2 reserved for inspect (handled separately)
  F3: "editor",
};

interface ActiveToolState {
  activeTool: ToolId;
  open: (tool: ToolId) => void;
  close: (tool: ToolId) => void;
  toggle: (tool: ToolId) => void;
  isOpen: (tool: ToolId) => boolean;
}

const ActiveToolContext = createContext<ActiveToolState>({
  activeTool: null,
  open: () => { },
  close: () => { },
  toggle: () => { },
  isOpen: () => false,
});

export const useActiveTool = () => useContext(ActiveToolContext);

export const ActiveToolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTool, setActiveTool] = useState<ToolId>(null);

  const open = useCallback((tool: ToolId) => {
    setActiveTool(tool);
  }, []);

  const close = useCallback((tool: ToolId) => {
    setActiveTool((prev) => (prev === tool ? null : prev));
  }, []);

  const toggle = useCallback((tool: ToolId) => {
    setActiveTool((prev) => (prev === tool ? null : tool));
  }, []);

  const isOpen = useCallback((tool: ToolId) => activeTool === tool, [activeTool]);

  // Centralised keyboard shortcuts: Escape + Shift+F1/F3/F4
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeTool !== null) setActiveTool(null);
        return;
      }
      if (!e.shiftKey) return;
      const tool = HOTKEYS[e.key];
      if (tool) {
        e.preventDefault();
        setActiveTool((prev) => (prev === tool ? null : tool));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeTool]);

  return (
    <ActiveToolContext.Provider value={{ activeTool, open, close, toggle, isOpen }}>
      {children}
    </ActiveToolContext.Provider>
  );
};
