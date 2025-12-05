import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, 
  AlignRight, Type, Plus 
} from "lucide-react";
import { useFileStore } from "@/lib/store";

const FONTS = [
  'Inter', 'Arial', 'Times New Roman', 'Georgia', 'Courier New', 
  'Verdana', 'Trebuchet MS', 'Comic Sans MS', 'Impact', 'Palatino'
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72];

interface TextToolPanelProps {
  onClose: () => void;
}

export function TextToolPanel({ onClose }: TextToolPanelProps) {
  const { addLayer, activePage } = useFileStore();
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontColor, setFontColor] = useState('#000000');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');

  const handleAddText = () => {
    if (!text.trim()) return;
    
    addLayer({
      id: Date.now(),
      type: 'text',
      content: text,
      x: 100,
      y: 100,
      page: activePage,
      fontSize,
      fontFamily,
      fontColor,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      textAlign,
    });
    
    setText('');
  };

  return (
    <div className="absolute top-20 left-4 bg-white rounded-lg shadow-xl border p-4 w-80 z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Type className="w-4 h-4" />
          Add Text
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Text Content</Label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your text..."
            className="w-full h-24 mt-1 p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Font Family</Label>
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map(font => (
                  <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Font Size</Label>
            <Select value={fontSize.toString()} onValueChange={(v) => setFontSize(Number(v))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Text Color</Label>
          <div className="flex items-center gap-2 mt-1">
            <input 
              type="color" 
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              className="w-10 h-10 rounded border cursor-pointer"
            />
            <Input 
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <Label>Style</Label>
          <div className="flex gap-2 mt-1">
            <Button
              variant={isBold ? "default" : "outline"}
              size="icon"
              onClick={() => setIsBold(!isBold)}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant={isItalic ? "default" : "outline"}
              size="icon"
              onClick={() => setIsItalic(!isItalic)}
            >
              <Italic className="w-4 h-4" />
            </Button>
            <div className="flex-1" />
            <Button
              variant={textAlign === 'left' ? "default" : "outline"}
              size="icon"
              onClick={() => setTextAlign('left')}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              variant={textAlign === 'center' ? "default" : "outline"}
              size="icon"
              onClick={() => setTextAlign('center')}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant={textAlign === 'right' ? "default" : "outline"}
              size="icon"
              onClick={() => setTextAlign('right')}
            >
              <AlignRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div 
          className="p-3 border rounded bg-gray-50 min-h-[60px]"
          style={{ 
            fontFamily, 
            fontSize: `${fontSize}px`, 
            color: fontColor,
            fontWeight: isBold ? 'bold' : 'normal',
            fontStyle: isItalic ? 'italic' : 'normal',
            textAlign
          }}
        >
          {text || 'Preview text...'}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleAddText} className="flex-1 gap-2">
            <Plus className="w-4 h-4" />
            Add Text
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
