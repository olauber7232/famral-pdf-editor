import { Plus, ChevronDown, GripVertical, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFileStore } from "@/lib/store";
import { createBlankPage, loadPdfAsImages } from "@/lib/pdfUtils";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export function Sidebar() {
  const { pdfPages, setPdfPages, activePage, setActivePage } = useFileStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAddPage = async () => {
    const newPage = await createBlankPage();
    setPdfPages([...pdfPages, newPage]);
  };

  const handleUploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const pages = await loadPdfAsImages(file);
        setPdfPages([...pdfPages, ...pages]);
        toast({ title: `Added ${pages.length} pages` });
      } catch (error) {
        toast({ title: "Error loading PDF", variant: "destructive" });
      }
    }
    e.target.value = '';
  };

  return (
    <div className="w-64 bg-gray-50 border-r flex flex-col h-full shrink-0">
      <div className="p-4 border-b space-y-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf"
          onChange={handleUploadPdf}
        />
        
        <Button 
          variant="outline" 
          className="w-full justify-between bg-white"
          onClick={handleAddPage}
        >
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Page
          </span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>

        <Button 
          variant="outline" 
          className="w-full justify-between bg-white"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Merge PDF
          </span>
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {pdfPages.map((page, index) => (
          <div 
            key={index}
            onClick={() => setActivePage(index)}
            className={`relative group cursor-pointer transition-all ${
              activePage === index ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-gray-300'
            }`}
          >
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 -ml-6">
              {index + 1}
            </div>
            
            <div className="aspect-[3/4] bg-white shadow-sm border rounded-sm overflow-hidden">
              <img 
                src={page} 
                alt={`Page ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="p-1 bg-white rounded shadow cursor-grab">
                 <GripVertical className="w-3 h-3 text-gray-500" />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
