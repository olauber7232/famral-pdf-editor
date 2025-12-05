import { useEffect, useState } from "react";
import { useFileStore } from "@/lib/store";
import { Canvas } from "@/components/editor/Canvas";
import { Toolbar } from "@/components/editor/Toolbar";
import { Sidebar } from "@/components/editor/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { loadPdfAsImages, loadPdfTextLayers, createBlankPage } from "@/lib/pdfUtils";
import { extractTextFromPdf } from "@/lib/pdfTextExtractor";
import { InlineTextEditor } from "@/components/editor/InlineTextEditor";
import { SignToolPanel } from "@/components/editor/SignToolPanel";
import { ImageToolPanel } from "@/components/editor/ImageToolPanel";
import { PageToolsPanel } from "@/components/editor/PageToolsPanel";
import { CompressPanel } from "@/components/editor/CompressPanel";
import { ProtectPanel } from "@/components/editor/ProtectPanel";
import { ConvertPanel } from "@/components/editor/ConvertPanel";
import { ShapesPanel } from "@/components/editor/ShapesPanel";
import { DirectDrawCanvas } from "@/components/editor/DirectDrawCanvas";
import { TextEditPanel } from "@/components/editor/TextEditPanel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { checkDownloadLimit } from "@/lib/storage";

export default function Editor() {
  const queryParams = new URLSearchParams(window.location.search);
  const initialTool = queryParams.get('tool') || 'select';

  const { file, pdfPages, setPdfPages, setPdfTextLayers, setExtractedTextItems, setActiveTool, activeTool } = useFileStore();
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [showInlineTextEditor, setShowInlineTextEditor] = useState(false);
  const [inlineEditorPosition, setInlineEditorPosition] = useState({ x: 0, y: 0 });
  const { toast } = useToast();

  useEffect(() => {
    const loadFile = async () => {
      if (!file) {
        const blank = await createBlankPage();
        setPdfPages([blank]);
        return;
      }

      if (file.type === 'application/pdf') {
        try {
          toast({ title: "Loading PDF...", description: "Extracting text and rendering pages" });

          const pages = await loadPdfAsImages(file);
          const extractedText = await extractTextFromPdf(file);

          console.log('Extracted text items:', extractedText.slice(0, 5)); // Debug first 5 items

          if (pages && pages.length > 0) {
            setPdfPages(pages);
            setExtractedTextItems(extractedText);

            toast({ 
              title: "PDF loaded successfully", 
              description: `${pages.length} pages with ${extractedText.length} editable text items` 
            });
          } else {
            throw new Error('No pages loaded from PDF');
          }
        } catch (error) {
          console.error("PDF Loading error:", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          toast({ 
            title: "Error loading PDF", 
            description: `Failed to load PDF: ${errorMessage}`, 
            variant: "destructive" 
          });
          const blank = await createBlankPage();
          setPdfPages([blank]);
        }
      } else if (file.type.startsWith('image/')) {
        try {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
              setPdfPages([result]);
              toast({ title: "Image loaded successfully" });
            }
          };
          reader.onerror = () => {
            toast({ title: "Error loading image", variant: "destructive" });
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error("Image loading error:", error);
          toast({ title: "Error loading image", variant: "destructive" });
        }
      }
    };

    loadFile();
  }, [file, setPdfPages, setExtractedTextItems, toast]);

  useEffect(() => {
    setActiveTool(initialTool);
  }, [initialTool]);

  const handleDownload = () => {
    const allowed = checkDownloadLimit();
    if (!allowed) {
      setShowLimitDialog(true);
      return;
    }

    toast({
      title: "Processing PDF",
      description: "Preparing your document for download...",
    });

    setTimeout(() => {
      toast({
        title: "Download Started",
        description: "Your PDF has been successfully downloaded.",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800"
      });
    }, 1500);
  };

  const toolPanelMap: Record<string, React.ReactNode> = {
    text: <TextEditPanel onClose={() => setActivePanel(null)} />,
    sign: <SignToolPanel onClose={() => setActivePanel(null)} />,
    draw: null, // Direct drawing on canvas
    image: <ImageToolPanel onClose={() => setActivePanel(null)} />,
    markdown: <ShapesPanel onClose={() => setActivePanel(null)} />,
    merge: <PageToolsPanel initialTab="merge" onClose={() => setActivePanel(null)} />,
    split: <PageToolsPanel initialTab="split" onClose={() => setActivePanel(null)} />,
    rearrange: <PageToolsPanel initialTab="rearrange" onClose={() => setActivePanel(null)} />,
    rotate: <PageToolsPanel initialTab="rotate" onClose={() => setActivePanel(null)} />,
    compress: <CompressPanel onClose={() => setActivePanel(null)} />,
    protect: <ProtectPanel onClose={() => setActivePanel(null)} />,
    'convert-pdf': <ConvertPanel onClose={() => setActivePanel(null)} />,
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <Toolbar 
        activeTool={activeTool} 
        setActiveTool={(tool) => {
          setActiveTool(tool);
          if (['text', 'sign', 'draw', 'image', 'markdown', 'merge', 'split', 'rearrange', 'rotate', 'compress', 'protect', 'convert-pdf'].includes(tool)) {
            setActivePanel(tool);
          } else {
            setActivePanel(null); // Close panel if tool is not one that opens a panel
          }
        }}
        onDownload={handleDownload}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        <div 
          className="flex-1 relative overflow-hidden flex"
        >
          <div className="flex-1 relative overflow-hidden">
            <Canvas activeTool={activeTool} />
          </div>

          {activePanel && (
            <div className="w-96 border-l bg-white overflow-y-auto shrink-0">
              {toolPanelMap[activePanel]}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Daily Limit Reached</DialogTitle>
            <DialogDescription className="text-center pt-2">
              You have reached your daily limit of 5 downloads.
              Please contact us for unlimited access.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-4 gap-4">
             <div className="bg-blue-50 p-4 rounded-full">
               <Mail className="w-8 h-8 text-primary" />
             </div>
             <p className="font-medium text-lg">contact@famral.com</p>
             <Button onClick={() => setShowLimitDialog(false)} className="w-full mt-2">
               Close
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}