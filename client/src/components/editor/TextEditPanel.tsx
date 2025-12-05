
import { Type, Palette, Bold, Italic, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFileStore } from "@/lib/store";

const FONTS = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Inter', 'Helvetica'];
const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

interface TextEditPanelProps {
  onClose: () => void;
}

export function TextEditPanel({ onClose }: TextEditPanelProps) {
  const {
    extractedTextItems,
    selectedTextItems,
    applyStyleToSelectedText,
    deleteSelectedTextItems,
  } = useFileStore();

  const getSelectedTextItem = () => {
    if (selectedTextItems.length > 0) {
      return extractedTextItems.find(item => item.id === selectedTextItems[0]);
    }
    return null;
  };

  const updateSelectedTextStyle = (updates: Partial<typeof extractedTextItems[0]>) => {
    if (selectedTextItems.length > 0) {
      applyStyleToSelectedText(updates);
    }
  };

  const selectedItem = getSelectedTextItem();

  if (!selectedItem) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Type className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="font-semibold mb-2">No Text Selected</h3>
        <p className="text-sm">Click on text in the PDF to edit it</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Type className="w-5 h-5" />
          Text Formatting
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </div>

      {selectedTextItems.length > 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          {selectedTextItems.length} text items selected
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Font Family</label>
          <Select
            value={selectedItem.fontFamily || 'Arial'}
            onValueChange={(value) => updateSelectedTextStyle({ fontFamily: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              {FONTS.map(font => (
                <SelectItem key={font} value={font}>{font}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Font Size</label>
          <Select
            value={selectedItem.fontSize.toString()}
            onValueChange={(value) => updateSelectedTextStyle({ fontSize: Number(value) })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZES.map(size => (
                <SelectItem key={size} value={size.toString()}>{size}px</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Text Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedItem.color || '#000000'}
              onChange={(e) => updateSelectedTextStyle({ color: e.target.value })}
              className="w-12 h-12 rounded cursor-pointer border"
            />
            <span className="font-mono text-sm">{selectedItem.color || '#000000'}</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Text Style</label>
          <div className="flex gap-2">
            <Button
              variant={selectedItem.fontWeight === 'bold' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => updateSelectedTextStyle({
                fontWeight: selectedItem.fontWeight === 'bold' ? 'normal' : 'bold'
              })}
            >
              <Bold className="w-4 h-4 mr-2" />
              Bold
            </Button>

            <Button
              variant={selectedItem.fontStyle === 'italic' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => updateSelectedTextStyle({
                fontStyle: selectedItem.fontStyle === 'italic' ? 'normal' : 'italic'
              })}
            >
              <Italic className="w-4 h-4 mr-2" />
              Italic
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              deleteSelectedTextItems();
              onClose();
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete {selectedTextItems.length} item(s)
          </Button>
        </div>
      </div>
    </div>
  );
}
