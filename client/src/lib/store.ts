import { create } from 'zustand';

export interface TextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
}

export interface EditableTextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  pageIndex: number;
  backgroundColor: string;
}

interface Layer {
  id: number;
  type: 'text' | 'image' | 'shape' | 'annotation';
  content: string;
  x: number;
  y: number;
  page: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontFamily?: string;
  fontColor?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  annotationType?: 'highlight' | 'strikethrough' | 'underline' | 'squiggle' | 'redaction';
  annotationColor?: string;
  isOriginalPdfText?: boolean;
  isEditable?: boolean;
}

interface FileStore {
  file: File | null;
  files: File[];
  fileUrl: string | null;
  pdfPages: string[];
  pdfTextLayers: TextItem[][];
  extractedTextItems: EditableTextItem[];
  layers: Layer[];
  activeTool: string;
  activePage: number;
  selectedTextItems: string[];
  selectedLayers: number[];
  history: any[];
  historyIndex: number;
  setFile: (file: File) => void;
  setFiles: (files: File[]) => void;
  setPdfPages: (pages: string[]) => void;
  addPdfPages: (pages: string[]) => void;
  setPdfTextLayers: (layers: TextItem[][]) => void;
  setExtractedTextItems: (items: EditableTextItem[]) => void;
  updateExtractedTextItem: (id: string, updates: Partial<EditableTextItem>) => void;
  setLayers: (layers: Layer[]) => void;
  addLayer: (layer: Layer) => void;
  updateLayer: (id: number, updates: Partial<Layer>) => void;
  deleteLayer: (id: number) => void;
  setActiveTool: (tool: string) => void;
  setActivePage: (page: number) => void;
  clearFile: () => void;
  toggleTextItemSelection: (id: string) => void;
  clearTextSelection: () => void;
  setSelectedTextItems: (ids: string[]) => void;
  toggleLayerSelection: (id: number) => void;
  clearLayerSelection: () => void;
  applyStyleToSelectedText: (updates: Partial<EditableTextItem>) => void;
  deleteSelectedTextItems: () => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
}

export const useFileStore = create<FileStore>((set, get) => ({
  file: null,
  files: [],
  fileUrl: null,
  pdfPages: [],
  pdfTextLayers: [],
  extractedTextItems: [],
  layers: [],
  activeTool: 'select',
  activePage: 0,
  selectedTextItems: [],
  selectedLayers: [],
  history: [],
  historyIndex: -1,
  
  setFile: (file) => {
    const url = URL.createObjectURL(file);
    set({ file, fileUrl: url, files: [file] });
  },
  
  setFiles: (files) => {
    if (files.length > 0) {
      const url = URL.createObjectURL(files[0]);
      set({ files, file: files[0], fileUrl: url });
    }
  },
  
  setPdfPages: (pages) => set({ pdfPages: pages }),
  
  addPdfPages: (pages) => set((state) => ({ pdfPages: [...state.pdfPages, ...pages] })),
  
  setPdfTextLayers: (layers) => set({ pdfTextLayers: layers }),
  
  setExtractedTextItems: (items) => {
    set({ extractedTextItems: items });
    get().saveToHistory();
  },
  
  updateExtractedTextItem: (id, updates) => {
    set((state) => ({
      extractedTextItems: state.extractedTextItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    }));
    get().saveToHistory();
  },
  
  setLayers: (layers) => set({ layers }),
  
  addLayer: (layer) => {
    set((state) => ({ layers: [...state.layers, layer] }));
    get().saveToHistory();
  },
  
  updateLayer: (id, updates) => {
    set((state) => ({
      layers: state.layers.map(l => l.id === id ? { ...l, ...updates } : l)
    }));
    get().saveToHistory();
  },
  
  deleteLayer: (id) => {
    set((state) => ({
      layers: state.layers.filter(l => l.id !== id)
    }));
    get().saveToHistory();
  },
  
  setActiveTool: (tool) => set({ activeTool: tool }),
  
  setActivePage: (page) => set({ activePage: page }),
  
  toggleTextItemSelection: (id) => {
    set((state) => {
      const isSelected = state.selectedTextItems.includes(id);
      return {
        selectedTextItems: isSelected
          ? state.selectedTextItems.filter(itemId => itemId !== id)
          : [...state.selectedTextItems, id]
      };
    });
  },
  
  clearTextSelection: () => set({ selectedTextItems: [] }),
  
  setSelectedTextItems: (ids) => set({ selectedTextItems: ids }),
  
  toggleLayerSelection: (id) => {
    set((state) => {
      const isSelected = state.selectedLayers.includes(id);
      return {
        selectedLayers: isSelected
          ? state.selectedLayers.filter(layerId => layerId !== id)
          : [...state.selectedLayers, id]
      };
    });
  },
  
  clearLayerSelection: () => set({ selectedLayers: [] }),
  
  applyStyleToSelectedText: (updates) => {
    set((state) => ({
      extractedTextItems: state.extractedTextItems.map(item =>
        state.selectedTextItems.includes(item.id) ? { ...item, ...updates } : item
      )
    }));
    get().saveToHistory();
  },
  
  deleteSelectedTextItems: () => {
    set((state) => ({
      extractedTextItems: state.extractedTextItems.filter(
        item => !state.selectedTextItems.includes(item.id)
      ),
      selectedTextItems: []
    }));
    get().saveToHistory();
  },
  
  saveToHistory: () => {
    const state = get();
    const snapshot = {
      extractedTextItems: JSON.parse(JSON.stringify(state.extractedTextItems)),
      layers: JSON.parse(JSON.stringify(state.layers))
    };
    
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(snapshot);
    
    set({
      history: newHistory.slice(-50),
      historyIndex: Math.min(newHistory.length - 1, 49)
    });
  },
  
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const snapshot = state.history[newIndex];
      set({
        extractedTextItems: JSON.parse(JSON.stringify(snapshot.extractedTextItems)),
        layers: JSON.parse(JSON.stringify(snapshot.layers)),
        historyIndex: newIndex
      });
    }
  },
  
  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const snapshot = state.history[newIndex];
      set({
        extractedTextItems: JSON.parse(JSON.stringify(snapshot.extractedTextItems)),
        layers: JSON.parse(JSON.stringify(snapshot.layers)),
        historyIndex: newIndex
      });
    }
  },
  
  clearFile: () => set({ 
    file: null, 
    files: [], 
    fileUrl: null, 
    pdfPages: [], 
    pdfTextLayers: [], 
    extractedTextItems: [], 
    layers: [],
    selectedTextItems: [],
    selectedLayers: [],
    history: [],
    historyIndex: -1
  }),
}));
