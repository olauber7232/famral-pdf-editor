import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface TextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
}

export interface PageTextLayer {
  items: TextItem[];
  width: number;
  height: number;
}

function createTextSuppressedContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d')!;
  const originalFillText = ctx.fillText.bind(ctx);
  const originalStrokeText = ctx.strokeText.bind(ctx);

  ctx.fillText = function() {};
  ctx.strokeText = function() {};

  return ctx;
}

export async function loadPdfAsImages(file: File): Promise<string[]> {
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
        const images: string[] = [];

        // Target canvas dimensions (A4 at 72 DPI)
        const TARGET_WIDTH = 595;
        const TARGET_HEIGHT = 842;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const originalViewport = page.getViewport({ scale: 1 });

          // Calculate scale to fit target dimensions
          const scaleX = TARGET_WIDTH / originalViewport.width;
          const scaleY = TARGET_HEIGHT / originalViewport.height;
          const scale = Math.min(scaleX, scaleY);

          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.width = TARGET_WIDTH; // Set to target width
          canvas.height = TARGET_HEIGHT; // Set to target height

          const context = createTextSuppressedContext(canvas);

          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };

          await page.render(renderContext as any).promise;
          images.push(canvas.toDataURL('image/png'));
        }

        resolve(images);
      } catch (error) {
        console.error('Error loading PDF:', error);
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export async function loadPdfTextLayers(file: File): Promise<PageTextLayer[]> {
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
        const textLayers: PageTextLayer[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const scale = 1.5; // Use consistent scale
          const viewport = page.getViewport({ scale });
          const textContent = await page.getTextContent();

          const items: TextItem[] = [];

          for (const item of textContent.items) {
            if (!('str' in item) || !item.str || !item.str.trim()) continue;

            const tx = item.transform;

            const fontHeight = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);
            const x = tx[4];
            const y = tx[5];

            const textWidth = item.width || (item.str.length * fontHeight * 0.5);

            items.push({
              text: item.str,
              x: x,
              y: viewport.height - y - fontHeight,
              width: textWidth,
              height: fontHeight,
              fontSize: fontHeight,
              fontName: item.fontName || 'sans-serif',
            });
          }

          textLayers.push({
            items,
            width: viewport.width,
            height: viewport.height,
          });
        }

        resolve(textLayers);
      } catch (error) {
        console.error('Error extracting text layers:', error);
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export async function loadImageAsPage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function createBlankPage(): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 794;
  canvas.height = 1123;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  return canvas.toDataURL('image/png');
}

export async function mergePdfs(files: File[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export async function splitPdf(file: File, pageRanges: number[][]): Promise<Blob[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const results: Blob[] = [];

  for (const range of pageRanges) {
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(pdf, range.map(p => p - 1));
    pages.forEach(page => newPdf.addPage(page));
    const pdfBytes = await newPdf.save();
    results.push(new Blob([pdfBytes], { type: 'application/pdf' }));
  }

  return results;
}

export async function rotatePdfPages(file: File, rotations: { page: number; degrees: number }[]): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();

  for (const { page, degrees } of rotations) {
    if (page >= 0 && page < pages.length) {
      pages[page].setRotation({ angle: degrees, type: 'degrees' } as any);
    }
  }

  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export async function compressPdf(file: File, quality: 'low' | 'medium' | 'high'): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);

  // pdf-lib doesn't have built-in compression, but we can optimize
  const pdfBytes = await pdf.save({
    useObjectStreams: quality !== 'high',
  });

  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export async function protectPdf(file: File, password: string): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);

  // Note: pdf-lib doesn't support encryption directly
  // For a proper implementation, you'd need a different library
  // This is a placeholder that returns the original PDF
  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export async function convertPdfToImages(file: File, format: 'png' | 'jpg'): Promise<Blob[]> {
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    useWorkerFetch: false,
    isEvalSupported: false,
  });

  const pdf = await loadingTask.promise;
  const images: Blob[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext as any).promise;

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), format === 'png' ? 'image/png' : 'image/jpeg', 0.9);
    });
    images.push(blob);
  }

  return images;
}

export async function convertImagesToPdf(files: File[]): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    let image;

    if (file.type === 'image/png') {
      image = await pdfDoc.embedPng(arrayBuffer);
    } else {
      image = await pdfDoc.embedJpg(arrayBuffer);
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export async function addTextToPdf(
  pdfBytes: ArrayBuffer,
  text: string,
  x: number,
  y: number,
  pageIndex: number,
  options: { fontSize?: number; color?: string; fontFamily?: string } = {}
): Promise<ArrayBuffer> {
  const pdf = await PDFDocument.load(pdfBytes);
  const pages = pdf.getPages();
  const page = pages[pageIndex];

  if (!page) return pdfBytes;

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const { fontSize = 16, color = '#000000' } = options;

  // Convert hex color to RGB
  const r = parseInt(color.slice(1, 3), 16) / 255;
  const g = parseInt(color.slice(3, 5), 16) / 255;
  const b = parseInt(color.slice(5, 7), 16) / 255;

  page.drawText(text, {
    x,
    y: page.getHeight() - y,
    size: fontSize,
    font,
    color: rgb(r, g, b),
  });

  return await pdf.save();
}

export async function addImageToPdf(
  pdfBytes: ArrayBuffer,
  imageBytes: ArrayBuffer,
  x: number,
  y: number,
  width: number,
  height: number,
  pageIndex: number,
  imageType: 'png' | 'jpg'
): Promise<ArrayBuffer> {
  const pdf = await PDFDocument.load(pdfBytes);
  const pages = pdf.getPages();
  const page = pages[pageIndex];

  if (!page) return pdfBytes;

  let image;
  if (imageType === 'png') {
    image = await pdf.embedPng(imageBytes);
  } else {
    image = await pdf.embedJpg(imageBytes);
  }

  page.drawImage(image, {
    x,
    y: page.getHeight() - y - height,
    width,
    height,
  });

  return await pdf.save();
}

export function downloadBlob(blob: Blob, filename: string) {
  saveAs(blob, filename);
}

export async function downloadAsZip(blobs: Blob[], filenames: string[], zipName: string) {
  const zip = new JSZip();

  blobs.forEach((blob, index) => {
    zip.file(filenames[index], blob);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, zipName);
}