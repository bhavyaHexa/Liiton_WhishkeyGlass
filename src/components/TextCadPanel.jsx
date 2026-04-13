import { useEffect, useMemo, useState } from "react";
import * as makerjs from "makerjs";
import opentype from "opentype.js";
import { downloadTextFile } from "../utils/download";
import fontFile from "../assets/Onest[wght].ttf";

export default function TextCadPanel({ text, setText, setFontBuffer }) {
  const [font, setFont] = useState(null);

  // ✅ Load font once
  useEffect(() => {
    fetch(fontFile)
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        setFontBuffer(buffer); // send to parent (for decal)
        const parsed = opentype.parse(buffer);
        setFont(parsed); // local usage
      })
      .catch(console.error);
  }, [setFontBuffer]);

  // ✅ Build Maker.js model (NO hook issues anymore)
  const model = useMemo(() => {
    if (!font || !text) return null;

    try {
      const path = font.getPath(text, 0, 0, 50);
      const svgPath = path.toPathData(2);

      return makerjs.importer.fromSVGPathData(svgPath);
    } catch (err) {
      console.error("Model error:", err);
      return null;
    }
  }, [text, font]);

  // ✅ Move to bottom-left for CAD export
  const moveToBottomLeft = (model) => {
    const m = makerjs.measure.modelExtents(model);
    if (!m) return;
    makerjs.model.move(model, [-m.low[0], -m.low[1]]);
  };

  const getFileName = (ext) => {
    const safeText = text.replace(/\s+/g, "_");
    return `${safeText}.${ext}`;
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

  const isReady = Boolean(model);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        height: "100vh",
        width: 300,
        background: "#0f172a",
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

      {/* INPUT */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={{ fontSize: 13, color: "#94a3b8" }}>
          Engraving Text (max 15 chars)
        </label>

        <input
          value={text}
          maxLength={15}
          onChange={(e) => setText(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#020617",
            color: "#e2e8f0",
          }}
        />
      </div>

      {/* EXPORT */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={exportSVG}
          disabled={!isReady}
          style={{
            padding: 10,
            borderRadius: 6,
            border: "none",
            background: isReady ? "#2563eb" : "#334155",
            color: "white",
            cursor: isReady ? "pointer" : "not-allowed",
          }}
        >
          Export SVG
        </button>

        <button
          onClick={exportDXF}
          disabled={!isReady}
          style={{
            padding: 10,
            borderRadius: 6,
            border: "none",
            background: isReady ? "#16a34a" : "#334155",
            color: "white",
            cursor: isReady ? "pointer" : "not-allowed",
          }}
        >
          Export DXF
        </button>
      </div>
    </div>
  );
}
