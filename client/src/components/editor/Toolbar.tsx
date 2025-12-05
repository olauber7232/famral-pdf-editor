
import { MousePointer2, Type, PenTool, ImageIcon, FileCode, Layers, Scissors, RefreshCw, Minimize2, Lock, FileType, Download, Undo, Redo, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import { useFileStore } from "@/lib/store";

interface ToolbarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  onDownload: () => void;
}

export function Toolbar({ activeTool, setActiveTool, onDownload }: ToolbarProps) {
  const { undo, redo, history, historyIndex } = useFileStore();
  
  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'sign', icon: PenTool, label: 'Sign' },
    { id: 'draw', icon: PenTool, label: 'Draw' },
    { id: 'image', icon: ImageIcon, label: 'Image' },
    { id: 'markdown', icon: FileCode, label: 'Markdown' },
  ];

  const actions = [
    { id: 'merge', icon: Layers, label: 'Merge' },
    { id: 'split', icon: Scissors, label: 'Split' },
    { id: 'rearrange', icon: Layers, label: 'Rearrange' },
    { id: 'rotate', icon: RefreshCw, label: 'Rotate' },
  ];

  const handleLogoClick = () => {
    console.log("Logo clicked!");
  };

  return (
    <div className="h-16 border-b bg-white flex items-center justify-between px-4 shadow-sm shrink-0 z-50">
      <div className="flex items-center gap-4">
        <Link onClick={handleLogoClick} href="/" className="flex items-center gap-2 mr-4">
             <img src="https://www.famral.com/favicon.png" alt="Famral" className="h-8 w-auto" />
             <span className="font-bold text-lg hidden xl:block text-primary">PDF Editor</span>
        </Link>

        <div className="h-8 w-px bg-gray-200 mx-2 hidden lg:block" />

        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-md transition-colors ${
                activeTool === tool.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={tool.label}
            >
              <tool.icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">{tool.label}</span>
            </button>
          ))}
        </div>

        <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block" />

        <div className="hidden md:flex items-center gap-1">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => setActiveTool(action.id)}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-md transition-colors ${
                activeTool === action.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={action.label}
            >
              <action.icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">{action.label}</span>
            </button>
          ))}

          <button 
            onClick={() => setActiveTool('compress')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-md transition-colors ${
              activeTool === 'compress'
                ? 'bg-primary/10 text-primary'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Compress"
          >
            <Minimize2 className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">Compress</span>
          </button>

          <button 
            onClick={() => setActiveTool('protect')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-md transition-colors ${
              activeTool === 'protect'
                ? 'bg-primary/10 text-primary'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Protect"
          >
            <Lock className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">Protect</span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex flex-col items-center justify-center w-12 h-12 rounded-md transition-colors ${
                activeTool === 'convert-pdf'
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}>
                <FileType className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">Convert</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>PDF to Word</DropdownMenuItem>
              <DropdownMenuItem>PDF to Excel</DropdownMenuItem>
              <DropdownMenuItem>PDF to JPG/PNG</DropdownMenuItem>
              <DropdownMenuItem>Images to PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 hidden md:flex">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={undo}
            disabled={historyIndex <= 0}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>

        <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block" />

        <Button onClick={onDownload} className="gap-2">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Download</span>
        </Button>
      </div>
    </div>
  );
}
