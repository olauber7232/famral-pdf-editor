import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface ExtractedTextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  pageIndex: number;
  color: string;
  fontWeight?: string;
  fontStyle?: string;
  backgroundColor: string;
  originalColor: string; // Store original color
}

function sampleBackgroundColor(canvas: HTMLCanvasElement, x: number, y: number, width: number, height: number): string {
  const ctx = canvas.getContext('2d');
  if (!ctx) return '#ffffff';

  const sampleX = Math.max(0, Math.min(Math.floor(x), canvas.width - 1));
  const sampleY = Math.max(0, Math.min(Math.floor(y), canvas.height - 1));
  const sampleWidth = Math.max(1, Math.min(Math.floor(width), canvas.width - sampleX));
  const sampleHeight = Math.max(1, Math.min(Math.floor(height), canvas.height - sampleY));

  try {
    const imageData = ctx.getImageData(sampleX, sampleY, sampleWidth, sampleHeight);
    const data = imageData.data;

    let r = 0, g = 0, b = 0, count = 0;

    for (let i = 0; i < Math.min(data.length, 400); i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }

    if (count > 0) {
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      return `rgb(${r}, ${g}, ${b})`;
    }
  } catch (e) {
    console.warn('Could not sample background color:', e);
  }

  return '#ffffff';
}

export async function extractTextFromPdf(file: File): Promise<ExtractedTextItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;

        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          useWorkerFetch: false,
          isEvalSupported: false,
        });

        const pdf = await loadingTask.promise;
        const allTextItems: ExtractedTextItem[] = [];

        // Target canvas dimensions (A4 at 72 DPI)
        const TARGET_WIDTH = 595;
        const TARGET_HEIGHT = 842;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const originalViewport = page.getViewport({ scale: 1 });

          // Calculate scale to fit target dimensions
          const scaleX = TARGET_WIDTH / originalViewport.width;
          const scaleY = TARGET_HEIGHT / originalViewport.height;
          const scale = Math.min(scaleX, scaleY);

          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext('2d');

          if (context) {
            await page.render({
              canvasContext: context,
              viewport: viewport,
            } as any).promise;
          }

          const textContent = await page.getTextContent();

          textContent.items.forEach((item: any, index: number) => {
            if (!item.str || !item.str.trim()) return;

            // Filter out null characters and non-printable characters
            const cleanText = item.str.replace(/\0/g, '').replace(/\uFFFD/g, '').trim();
            if (!cleanText) return;

            const t = item.transform;
            const fontHeight = Math.sqrt(t[2] * t[2] + t[3] * t[3]) * scale;

            // Position text with proper scaling
            let x = t[4] * scale;
            let y = viewport.height - (t[5] * scale) - fontHeight;

            const width = (item.width * scale) || item.str.length * fontHeight * 0.6;

            // Enhanced color extraction - preserve original PDF colors
            let color = '#000000';
            let fontWeight = 'normal';
            let fontStyle = 'normal';

            // Extract color from PDF.js item
            if (item.color && Array.isArray(item.color)) {
              if (item.color.length >= 3) {
                // RGB color
                const r = Math.round(item.color[0] * 255);
                const g = Math.round(item.color[1] * 255);
                const b = Math.round(item.color[2] * 255);
                const hexR = r.toString(16).padStart(2, '0');
                const hexG = g.toString(16).padStart(2, '0');
                const hexB = b.toString(16).padStart(2, '0');
                color = `#${hexR}${hexG}${hexB}`;
              } else if (item.color.length === 1) {
                // Grayscale
                const gray = Math.round(item.color[0] * 255);
                const hex = gray.toString(16).padStart(2, '0');
                color = `#${hex}${hex}${hex}`;
              }
            }

            // Don't override black text, keep original colors
            // Only default to black if no color was found
            if (!item.color) {
              color = '#000000';
            }

            // Attempt to infer fontWeight and fontStyle from fontName
            if (item.fontName) {
                const fontNameLower = item.fontName.toLowerCase();
                if (fontNameLower.includes('bold')) {
                    fontWeight = 'bold';
                }
                if (fontNameLower.includes('italic') || fontNameLower.includes('oblique')) {
                    fontStyle = 'italic';
                }
            }

            // Sample background color at canvas coordinates
            const backgroundColor = sampleBackgroundColor(canvas, x, y, width, fontHeight);

            // Extract color from transform if available
            let textColor = '#000000';
            if (item.transform && item.transform.length >= 6) {
              // Try to extract color from rendering context
              textColor = '#000000'; // Default, will be enhanced in future
            }

            allTextItems.push({
              id: `text-${pageNum}-${index}-${Date.now()}`,
              text: cleanText,
              x,
              y,
              width,
              height: fontHeight,
              fontSize: fontHeight,
              fontFamily: item.fontName || 'sans-serif',
              color, // This is the extracted original color
              fontWeight,
              fontStyle,
              pageIndex: pageNum - 1,
              backgroundColor,
              originalColor: color, // Store same as color to preserve it
            });
          });
        }

        resolve(allTextItems);
      } catch (error) {
        console.error('Error extracting text from PDF:', error);
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}