import React, { useMemo, useEffect } from "react";
import { styles, COLORS } from "../styles";
import { NodeRow } from "./NodeRow";
import { VirtualTreeView } from "./VirtualTreeView";
import { flattenTree } from "../utils";
import type { CapturedTree } from "../types";

interface Props {
  capture: CapturedTree;
  onOpen: (source: string) => void;
  onEdit: (source: string) => void;
  onClose: () => void;
}

export const InspectModal: React.FC<Props> = ({ capture, onOpen, onEdit, onClose }) => {
  const childCount = useMemo(
    () => flattenTree(capture.clicked.children).length,
    [capture.clicked.children]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.headerTitle}>Source Tracker</span>
          <button style={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Body — flex column so VirtualTreeView gets remaining space */}
        <div style={{ ...styles.body, display: "flex", flexDirection: "column" }}>
          {/* Parent chain */}
          {capture.parents.length > 0 && (
            <div style={styles.section}>
              <div style={styles.label}>Parent chain</div>
              {capture.parents.map((p, i) => (
                <NodeRow key={i} node={p} depth={0} dimmed onOpen={onOpen} onEdit={onEdit} />
              ))}
            </div>
          )}

          {/* Clicked element */}
          <div style={styles.section}>
            <div style={styles.label}>Clicked element</div>
            <NodeRow
              node={{
                tag: capture.clicked.tag,
                source: capture.clicked.source,
                children: [],
              }}
              depth={0}
              highlight
              onOpen={onOpen}
              onEdit={onEdit}
            />
          </div>

          {/* Children tree — virtualized */}
          {capture.clicked.children.length > 0 && (
            <div style={{ ...styles.section, flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={styles.label}>
                Children{" "}
                <span style={{ color: COLORS.muted, fontWeight: 400 }}>
                  ({childCount})
                </span>
              </div>
              <VirtualTreeView
                nodes={capture.clicked.children}
                onOpen={onOpen}
                onEdit={onEdit}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
