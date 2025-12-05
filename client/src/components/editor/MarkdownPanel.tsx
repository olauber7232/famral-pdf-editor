import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileCode, Check } from "lucide-react";
import { useFileStore } from "@/lib/store";

interface MarkdownPanelProps {
  onClose: () => void;
}

export function MarkdownPanel({ onClose }: MarkdownPanelProps) {
  const { addLayer, activePage } = useFileStore();
  const [markdown, setMarkdown] = useState('# Heading\n\nYour **markdown** text here...');

  const handleAddMarkdown = () => {
    if (!markdown.trim()) return;

    // Parse markdown and add as formatted text
    const lines = markdown.split('\n');
    let yOffset = 100;

    lines.forEach((line) => {
      if (!line.trim()) {
        yOffset += 20;
        return;
      }

      let fontSize = 14;
      let fontWeight = 'normal';
      let content = line;

      // Parse headings
      if (line.startsWith('# ')) {
        fontSize = 24;
        fontWeight = 'bold';
        content = line.substring(2);
      } else if (line.startsWith('## ')) {
        fontSize = 20;
        fontWeight = 'bold';
        content = line.substring(3);
      } else if (line.startsWith('### ')) {
        fontSize = 18;
        fontWeight = 'bold';
        content = line.substring(4);
      }

      // Check for bold/italic (simple patterns)
      if (content.includes('**')) {
        fontWeight = 'bold';
        content = content.replace(/\*\*/g, '');
      }

      addLayer({
        id: Date.now() + yOffset,
        type: 'text',
        content: content,
        x: 100,
        y: yOffset,
        page: activePage,
        fontSize,
        fontFamily: 'Inter',
        fontColor: '#000000',
        fontWeight,
      });

      yOffset += fontSize + 10;
    });

    onClose();
  };

  return (
    <div className="bg-white p-4 w-full h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <FileCode className="w-4 h-4" />
          Add Markdown
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Markdown Content</Label>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="w-full h-48 mt-1 p-2 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter markdown..."
          />
        </div>

        <div className="p-3 border rounded bg-gray-50 min-h-[80px] text-sm">
          <div className="font-semibold mb-2">Preview:</div>
          <pre className="whitespace-pre-wrap font-mono text-xs">{markdown}</pre>
        </div>

        <Button onClick={handleAddMarkdown} className="w-full gap-2">
          <Check className="w-4 h-4" />
          Add to PDF
        </Button>
      </div>
    </div>
  );
}