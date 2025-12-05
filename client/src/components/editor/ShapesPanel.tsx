
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Circle, Square, Triangle, Star, Hexagon, Palette, Check } from "lucide-react";
import { useFileStore } from "@/lib/store";

interface ShapesPanelProps {
  onClose: () => void;
}

type ShapeType = 'circle' | 'square' | 'triangle' | 'star' | 'hexagon';

export function ShapesPanel({ onClose }: ShapesPanelProps) {
  const { addLayer, activePage } = useFileStore();
  const [selectedShape, setSelectedShape] = useState<ShapeType>('circle');
  const [fillColor, setFillColor] = useState('#3b82f6');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [size, setSize] = useState(100);
  const [opacity, setOpacity] = useState(100);

  const shapes = [
    { type: 'circle' as ShapeType, icon: Circle, label: 'Circle' },
    { type: 'square' as ShapeType, icon: Square, label: 'Square' },
    { type: 'triangle' as ShapeType, icon: Triangle, label: 'Triangle' },
    { type: 'star' as ShapeType, icon: Star, label: 'Star' },
    { type: 'hexagon' as ShapeType, icon: Hexagon, label: 'Hexagon' },
  ];

  const generateShapeSVG = (shape: ShapeType): string => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';

    ctx.globalAlpha = opacity / 100;
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size - strokeWidth * 2) / 2;

    switch (shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;

      case 'square':
        const squareSize = radius * 1.4;
        ctx.fillRect(centerX - squareSize / 2, centerY - squareSize / 2, squareSize, squareSize);
        ctx.strokeRect(centerX - squareSize / 2, centerY - squareSize / 2, squareSize, squareSize);
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - radius);
        ctx.lineTo(centerX + radius * 0.866, centerY + radius / 2);
        ctx.lineTo(centerX - radius * 0.866, centerY + radius / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'star':
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'hexagon':
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
    }

    return canvas.toDataURL('image/png');
  };

  const handleAddShape = () => {
    const shapeImage = generateShapeSVG(selectedShape);
    
    addLayer({
      id: Date.now(),
      type: 'image',
      content: shapeImage,
      x: 100,
      y: 100,
      page: activePage,
      width: size,
      height: size,
    });
  };

  const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#8b5cf6', '#ec4899', '#000000', '#ffffff'];

  return (
    <div className="bg-white p-4 w-full h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Square className="w-4 h-4" />
          Add Shapes
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Select Shape</Label>
          <div className="grid grid-cols-3 gap-2">
            {shapes.map(shape => (
              <Button
                key={shape.type}
                variant={selectedShape === shape.type ? "default" : "outline"}
                className="h-16 flex flex-col gap-1"
                onClick={() => setSelectedShape(shape.type)}
              >
                <shape.icon className="w-6 h-6" />
                <span className="text-xs">{shape.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4" />
            Fill Color
          </Label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(color => (
              <button
                key={color}
                onClick={() => setFillColor(color)}
                className={`w-8 h-8 rounded border-2 transition-transform ${
                  fillColor === color ? 'scale-110 border-gray-400' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
            <input
              type="color"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border"
            />
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Stroke Color</Label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(color => (
              <button
                key={color}
                onClick={() => setStrokeColor(color)}
                className={`w-8 h-8 rounded border-2 transition-transform ${
                  strokeColor === color ? 'scale-110 border-gray-400' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border"
            />
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Stroke Width: {strokeWidth}px</Label>
          <Slider
            value={[strokeWidth]}
            onValueChange={([v]) => setStrokeWidth(v)}
            min={0}
            max={10}
            step={1}
          />
        </div>

        <div>
          <Label className="mb-2 block">Size: {size}px</Label>
          <Slider
            value={[size]}
            onValueChange={([v]) => setSize(v)}
            min={50}
            max={300}
            step={10}
          />
        </div>

        <div>
          <Label className="mb-2 block">Opacity: {opacity}%</Label>
          <Slider
            value={[opacity]}
            onValueChange={([v]) => setOpacity(v)}
            min={10}
            max={100}
            step={10}
          />
        </div>

        <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center min-h-[120px]">
          <img 
            src={generateShapeSVG(selectedShape)} 
            alt="Preview"
            className="max-w-full max-h-[100px]"
          />
        </div>

        <Button onClick={handleAddShape} className="w-full gap-2">
          <Check className="w-4 h-4" />
          Add Shape to Document
        </Button>
      </div>
    </div>
  );
}
