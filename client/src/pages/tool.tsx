import { Navbar } from "@/components/layout/Navbar";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Upload, Download, FileCheck, Layers, Scissors, 
  Minimize2, RefreshCw, Lock, Unlock, FileType, Loader2, CheckCircle
} from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";

const TOOL_CONFIG: Record<string, any> = {
  merge: {
    title: "Merge PDF Files",
    desc: "Combine multiple PDF files into one single document.",
    icon: Layers,
    action: "Merge PDFs"
  },
  split: {
    title: "Split PDF File",
    desc: "Separate one page or a whole set for easy conversion into independent PDF files.",
    icon: Scissors,
    action: "Split PDF"
  },
  compress: {
    title: "Compress PDF",
    desc: "Reduce file size while optimizing for maximal PDF quality.",
    icon: Minimize2,
    action: "Compress PDF"
  },
  rotate: {
    title: "Rotate PDF Pages",
    desc: "Rotate your PDF pages. You can rotate all pages or just selected ones.",
    icon: RefreshCw,
    action: "Rotate PDF"
  },
  protect: {
    title: "Protect PDF",
    desc: "Encrypt your PDF with a password to prevent unauthorized access.",
    icon: Lock,
    action: "Protect PDF"
  },
  unlock: {
    title: "Unlock PDF",
    desc: "Remove password security from your PDF files.",
    icon: Unlock,
    action: "Unlock PDF"
  },
  "convert-pdf": {
    title: "Convert from PDF",
    desc: "Convert your PDF to Word, PowerPoint, Excel, JPG, and more.",
    icon: FileType,
    action: "Convert"
  },
  "convert-to-pdf": {
    title: "Convert to PDF",
    desc: "Convert Word, PowerPoint, Excel, JPG, and more to PDF.",
    icon: FileType,
    action: "Convert"
  },
  "page-numbers": {
    title: "Page Numbers",
    desc: "Add page numbers into your PDF documents with ease.",
    icon: FileType,
    action: "Add Numbers"
  }
};

export default function ToolPage() {
  const [match, params] = useRoute("/tool/:id");
  const toolId = params?.id || 'merge';
  const config = TOOL_CONFIG[toolId] || TOOL_CONFIG.merge;
  
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success'>('idle');

  const onDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setStatus('idle');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleProcess = () => {
    setStatus('processing');
    // Simulate processing time
    setTimeout(() => {
      setStatus('success');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 py-12 bg-gray-50 flex flex-col items-center justify-center">
        <div className="container mx-auto px-4 max-w-3xl">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
              <config.icon className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{config.title}</h1>
            <p className="text-lg text-gray-600">{config.desc}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-8 min-h-[300px] flex flex-col items-center justify-center transition-all">
            
            {status === 'success' ? (
              <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Success!</h3>
                <p className="text-gray-600 mb-8">Your file has been processed successfully.</p>
                
                <div className="flex gap-4 justify-center">
                  <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90" onClick={() => {
                    const link = document.createElement('a');
                    link.href = '#'; // Would be actual blob url
                    link.download = `processed_${files[0]?.name || 'document.pdf'}`;
                    link.click();
                  }}>
                    <Download className="w-4 h-4" />
                    Download File
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => {
                    setFiles([]);
                    setStatus('idle');
                  }}>
                    Start Over
                  </Button>
                </div>
              </div>
            ) : status === 'processing' ? (
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-2">Processing...</h3>
                <p className="text-gray-500">Please wait while we work on your file.</p>
              </div>
            ) : files.length > 0 ? (
              <div className="w-full max-w-md">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-center gap-4">
                  <FileCheck className="w-8 h-8 text-primary flex-shrink-0" />
                  <div className="overflow-hidden">
                    <p className="font-medium truncate">{files[0].name}</p>
                    <p className="text-sm text-gray-500">{(files[0].size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-auto text-gray-500 hover:text-red-500" onClick={(e) => {
                    e.stopPropagation();
                    setFiles([]);
                  }}>
                    Remove
                  </Button>
                </div>

                <Button size="lg" className="w-full h-12 text-lg gap-2" onClick={handleProcess}>
                  {config.action} <span className="text-xs opacity-70">➜</span>
                </Button>
                
                {files.length > 1 && config.title.includes('Merge') && (
                   <p className="text-center text-sm text-gray-500 mt-4">+ {files.length - 1} other files</p>
                )}
              </div>
            ) : (
              <div 
                {...getRootProps()} 
                className={`
                  w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary hover:bg-gray-50'}
                `}
              >
                <input {...getInputProps()} />
                <div className="bg-primary text-white p-4 rounded-full mb-4 shadow-lg shadow-primary/20">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Select PDF file</h3>
                <p className="text-gray-500 mb-6">or drop PDF here</p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
