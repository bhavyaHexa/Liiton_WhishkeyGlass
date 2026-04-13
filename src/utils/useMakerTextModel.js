import { useEffect, useState } from 'react';
import * as makerjs from 'makerjs';
import opentype from 'opentype.js';

export function useMakerTextModel(text, fontBuffer, fontSize = 120) {
    const [model, setModel] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function buildModel() {
            try {
                setError(null);

                if (!fontBuffer) {
                    setModel(null);
                    return;
                }

                const font = opentype.parse(fontBuffer);

                const safeText = text.length ? text : ' ';
                const path = font.getPath(safeText, 0, 0, fontSize);

                const svgPathData = path.toPathData(2);
                const makerModel =
                    makerjs.importer.fromSVGPathData(svgPathData);

                if (!cancelled) setModel(makerModel);
            } catch (e) {
                if (!cancelled) {
                    setModel(null);
                    setError('Failed to build text model');
                }
            }
        }

        buildModel();

        return () => {
            cancelled = true;
        };
    }, [text, fontBuffer, fontSize]);

    return { model, error };
}
