import { useState, useRef } from 'react';
// @ts-ignore
import SignatureCanvas from 'react-signature-canvas';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PenTool, Upload, Trash2, Check, Palette } from "lucide-react";
import { useFileStore } from "@/lib/store";

interface SignToolPanelProps {
  onClose: () => void;
}

export function SignToolPanel({ onClose }: SignToolPanelProps) {
  const { addLayer, activePage } = useFileStore();
  const signCanvasRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [penColor, setPenColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState(2);
  const [extractedSignature, setExtractedSignature] = useState<string | null>(null);

  const handleClear = () => {
    signCanvasRef.current?.clear();
  };

  const handleAddSignature = () => {
    let signatureUrl: string | null = null;

    if (extractedSignature) {
      signatureUrl = extractedSignature;
    } else if (signCanvasRef.current && !signCanvasRef.current.isEmpty()) {
      signatureUrl = signCanvasRef.current.toDataURL('image/png');
    }

    if (signatureUrl) {
      addLayer({
        id: Date.now(),
        type: 'image',
        content: signatureUrl,
        x: 100,
        y: 100,
        page: activePage,
        width: 200,
        height: 80,
      });
      onClose();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to process image
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0);

          // Simple background removal - make white/light pixels transparent
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // If pixel is close to white, make it transparent
            if (r > 200 && g > 200 && b > 200) {
              data[i + 3] = 0; // Alpha = 0
            }
          }

          ctx.putImageData(imageData, 0, 0);
          setExtractedSignature(canvas.toDataURL('image/png'));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const COLORS = ['#000000', '#1e40af', '#dc2626', '#16a34a', '#9333ea', '#ea580c'];

  return (
    <div className="bg-white p-4 w-full h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <PenTool className="w-4 h-4" />
          Add Signature
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
      </div>

      <Tabs defaultValue="draw">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="draw" className="flex-1">Draw</TabsTrigger>
          <TabsTrigger value="upload" className="flex-1">Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="space-y-4">
          <div className="border rounded-lg p-2 bg-gray-50">
            <SignatureCanvas
              ref={signCanvasRef}
              canvasProps={{
                className: 'w-full h-32 bg-white rounded border cursor-crosshair',
                style: { width: '100%', height: '128px' }
              }}
              penColor={penColor}
              minWidth={penWidth}
              maxWidth={penWidth + 1}
            />
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Palette className="w-4 h-4" />
              Pen Color
            </Label>
            <div className="flex gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setPenColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    penColor === color ? 'scale-110 border-primary' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                value={penColor}
                onChange={(e) => setPenColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Pen Width: {penWidth}px</Label>
            <Slider
              value={[penWidth]}
              onValueChange={([v]) => setPenWidth(v)}
              min={1}
              max={10}
              step={1}
            />
          </div>

          <Button variant="outline" onClick={handleClear} className="w-full gap-2">
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />

          {extractedSignature ? (
            <div className="space-y-3">
              <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center">
                <img 
                  src={extractedSignature} 
                  alt="Extracted signature"
                  className="max-h-32 object-contain"
                  style={{ 
                    filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.2))',
                    background: 'repeating-conic-gradient(#f0f0f0 0% 25%, white 0% 50%) 50% / 10px 10px'
                  }}
                />
              </div>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <Check className="w-4 h-4" />
                Signature extracted! Background removed.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setExtractedSignature(null);
                  fileInputRef.current?.click();
                }}
                className="w-full"
              >
                Upload Different Image
              </Button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Click to upload signature image</p>
              <p className="text-xs text-gray-400 mt-1">Background will be automatically removed</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Button onClick={handleAddSignature} className="w-full mt-4 gap-2">
        <Check className="w-4 h-4" />
        Add Signature to Document
      </Button>
    </div>
  );
}