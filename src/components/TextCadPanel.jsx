import { useEffect, useMemo, useState } from "react";
import * as makerjs from "makerjs";
import opentype from "opentype.js";
import JSZip from "jszip";
import { downloadTextFile } from "../utils/download";
import fontFile from "../assets/berkshire-swash.regular.ttf";

export default function TextCadPanel({ text, setText, setFontBuffer, decalOffset }) {
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
      const path = font.getPath(text, 0, 0, 88.5); // Calibrated to ~39.1
      const svgPath = path.toPathData(2);
      return makerjs.importer.fromSVGPathData(svgPath);
    } catch (err) {
      console.error("Model error:", err);
      return null;
    }
  }, [text, font]);

  // ⭐ Align model start point (left) and center (Y) to a specific offset
  const alignToOffset = (model, offset) => {
    const m = makerjs.measure.modelExtents(model);
    if (!m) return;
    const height = m.high[1] - m.low[1];

    // Position Left Edge at offset.x
    // Position Vertical Center at offset.y
    makerjs.model.move(model, [-m.low[0] + offset.x, -m.low[1] - (height / 2) + offset.y]);
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

  // --- HELPERS TO GET CONTENT WITHOUT DOWNLOADING ---

  const getDXFContent = () => {
    if (!model) return null;
    let cloned = makerjs.cloneObject(model);
    cloned = makeBold(cloned, 1.2);
    makerjs.model.scale(cloned, 0.1);
    alignToOffset(cloned, decalOffset);
    return makerjs.exporter.toDXF(cloned);
  };

  const getSVGContent = () => {
    if (!model) return null;
    let cloned = makerjs.cloneObject(model);
    cloned = makeBold(cloned, 1.2);
    makerjs.model.scale(cloned, 0.1);
    alignToOffset(cloned, decalOffset);

    const m = makerjs.measure.modelExtents(cloned);
    if (!m) return null;

    const viewWidth = m.high[0] + 10;
    const viewHeight = m.high[1] + 10;

    return makerjs.exporter.toSVG(cloned, {
      useSvgPathOnly: true,
      fill: "#6e6e6e",
      stroke: "none",
      svgAttrs: {
        viewBox: `0 0 ${viewWidth} ${viewHeight}`,
        width: `${viewWidth}mm`,
        height: `${viewHeight}mm`,
      },
    });
  };

  const getPNGData = () => {
    return new Promise((resolve) => {
      if (!model) return resolve(null);

      let cloned = makerjs.cloneObject(model);
      cloned = makeBold(cloned, 1.2);
      makerjs.model.scale(cloned, 0.1);
      alignToOffset(cloned, decalOffset);

      const m = makerjs.measure.modelExtents(cloned);
      if (!m) return resolve(null);

      const viewWidth = m.high[0] + 10;
      const viewHeight = m.high[1] + 10;

      const svg = makerjs.exporter.toSVG(cloned, {
        useSvgPathOnly: true,
        fill: "#6e6e6e",
        stroke: "none",
        svgAttrs: {
          viewBox: `0 0 ${viewWidth} ${viewHeight}`,
          width: `${viewWidth}mm`,
          height: `${viewHeight}mm`,
        },
      });

      const scale = 10;
      const canvas = document.createElement("canvas");
      canvas.width = viewWidth * scale;
      canvas.height = viewHeight * scale;
      const ctx = canvas.getContext("2d");

      const img = new Image();
      const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          resolve(blob);
        }, "image/png");
      };
      img.src = url;
    });
  };

  // --- ACTIONS ---

  const exportAllFiles = async () => {
    if (!isReady) return;

    const zip = new JSZip();
    const dxf = getDXFContent();
    const svg = getSVGContent();
    const pngBlob = await getPNGData();

    if (dxf) zip.file(getFileName("dxf"), dxf);
    if (svg) zip.file(getFileName("svg"), svg);
    if (pngBlob) zip.file(getFileName("png"), pngBlob);

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = getFileName("zip");
    a.click();
    URL.revokeObjectURL(url);
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
          onClick={exportAllFiles}
          disabled={!isReady}
          style={{
            padding: "12px 10px",
            borderRadius: 6,
            border: "none",
            background: isReady ? "#f59e0b" : "#334155",
            color: "white",
            fontWeight: "bold",
            fontSize: 14,
            cursor: isReady ? "pointer" : "not-allowed",
            marginBottom: 10,
            textTransform: "uppercase"
          }}
        >
          Download All Files (ZIP)
        </button>
      </div>
    </div>
  );
}
