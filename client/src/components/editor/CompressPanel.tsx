import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Minimize2 } from "lucide-react";
import { useState } from "react";

interface CompressPanelProps {
  onClose: () => void;
}

export function CompressPanel({ onClose }: CompressPanelProps) {
  const [quality, setQuality] = useState(75);

  return (
    <div className="bg-white p-4 w-full h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Minimize2 className="w-4 h-4" />
          Compress PDF
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Compression Quality: {quality}%</Label>
          <Slider
            value={[quality]}
            onValueChange={([v]) => setQuality(v)}
            min={10}
            max={100}
            className="mt-2"
          />
        </div>
        <Button className="w-full">Compress PDF</Button>
      </div>
    </div>
  );
}