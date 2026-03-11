import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { NodeRow } from "./NodeRow";
import { flattenTree } from "../utils";
import type { SourceNode } from "../types";

const ROW_HEIGHT = 28;
const OVERSCAN = 10;

interface Props {
  nodes: SourceNode[];
  onOpen: (source: string) => void;
  onEdit?: (source: string) => void;
}

export const VirtualTreeView: React.FC<Props> = ({ nodes, onOpen, onEdit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewHeight, setViewHeight] = useState(0);

  const flat = useMemo(() => flattenTree(nodes), [nodes]);
  const totalHeight = flat.length * ROW_HEIGHT;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setViewHeight(el.clientHeight);

    const ro = new ResizeObserver(([entry]) => {
      setViewHeight(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIdx = Math.min(
    flat.length,
    Math.ceil((scrollTop + viewHeight) / ROW_HEIGHT) + OVERSCAN
  );

  const visibleItems = flat.slice(startIdx, endIdx);

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      style={{ overflowY: "auto", flex: 1 }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: startIdx * ROW_HEIGHT,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, i) => (
            <div key={startIdx + i} style={{ height: ROW_HEIGHT }}>
              <NodeRow
                node={{ tag: item.tag, source: item.source, children: [] }}
                depth={item.depth}
                onOpen={onOpen}
                onEdit={onEdit}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
