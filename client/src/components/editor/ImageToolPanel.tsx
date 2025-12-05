import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Image as ImageIcon, Upload, Check, RotateCw, FlipHorizontal, FlipVertical } from "lucide-react";
import { useFileStore } from "@/lib/store";

interface ImageToolPanelProps {
  onClose: () => void;
}

export function ImageToolPanel({ onClose }: ImageToolPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addLayer, activePage } = useFileStore();
  
  const [image, setImage] = useState<string | null>(null);
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(200);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [opacity, setOpacity] = useState(100);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // Calculate aspect ratio
        const aspectRatio = img.width / img.height;
        if (img.width > img.height) {
          setWidth(300);
          setHeight(Math.round(300 / aspectRatio));
        } else {
          setHeight(300);
          setWidth(Math.round(300 * aspectRatio));
        }
      };
      img.src = event.target?.result as string;
      setImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddImage = () => {
    if (!image) return;

    // Apply transformations
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.globalAlpha = opacity / 100;
      ctx.translate(width / 2, height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      
      const img = new window.Image();
      img.onload = () => {
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        
        addLayer({
          id: Date.now(),
          type: 'image',
          content: canvas.toDataURL('image/png'),
          x: 100,
          y: 100,
          page: activePage,
          width,
          height,
        });
        
        onClose();
      };
      img.src = image;
    }
  };

  return (
    <div className="bg-white p-4 w-full h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Add Image
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />

      <div className="space-y-4">
        {image ? (
          <>
            <div 
              className="border rounded-lg p-2 bg-gray-50 flex items-center justify-center overflow-hidden"
              style={{ minHeight: '150px' }}
            >
              <img 
                src={image} 
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '150px',
                  objectFit: 'contain',
                  transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                  opacity: opacity / 100,
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Width: {width}px</Label>
                <Slider
                  value={[width]}
                  onValueChange={([v]) => setWidth(v)}
                  min={50}
                  max={500}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Height: {height}px</Label>
                <Slider
                  value={[height]}
                  onValueChange={([v]) => setHeight(v)}
                  min={50}
                  max={500}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Rotation: {rotation}°</Label>
              <Slider
                value={[rotation]}
                onValueChange={([v]) => setRotation(v)}
                min={0}
                max={360}
                step={15}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Opacity: {opacity}%</Label>
              <Slider
                value={[opacity]}
                onValueChange={([v]) => setOpacity(v)}
                min={10}
                max={100}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="mb-2 block">Transform</Label>
              <div className="flex gap-2">
                <Button
                  variant={flipH ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFlipH(!flipH)}
                  className="flex-1 gap-1"
                >
                  <FlipHorizontal className="w-4 h-4" />
                  Flip H
                </Button>
                <Button
                  variant={flipV ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFlipV(!flipV)}
                  className="flex-1 gap-1"
                >
                  <FlipVertical className="w-4 h-4" />
                  Flip V
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation((rotation + 90) % 360)}
                  className="flex-1 gap-1"
                >
                  <RotateCw className="w-4 h-4" />
                  Rotate
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                Change Image
              </Button>
              <Button onClick={handleAddImage} className="flex-1 gap-2">
                <Check className="w-4 h-4" />
                Add
              </Button>
            </div>
          </>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-600">Click to upload an image</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, SVG</p>
          </div>
        )}
      </div>
    </div>
  );
}
