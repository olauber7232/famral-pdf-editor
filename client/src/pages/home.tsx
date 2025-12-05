import { Navbar } from "@/components/layout/Navbar";
import { useLocation } from "wouter";
import { 
  Upload, FilePlus, FileText, Layers, Scissors, PenTool, 
  MessageSquare, LayoutList, RefreshCw, FileCode, Minimize2,
  Lock, Unlock, FileType, FileUp
} from "lucide-react";
import { useRef } from "react";
import { useFileStore } from "@/lib/store";

export default function Home() {
  const [_, setLocation] = useLocation();
  const setFile = useFileStore((state) => state.setFile);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingToolRef = useRef<string | null>(null);

  const handleToolClick = (toolId: string) => {
    if (toolId === 'create') {
      setLocation('/editor?tool=create');
      return;
    }
    
    pendingToolRef.current = toolId;
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      const tool = pendingToolRef.current || 'select';
      setLocation(`/editor?tool=${tool}`);
    }
    e.target.value = '';
  };

  const tools = [
    { 
      id: 'upload',
      icon: Upload, 
      title: "Upload PDF", 
      desc: "Upload a PDF file to start editing.",
      primary: true
    },
    { 
      id: 'create',
      icon: FilePlus, 
      title: "Create New", 
      desc: "Start with a blank document.",
      primary: true
    },
    { 
      id: 'edit',
      icon: FileText, 
      title: "Edit PDF", 
      desc: "Add text, images, and shapes."
    },
    { 
      id: 'merge',
      icon: Layers, 
      title: "Merge PDF", 
      desc: "Combine multiple PDFs into one."
    },
    { 
      id: 'split',
      icon: Scissors, 
      title: "Split PDF", 
      desc: "Extract pages or split files."
    },
    { 
      id: 'sign',
      icon: PenTool, 
      title: "Sign PDF", 
      desc: "Add signatures to documents."
    },
    { 
      id: 'annotate',
      icon: MessageSquare, 
      title: "Annotate PDF", 
      desc: "Add comments and highlights."
    },
    { 
      id: 'rearrange',
      icon: LayoutList, 
      title: "Rearrange", 
      desc: "Reorder or remove pages."
    },
    { 
      id: 'convert-pdf',
      icon: FileType, 
      title: "Convert PDF", 
      desc: "Convert PDF to other formats."
    },
    { 
      id: 'convert-to-pdf',
      icon: FileUp, 
      title: "To PDF", 
      desc: "Convert images/docs to PDF."
    },
    { 
      id: 'rotate',
      icon: RefreshCw, 
      title: "Rotate PDF", 
      desc: "Rotate pages left or right."
    },
    { 
      id: 'compress',
      icon: Minimize2, 
      title: "Compress PDF", 
      desc: "Reduce file size."
    },
    { 
      id: 'page-numbers',
      icon: FileCode, 
      title: "Page Numbers", 
      desc: "Add page numbers to PDF."
    },
    { 
      id: 'protect',
      icon: Lock, 
      title: "Protect PDF", 
      desc: "Encrypt with password."
    },
    { 
      id: 'unlock',
      icon: Unlock, 
      title: "Unlock PDF", 
      desc: "Remove password security."
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".pdf,image/*" 
        onChange={handleFileSelect}
      />
      
      <main className="flex-1 py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tools.map((tool) => (
              <div 
                key={tool.id} 
                onClick={() => handleToolClick(tool.id)}
                className={`
                  bg-white border rounded-lg p-6 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1 flex flex-col items-center text-center
                  ${tool.primary ? 'ring-2 ring-primary/20 hover:ring-primary' : ''}
                `}
              >
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors
                  ${tool.primary 
                    ? 'bg-primary text-white group-hover:bg-primary/90' 
                    : 'bg-blue-50 text-primary group-hover:bg-primary group-hover:text-white'
                  }
                `}>
                  <tool.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{tool.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {tool.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
