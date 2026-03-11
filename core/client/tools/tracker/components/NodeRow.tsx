import React, { useState, useEffect } from "react";
import { styles, COLORS } from "../styles";
import { CO, IDE_COLOR } from "../../../shared/colors";
import type { SourceNode } from "../types";

interface Props {
  node: SourceNode;
  depth: number;
  onOpen: (source: string) => void;
  onEdit?: (source: string) => void;
  dimmed?: boolean;
  highlight?: boolean;
}

const actionBtnBase: React.CSSProperties = {
  background: "none",
  borderRadius: 3,
  width: 18,
  height: 18,
  cursor: "pointer",
  fontSize: 12,
  lineHeight: "18px",
  padding: 0,
  marginLeft: 4,
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  verticalAlign: "middle",
};


const editBtnStyle: React.CSSProperties = {
  ...actionBtnBase,
  border: `1px solid ${IDE_COLOR}60`,
  color: IDE_COLOR,
};

export const NodeRow: React.FC<Props> = ({ node, depth, onOpen, onEdit, dimmed, highlight }) => {
  const [hovered, setHovered] = useState(false);
  const [ctrlHeld, setCtrlHeld] = useState(false);
  const clickable = !!node.source;

  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.key === "Control" || e.key === "Meta") setCtrlHeld(true); };
    const up = (e: KeyboardEvent) => { if (e.key === "Control" || e.key === "Meta") setCtrlHeld(false); };
    const blur = () => setCtrlHeld(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  return (
    <div
      style={{
        ...styles.row,
        paddingLeft: 12 + depth * 16,
        opacity: dimmed && !node.source ? 0.4 : 1,
        ...(highlight ? styles.rowHighlight : {}),
        background: highlight
          ? styles.rowHighlight.background
          : hovered && clickable
            ? COLORS.hover
            : "transparent",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={styles.tag}>&lt;{node.tag}&gt;</span>
      {node.source ? (
        <>
          <span
            style={{
              ...styles.sourceLink,
              textDecoration: hovered && ctrlHeld ? "underline" : "none",
              cursor: hovered && ctrlHeld ? "pointer" : "default",
            }}
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                onOpen(node.source!);
              }
            }}
            title={ctrlHeld ? "Open in VSCode" : "Ctrl+Click for VSCode"}
          >
            {node.source}
          </span>
          {hovered && (
            <>
              {onEdit && (
                <button
                  style={editBtnStyle}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(node.source!);
                  }}
                  title="Open in IDE"
                >
                  {/* </> icon */}
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </button>
              )}
            </>
          )}
        </>
      ) : (
        <span style={styles.noSource}>no source</span>
      )}
    </div>
  );
};
