import { useEffect, useMemo, useState } from "react";
import * as makerjs from "makerjs";
import { useMakerTextModel } from "../hooks/useMakerTextModel";
import { downloadTextFile } from "../utils/download";
import fontFile from "../assets/Onest[wght].ttf";

export default function TextCadPanel() {
  const [text, setText] = useState("Liiton Glass");
  const [fontBuffer, setFontBuffer] = useState(null);
  const [fontName] = useState("Regular.ttf");

  const { model } = useMakerTextModel(text, fontBuffer, 50);

  useEffect(() => {
    fetch(fontFile)
      .then((res) => res.arrayBuffer())
      .then((buffer) => setFontBuffer(buffer));
  }, []);

  const moveToBottomLeft = (model) => {
    const m = makerjs.measure.modelExtents(model);
    if (!m) return;
    makerjs.model.move(model, [-m.low[0], -m.low[1]]);
  };

  const getFileName = (ext) => {
    const safeText = text.replace(/\s+/g, "_");
    const safeFont = fontName.replace(/\.[^/.]+$/, "");
    return `${safeText}-${safeFont}.${ext}`;
  };

  const exportDXF = () => {
    if (!model) return;
    const cloned = makerjs.cloneObject(model);
    moveToBottomLeft(cloned);
    const dxf = makerjs.exporter.toDXF(cloned);
    downloadTextFile(dxf, getFileName("dxf"), "application/dxf");
  };

  const exportSVG = () => {
    if (!model) return;
    const cloned = makerjs.cloneObject(model);
    moveToBottomLeft(cloned);
    const svg = makerjs.exporter.toSVG(cloned);
    downloadTextFile(svg, getFileName("svg"), "image/svg+xml");
  };

  const hasModel = useMemo(() => Boolean(model), [model]);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        height: "100vh",
        width: 300,
        background: "#0f172a", // deep dark
        borderLeft: "1px solid #1e293b",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        zIndex: 10,
      }}
    >
      {/* HEADER */}
      <div style={{ borderBottom: "1px solid #1e293b", paddingBottom: 10 }}>
        <h2 style={{ margin: 0, fontSize: 18, color: "#e2e8f0" }}>
          Text Engraving
        </h2>
      </div>

      {/* INPUT SECTION */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={{ fontSize: 13, color: "#94a3b8" }}>Engraving Text</label>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text..."
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#020617",
            color: "#e2e8f0",
            outline: "none",
          }}
        />
      </div>

      {/* FONT INFO */}
      <div
        style={{
          fontSize: 12,
          color: "#64748b",
          background: "#020617",
          padding: 10,
          borderRadius: 8,
          border: "1px solid #1e293b",
        }}
      >
        Font: {fontName}
      </div>

      {/* EXPORT SECTION */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label style={{ fontSize: 13, color: "#94a3b8" }}>Export</label>

        <button
          disabled={!hasModel}
          onClick={exportSVG}
          style={{
            padding: "10px",
            borderRadius: 8,
            border: "none",
            background: hasModel ? "#2563eb" : "#334155",
            color: "white",
            cursor: hasModel ? "pointer" : "not-allowed",
          }}
        >
          Export SVG
        </button>

        <button
          disabled={!hasModel}
          onClick={exportDXF}
          style={{
            padding: "10px",
            borderRadius: 8,
            border: "none",
            background: hasModel ? "#16a34a" : "#334155",
            color: "white",
            cursor: hasModel ? "pointer" : "not-allowed",
          }}
        >
          Export DXF
        </button>
      </div>
    </div>
  );
}
