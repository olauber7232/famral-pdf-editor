import { useState } from 'react';
import { Highlighter, Strikethrough, Underline, Pen, Eye, Trash2, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface TextAnnotationPopupProps {
  position: { x: number; y: number };
  selectedText: string;
  onAnnotate: (type: 'highlight' | 'strikethrough' | 'underline' | 'squiggle' | 'redaction', color?: string) => void;
  onClose: () => void;
}

export function TextAnnotationPopup({ position, selectedText, onAnnotate, onClose }: TextAnnotationPopupProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#FFFF00');

  const colors = ['#FFFF00', '#00FF00', '#FF0000', '#0000FF', '#FFA500', '#FFC0CB'];

  const annotationTools = [
    { id: 'highlight', icon: Highlighter, label: 'Highlight', color: true },
    { id: 'strikethrough', icon: Strikethrough, label: 'Strikethrough' },
    { id: 'underline', icon: Underline, label: 'Underline' },
    { id: 'squiggle', icon: Pen, label: 'Squiggle' },
    { id: 'redaction', icon: Eye, label: 'Redaction' },
  ];

  return (
    <div 
      className="absolute bg-white rounded-lg shadow-xl border p-3 z-50 flex items-center gap-2"
      style={{ 
        top: `${position.y - 50}px`, 
        left: `${position.x}px`,
        minWidth: 'fit-content'
      }}
    >
      {annotationTools.map((tool) => (
        <div key={tool.id}>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onAnnotate(tool.id as any, tool.color ? selectedColor : undefined)}
            title={tool.label}
          >
            <tool.icon className="w-4 h-4" />
          </Button>
          {tool.color && (
            <div className="relative inline-block ml-1">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-6 h-6 cursor-pointer rounded border"
              />
            </div>
          )}
        </div>
      ))}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 ml-2"
        onClick={onClose}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
