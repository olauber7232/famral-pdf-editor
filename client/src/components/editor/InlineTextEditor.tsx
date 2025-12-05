
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Trash2, Check, X } from "lucide-react";
import { useFileStore } from "@/lib/store";

interface InlineTextEditorProps {
  position: { x: number; y: number };
  onClose: () => void;
  initialText?: string;
  layerId?: number;
}

const FONTS = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Inter'];
const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

export function InlineTextEditor({ position, onClose, initialText = '', layerId }: InlineTextEditorProps) {
  const { addLayer, updateLayer, deleteLayer, activePage } = useFileStore();
  const [text, setText] = useState(initialText);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontColor, setFontColor] = useState('#000000');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [showToolbar, setShowToolbar] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSave = () => {
    if (layerId) {
      updateLayer(layerId, {
        content: text,
        fontSize,
        fontFamily,
        fontColor,
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        textAlign,
      });
    } else {
      addLayer({
        id: Date.now(),
        type: 'text',
        content: text,
        x: position.x,
        y: position.y,
        page: activePage,
        fontSize,
        fontFamily,
        fontColor,
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        textAlign,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (layerId) {
      deleteLayer(layerId);
    }
    onClose();
  };

  return (
    <div 
      className="absolute z-50"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      {/* Inline Toolbar */}
      <div className="bg-white shadow-lg border rounded-lg mb-2 p-2 flex items-center gap-1">
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="text-xs border rounded px-2 py-1 cursor-pointer"
        >
          {FONTS.map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>

        <select
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="text-xs border rounded px-2 py-1 cursor-pointer w-16"
        >
          {FONT_SIZES.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>

        <input
          type="color"
          value={fontColor}
          onChange={(e) => setFontColor(e.target.value)}
          className="w-8 h-8 rounded border cursor-pointer"
        />

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          size="icon"
          variant={isBold ? "default" : "ghost"}
          className="h-8 w-8"
          onClick={() => setIsBold(!isBold)}
        >
          <Bold className="w-4 h-4" />
        </Button>

        <Button
          size="icon"
          variant={isItalic ? "default" : "ghost"}
          className="h-8 w-8"
          onClick={() => setIsItalic(!isItalic)}
        >
          <Italic className="w-4 h-4" />
        </Button>

        <Button
          size="icon"
          variant={isUnderline ? "default" : "ghost"}
          className="h-8 w-8"
          onClick={() => setIsUnderline(!isUnderline)}
        >
          <Underline className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          size="icon"
          variant={textAlign === 'left' ? "default" : "ghost"}
          className="h-8 w-8"
          onClick={() => setTextAlign('left')}
        >
          <AlignLeft className="w-4 h-4" />
        </Button>

        <Button
          size="icon"
          variant={textAlign === 'center' ? "default" : "ghost"}
          className="h-8 w-8"
          onClick={() => setTextAlign('center')}
        >
          <AlignCenter className="w-4 h-4" />
        </Button>

        <Button
          size="icon"
          variant={textAlign === 'right' ? "default" : "ghost"}
          className="h-8 w-8"
          onClick={() => setTextAlign('right')}
        >
          <AlignRight className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-green-600 hover:bg-green-50"
          onClick={handleSave}
        >
          <Check className="w-4 h-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-red-600 hover:bg-red-50"
          onClick={layerId ? handleDelete : onClose}
        >
          {layerId ? <Trash2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </Button>
      </div>

      {/* Text Input */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your text here..."
        className="bg-white border-2 border-primary rounded p-2 resize-none outline-none min-w-[300px]"
        style={{
          fontSize: `${fontSize}px`,
          fontFamily,
          color: fontColor,
          fontWeight: isBold ? 'bold' : 'normal',
          fontStyle: isItalic ? 'italic' : 'normal',
          textDecoration: isUnderline ? 'underline' : 'none',
          textAlign,
        }}
        rows={3}
      />
    </div>
  );
}
