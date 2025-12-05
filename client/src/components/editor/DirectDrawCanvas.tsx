
import { useRef, useState, useEffect } from 'react';
import { useFileStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Pencil, Eraser, Circle, Square, Minus, Trash2, Check, Palette, Undo, Redo } from "lucide-react";

type DrawMode = 'pen' | 'eraser' | 'line' | 'rectangle' | 'circle';

export function DirectDrawCanvas({ pageIndex }: { pageIndex: number }) {
  const { addLayer, activePage } = useFileStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<DrawMode>('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 595;
    canvas.height = 842;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  }, [pageIndex]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newIndex = historyIndex - 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newIndex = historyIndex + 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x, y });

    if (mode === 'pen' || mode === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = mode === 'eraser' ? 'rgba(255, 255, 255, 1)' : color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = mode === 'eraser' ? 'destination-out' : 'source-over';
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'pen' || mode === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = 'source-over';

    if (mode === 'line') {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.stroke();
    } else if (mode === 'rectangle') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
    } else if (mode === 'circle') {
      const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.stroke();
    }

    setIsDrawing(false);
    saveToHistory();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    addLayer({
      id: Date.now(),
      type: 'image',
      content: canvas.toDataURL('image/png'),
      x: 0,
      y: 0,
      page: activePage,
      width: 595,
      height: 842,
    });

    handleClear();
  };

  const COLORS = ['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

  const tools = [
    { mode: 'pen' as DrawMode, icon: Pencil, label: 'Pen' },
    { mode: 'eraser' as DrawMode, icon: Eraser, label: 'Eraser' },
    { mode: 'line' as DrawMode, icon: Minus, label: 'Line' },
    { mode: 'rectangle' as DrawMode, icon: Square, label: 'Rectangle' },
    { mode: 'circle' as DrawMode, icon: Circle, label: 'Circle' },
  ];

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 z-40 cursor-crosshair"
        style={{ width: '595px', height: '842px' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-xl border p-3 z-50 flex flex-col gap-2">
        <div className="flex gap-1">
          {tools.map(tool => (
            <Button
              key={tool.mode}
              variant={mode === tool.mode ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setMode(tool.mode)}
              title={tool.label}
            >
              <tool.icon className="w-4 h-4" />
            </Button>
          ))}
        </div>

        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={undo} disabled={historyIndex <= 0}>
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={redo} disabled={historyIndex >= history.length - 1}>
            <Redo className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleClear}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-1 flex-wrap max-w-[180px]">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded border-2 transition-transform ${
                color === c ? 'scale-110 border-gray-400' : 'border-gray-200'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer"
          />
        </div>

        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-full"
        />
        <span className="text-xs text-center">Size: {brushSize}px</span>

        <Button onClick={handleSave} size="sm" className="gap-2">
          <Check className="w-4 h-4" />
          Apply
        </Button>
      </div>
    </>
  );
}
