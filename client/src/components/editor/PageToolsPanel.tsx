import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Scissors, LayoutList, RefreshCw, Trash2 } from "lucide-react";
import { useFileStore } from "@/lib/store";

interface PageToolsPanelProps {
  onClose: () => void;
  initialTab?: string;
}

export function PageToolsPanel({ onClose, initialTab = "merge" }: PageToolsPanelProps) {
  const { pdfPages } = useFileStore();

  return (
    <div className="bg-white p-6 w-full h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Page Tools</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
      </div>

      <Tabs defaultValue={initialTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="merge">Merge</TabsTrigger>
          <TabsTrigger value="split">Split</TabsTrigger>
          <TabsTrigger value="rearrange">Rearrange</TabsTrigger>
          <TabsTrigger value="rotate">Rotate</TabsTrigger>
        </TabsList>

        <TabsContent value="merge" className="space-y-4 mt-4">
          <p className="text-sm text-gray-600">Merge multiple PDFs into one document.</p>
          <Button className="w-full">Select Files to Merge</Button>
        </TabsContent>

        <TabsContent value="split" className="space-y-4 mt-4">
          <p className="text-sm text-gray-600">Split PDF into multiple documents.</p>
          <Button className="w-full">Split PDF</Button>
        </TabsContent>

        <TabsContent value="rearrange" className="space-y-4 mt-4">
          <p className="text-sm text-gray-600">Drag and drop pages to rearrange them.</p>
          <div className="grid grid-cols-3 gap-2">
            {pdfPages.map((page, idx) => (
              <div key={idx} className="border rounded p-2 cursor-move hover:border-primary">
                <div className="text-xs text-center">Page {idx + 1}</div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rotate" className="space-y-4 mt-4">
          <p className="text-sm text-gray-600">Rotate pages in your PDF.</p>
          <div className="flex gap-2">
            <Button className="flex-1">Rotate Left</Button>
            <Button className="flex-1">Rotate Right</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}