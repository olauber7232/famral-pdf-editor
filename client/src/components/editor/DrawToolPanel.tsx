import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Pencil, Eraser, Circle, Square, Minus, 
  Trash2, Check, Palette, Undo, Redo 
} from "lucide-react";
import { useFileStore } from "@/lib/store";

interface DrawToolPanelProps {
  onClose: () => void;
}

type DrawMode = 'pen' | 'eraser' | 'line' | 'rectangle' | 'circle';

export function DrawToolPanel({ onClose }: DrawToolPanelProps) {
  const { addLayer, activePage } = useFileStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<DrawMode>('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Initialize canvas with white background and save initial state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to fill parent container or a fixed size
    const parentContainer = canvas.parentElement;
    if (parentContainer) {
      canvas.width = parentContainer.clientWidth;
      canvas.height = parentContainer.clientHeight;
    } else {
      canvas.width = 360; // Default width
      canvas.height = 200; // Default height
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  }, []);

  // Function to save current canvas state to history
  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // Remove any history after the current index before adding new state
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo functionality
  const undo = () => {
    if (historyIndex <= 0) return; // Cannot undo if at the beginning of history
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newIndex = historyIndex - 1;
    ctx.putImageData(history[newIndex], 0, 0); // Restore previous state
    setHistoryIndex(newIndex);
  };

  // Redo functionality
  const redo = () => {
    if (historyIndex >= history.length - 1) return; // Cannot redo if at the end of history
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newIndex = historyIndex + 1;
    ctx.putImageData(history[newIndex], 0, 0); // Restore next state
    setHistoryIndex(newIndex);
  };

  // Start drawing event handler
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    // Calculate mouse position relative to canvas
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x, y }); // Store starting position for shapes

    // Initialize path for pen and eraser
    if (mode === 'pen' || mode === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
      // Set stroke color: eraser uses white, pen uses selected color
      ctx.strokeStyle = mode === 'eraser' ? '#ffffff' : color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round'; // Makes lines round at the ends
      ctx.lineJoin = 'round'; // Makes line segments join smoothly
    }
  };

  // Drawing event handler (mousemove)
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return; // Only draw if mouse button is down
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Continuous drawing for pen and eraser
    if (mode === 'pen' || mode === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke(); // Draw the line segment
    }
  };

  // Stop drawing event handler (mouseup, mouseleave)
  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Draw shapes based on mode
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

    setIsDrawing(false); // End drawing state
    saveToHistory(); // Save the final drawing state
  };

  // Clear canvas functionality
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff'; // Set background to white
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas
    saveToHistory(); // Save the cleared state
  };

  // Add drawing as a layer to the store
  const handleAddDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas to create a transparent PNG
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, 0); // Draw current canvas content onto temp canvas
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;

      // Make white pixels transparent
      for (let i = 0; i < data.length; i += 4) {
        // Check if pixel is close to white
        if (data[i] > 250 && data[i + 1] > 250 && data[i + 2] > 250) {
          data[i + 3] = 0; // Set alpha channel to 0 (transparent)
        }
      }
      tempCtx.putImageData(imageData, 0, 0); // Apply transparency
    }

    // Add the drawing as a new layer to the store
    addLayer({
      id: Date.now(),
      type: 'image',
      content: tempCanvas.toDataURL('image/png'), // Convert to data URL
      x: 50, // Default position
      y: 50, // Default position
      page: activePage, // Add to current active page
      width: 300, // Default width
      height: 200, // Default height
    });

    onClose(); // Close the tool panel after adding
  };

  // Predefined color palette
  const COLORS = ['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

  // Tool definitions for the buttons
  const tools = [
    { mode: 'pen' as DrawMode, icon: Pencil, label: 'Pen' },
    { mode: 'eraser' as DrawMode, icon: Eraser, label: 'Eraser' },
    { mode: 'line' as DrawMode, icon: Minus, label: 'Line' },
    { mode: 'rectangle' as DrawMode, icon: Square, label: 'Rectangle' },
    { mode: 'circle' as DrawMode, icon: Circle, label: 'Circle' },
  ];

  return (
    <div className="bg-white p-4 w-full h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Pencil className="w-4 h-4" />
          Draw
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Tools</Label>
          <div className="flex gap-2">
            {tools.map(tool => (
              <Button
                key={tool.mode}
                variant={mode === tool.mode ? "default" : "outline"}
                size="icon"
                onClick={() => setMode(tool.mode)}
                title={tool.label}
              >
                <tool.icon className="w-4 h-4" />
              </Button>
            ))}
            <div className="flex-1" /> {/* Spacer */}
            <Button variant="outline" size="icon" onClick={undo} disabled={historyIndex <= 0}>
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={redo} disabled={historyIndex >= history.length - 1}>
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <Label className="flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4" />
            Color
          </Label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                  color === c ? 'scale-110 border-gray-400' : 'border-gray-200'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            {/* Input for custom color selection */}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-7 h-7 rounded cursor-pointer"
            />
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Brush Size: {brushSize}px</Label>
          <Slider
            value={[brushSize]}
            onValueChange={([v]) => setBrushSize(v)}
            min={1}
            max={20}
            step={1}
          />
        </div>

        {/* Canvas container for drawing */}
        <div className="border rounded-lg overflow-hidden flex-grow">
          <canvas
            ref={canvasRef}
            width={360} // Initial width, will be resized by useEffect
            height={200} // Initial height, will be resized by useEffect
            className="w-full h-full cursor-crosshair bg-white"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing} // Stop drawing if mouse leaves canvas
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClear} className="flex-1 gap-2">
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
          <Button onClick={handleAddDrawing} className="flex-1 gap-2">
            <Check className="w-4 h-4" />
            Add Drawing
          </Button>
        </div>
      </div>
    </div>
  );
}