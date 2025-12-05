import { useState } from 'react';
import { Bold, Italic, Underline as UnderlineIcon, Type, Palette, RotateCcw, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FloatingTextToolbarProps {
  position: { x: number; y: number };
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  onTextChange: (text: string) => void;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (font: string) => void;
  onColorChange: (color: string) => void;
  onBoldToggle: () => void;
  onItalicToggle: () => void;
  onUnderlineToggle: () => void;
  onReset: () => void;
  onClose: () => void;
}

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];
const FONTS = ['Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Comic Sans MS'];

export function FloatingTextToolbar({
  position,
  text,
  fontSize,
  fontFamily,
  color,
  isBold,
  isItalic,
  isUnderline,
  onTextChange,
  onFontSizeChange,
  onFontFamilyChange,
  onColorChange,
  onBoldToggle,
  onItalicToggle,
  onUnderlineToggle,
  onReset,
  onClose,
}: FloatingTextToolbarProps) {
  const [showTextInput, setShowTextInput] = useState(false);

  return (
    <div
      className="absolute bg-white rounded-lg shadow-2xl border p-4 z-50"
      style={{
        top: `${position.y - 60}px`,
        left: `${position.x}px`,
        minWidth: '400px',
      }}
    >
      {/* Text Input */}
      {showTextInput && (
        <div className="mb-3 pb-3 border-b">
          <Label className="text-xs mb-1 block">Edit Text</Label>
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            className="w-full h-16 p-2 border rounded text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      {/* Formatting Toolbar */}
      <div className="flex items-center gap-2 mb-3">
        <Button
          variant={isBold ? 'default' : 'outline'}
          size="icon"
          className="h-8 w-8"
          onClick={onBoldToggle}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant={isItalic ? 'default' : 'outline'}
          size="icon"
          className="h-8 w-8"
          onClick={onItalicToggle}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant={isUnderline ? 'default' : 'outline'}
          size="icon"
          className="h-8 w-8"
          onClick={onUnderlineToggle}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </Button>

        <div className="h-6 w-px bg-gray-200 mx-1" />

        {/* Font Family */}
        <Select value={fontFamily} onValueChange={onFontFamilyChange}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONTS.map((font) => (
              <SelectItem key={font} value={font}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Font Size */}
        <Select value={fontSize.toString()} onValueChange={(v) => onFontSizeChange(Number(v))}>
          <SelectTrigger className="h-8 w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Color Picker */}
        <div className="flex items-center gap-1 border-l pl-2">
          <Palette className="w-4 h-4 text-gray-600" />
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer"
          />
        </div>

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setShowTextInput(!showTextInput)}
          title={showTextInput ? 'Hide text input' : 'Show text input'}
        >
          <Type className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onReset}
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
