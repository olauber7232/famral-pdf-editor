import { Button } from "@/components/ui/button";
import { FileType } from "lucide-react";

interface ConvertPanelProps {
  onClose: () => void;
}

export function ConvertPanel({ onClose }: ConvertPanelProps) {
  return (
    <div className="bg-white p-4 w-full h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <FileType className="w-4 h-4" />
          Convert PDF
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
      </div>

      <div className="space-y-2">
        <Button variant="outline" className="w-full justify-start">PDF to Word</Button>
        <Button variant="outline" className="w-full justify-start">PDF to Excel</Button>
        <Button variant="outline" className="w-full justify-start">PDF to JPG</Button>
        <Button variant="outline" className="w-full justify-start">PDF to PNG</Button>
      </div>
    </div>
  );
}