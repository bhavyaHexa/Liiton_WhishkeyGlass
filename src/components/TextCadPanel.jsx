import { useEffect, useMemo, useState } from "react";
import * as makerjs from "makerjs";
import opentype from "opentype.js";
import { downloadTextFile } from "../utils/download";
import fontFile from "../assets/berkshire-swash.regular.ttf";

export default function TextCadPanel({ text, setText, setFontBuffer }) {
  const [font, setFont] = useState(null);

  // ✅ LOAD FONT (used by decal + CAD export)
  useEffect(() => {
    fetch(fontFile)
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        setFontBuffer(buffer); // send to parent for decal rendering
        const parsed = opentype.parse(buffer);
        setFont(parsed);
      })
      .catch(console.error);
  }, [setFontBuffer]);

  // ✅ CREATE MAKER MODEL FROM OPENTYPE PATH (gives filled text)
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

  // ⭐ Move model to positive quadrant + padding
  const moveToBottomLeft = (model, padding = 5) => {
    const m = makerjs.measure.modelExtents(model);
    if (!m) return;
    makerjs.model.move(model, [-m.low[0] + padding, -m.low[1] + padding]);
  };

  // ⭐ MAKE TEXT BOLD USING OFFSET (no font download needed)
  const makeBold = (model, amount = 1.2) => {
    try {
      const expanded = makerjs.model.outline(model, amount, 0, true);
      return {
        models: {
          original: model,
          bold: expanded,
        },
      };
    } catch {
      return model;
    }
  };

  const getFileName = (ext) => {
    const safeText = text.replace(/\s+/g, "_");
    return `${safeText}.${ext}`;
  };

  // ⭐ DXF EXPORT (bold + padded)
  const exportDXF = () => {
    if (!model) return;

    const PADDING = 5;

    let cloned = makerjs.cloneObject(model);
    cloned = makeBold(cloned, 1.2);
    moveToBottomLeft(cloned, PADDING);

    const dxf = makerjs.exporter.toDXF(cloned);
    downloadTextFile(dxf, getFileName("dxf"), "application/dxf");
  };

  // ⭐ SVG EXPORT (bold + no clipping + engraving safe)
  const exportSVG = () => {
    if (!model) return;

    const PADDING = 5;

    let cloned = makerjs.cloneObject(model);
    cloned = makeBold(cloned, 1.2);

    const m = makerjs.measure.modelExtents(cloned);
    if (!m) return;

    const width = m.high[0] - m.low[0];
    const height = m.high[1] - m.low[1];

    moveToBottomLeft(cloned, PADDING);

    const viewWidth = width + PADDING * 2;
    const viewHeight = height + PADDING * 2;

    const svg = makerjs.exporter.toSVG(cloned, {
      useSvgPathOnly: true,
      strokeWidth: 0.1,
      svgAttrs: {
        viewBox: `0 0 ${viewWidth} ${viewHeight}`,
        width: `${viewWidth}mm`,
        height: `${viewHeight}mm`,
      },
    });

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
      <div style={{ borderBottom: "1px solid #1e293b", paddingBottom: 10 }}>
        <h2 style={{ margin: 0, fontSize: 18, color: "#e2e8f0" }}>
          Text Engraving
        </h2>
      </div>

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
          }}
        >
          Export DXF
        </button>
      </div>
    </div>
  );
}
