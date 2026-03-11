import React, { useRef, useState, useCallback, useEffect } from "react";
import { CO, IDE_COLOR } from "../../shared/colors";
import { useInspectMode } from "./hooks/useInspectMode";
import { TrackerFab } from "./components/TrackerFab";
import { InspectModal } from "./components/InspectModal";
import { HoverOverlay } from "./components/HoverOverlay";
import { MiniEditor } from "../editor/components/MiniEditor";
import { EditorFab } from "../editor/components/EditorFab";
import { openSource } from "../../shared/openSource";
import { useActiveTool } from "../../shared/ActiveToolContext";

export const SourceTracker: React.FC = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLDivElement>(null);
  const { active, setActive, capture, setCapture, close } = useInspectMode(modalRef, fabRef);
  const tool = useActiveTool();

  const [picking, setPicking] = useState(false);
  const [editorSource, setEditorSource] = useState<string | null>(null);
  const [editorPicking, setEditorPicking] = useState(false);

  // Sync Editor with active tool
  useEffect(() => {
    if (editorSource) tool.open("editor");
    else tool.close("editor");
  }, [editorSource]);

  // React to active tool changes
  useEffect(() => {
    // Editor shortcut: no file open → activate selector; file open → already showing
    if (tool.activeTool === "editor" && !editorSource) {
      setEditorPicking(true);
    }
    // Close editor when another tool takes over
    if (editorSource && tool.activeTool !== "editor") setEditorSource(null);
    // Always deactivate selectors and inspect on tool change
    setPicking(false);
    if (tool.activeTool !== "editor") setEditorPicking(false);
    setActive(false);
  }, [tool.activeTool, setActive]);


  const handleInspectToggle = useCallback(() => {
    setActive((a) => {
      if (!a) { setPicking(false); setEditorPicking(false); }
      return !a;
    });
  }, [setActive]);

  useEffect(() => {
    if (!picking) return;

    const style = document.createElement("style");
    style.textContent = "* { cursor: crosshair !important; }";
    document.head.appendChild(style);

    const isOwnUI = (t: Node) =>
      (t as Element).closest?.("#devtools-portal-root") != null;

    const stop = (e: MouseEvent) => {
      if (isOwnUI(e.target as Node)) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isOwnUI(target)) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      setPicking(false);
    };

    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPicking(false);
    };

    window.addEventListener("mousedown", stop, true);
    window.addEventListener("mouseup", stop, true);
    window.addEventListener("click", onClick, true);
    window.addEventListener("pointerdown", stop, true);
    window.addEventListener("keydown", onEscape, true);
    return () => {
      window.removeEventListener("mousedown", stop, true);
      window.removeEventListener("mouseup", stop, true);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("pointerdown", stop, true);
      window.removeEventListener("keydown", onEscape, true);
      style.remove();
    };
  }, [picking]);

  // Open source in mini editor
  const handleEdit = useCallback((source: string) => {
    setEditorSource(source);
  }, []);

  // Editor pick mode: click EditorFab → activate selector → click element → open in editor
  const toggleEditorPick = useCallback(() => {
    setEditorPicking((v) => {
      if (!v) { setActive(false); setPicking(false); }
      return !v;
    });
  }, [setActive]);

  // Editor pick: intercept clicks, find data-source, open in editor
  useEffect(() => {
    if (!editorPicking) return;

    const style = document.createElement("style");
    style.setAttribute("data-editor-pick", "");
    style.textContent = "* { cursor: crosshair !important; }";
    document.head.appendChild(style);

    const isOwnUI = (t: Node) =>
      (t as Element).closest?.("#devtools-portal-root") != null;

    const stop = (e: MouseEvent) => {
      if (isOwnUI(e.target as Node)) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isOwnUI(target)) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const found = target.closest("[data-source]");
      if (found) {
        const source = found.getAttribute("data-source")!;
        setEditorSource(source);
      }
      setEditorPicking(false);
    };

    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditorPicking(false);
    };

    window.addEventListener("mousedown", stop, true);
    window.addEventListener("mouseup", stop, true);
    window.addEventListener("click", onClick, true);
    window.addEventListener("pointerdown", stop, true);
    window.addEventListener("keydown", onEscape, true);
    return () => {
      window.removeEventListener("mousedown", stop, true);
      window.removeEventListener("mouseup", stop, true);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("pointerdown", stop, true);
      window.removeEventListener("keydown", onEscape, true);
      style.remove();
    };
  }, [editorPicking]);

  // Deactivate editor pick when other modes activate
  useEffect(() => {
    if (active || picking) setEditorPicking(false);
  }, [active, picking]);

  const closeEditor = useCallback(() => {
    setEditorSource(null);
  }, []);


  const closeInspectModal = useCallback(() => {
    close()
  }, [setCapture, close]);

  return (
    <>
      {capture ? (
        <div ref={modalRef}>
          <InspectModal
            capture={capture}
            onOpen={openSource}
            onEdit={handleEdit}
            onClose={closeInspectModal}
          />
        </div>
      ) : (
        <div ref={fabRef}>
          <TrackerFab active={active} onToggle={handleInspectToggle} />
          <EditorFab active={editorPicking || !!editorSource} onClick={toggleEditorPick} />
        </div>
      )}
      {!capture && active && <HoverOverlay modalRef={modalRef} fabRef={fabRef} />}
      {editorPicking && <HoverOverlay modalRef={modalRef} fabRef={fabRef} color={IDE_COLOR} />}
      {picking && <HoverOverlay modalRef={modalRef} fabRef={fabRef} color={CO} />}
      {editorSource && (
        <MiniEditor source={editorSource} onClose={closeEditor} />
      )}
    </>
  );
};
