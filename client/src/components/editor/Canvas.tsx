import { useRef, useState, useEffect } from 'react';
// @ts-ignore
import Draggable from 'react-draggable';
import { Trash2, GripHorizontal, Highlighter, Strikethrough, Underline, Minus, Square, Bold, Italic, Palette, Type } from 'lucide-react';
import { useFileStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DirectDrawCanvas } from "./DirectDrawCanvas";

interface CanvasProps {
  activeTool: string;
}

const FONTS = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Inter', 'Helvetica'];
const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

export function Canvas({ activeTool }: CanvasProps) {
  const {
    pdfPages,
    extractedTextItems,
    activePage,
    layers,
    updateLayer,
    deleteLayer,
    updateExtractedTextItem,
    addLayer,
    selectedTextItems,
    toggleTextItemSelection,
    clearTextSelection,
    applyStyleToSelectedText,
    deleteSelectedTextItems,
    undo,
    redo
  } = useFileStore();
  const nodeRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null);
  const [showAnnotationToolbar, setShowAnnotationToolbar] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [showTextEditToolbar, setShowTextEditToolbar] = useState(false);
  const [textToolbarPosition, setTextToolbarPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);

  const getBackgroundImage = () => {
    if (pdfPages && pdfPages.length > activePage) {
      return pdfPages[activePage];
    }
    return null;
  };

  const handleTextSelection = () => {
    if (activeTool !== 'select') return;

    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const range = selection.getRangeAt(0);
      const rects = range.getClientRects();

      if (rects.length === 0) return;

      // Calculate bounding box for multi-line selection
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      for (let i = 0; i < rects.length; i++) {
        const rect = rects[i];
        minX = Math.min(minX, rect.left);
        minY = Math.min(minY, rect.top);
        maxX = Math.max(maxX, rect.right);
        maxY = Math.max(maxY, rect.bottom);
      }

      const canvasRect = nodeRef.current?.getBoundingClientRect();

      if (canvasRect) {
        setSelectedText(selection.toString());
        setSelectionPosition({
          x: (minX + maxX) / 2 - canvasRect.left,
          y: minY - canvasRect.top - 60
        });
        setShowAnnotationToolbar(true);
      }
    } else {
      setShowAnnotationToolbar(false);
    }
  };

  const applyAnnotation = (type: 'highlight' | 'strikethrough' | 'underline' | 'squiggle' | 'redaction', color?: string) => {
    if (!selectedText || !selectionPosition) return;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const canvasRect = nodeRef.current ? nodeRef.current.getBoundingClientRect() : null;

      if (canvasRect) {
        const x = rect.left - canvasRect.left;
        const y = rect.top - canvasRect.top;

        addLayer({
          id: Date.now(),
          type: 'annotation',
          content: selectedText,
          x,
          y,
          page: activePage,
          width: rect.width,
          height: rect.height,
          annotationType: type,
          annotationColor: color || '#FFFF00',
        });
      }
    }

    setShowAnnotationToolbar(false);
    window.getSelection()?.removeAllRanges();
  };

  const handleTextItemClick = (textItemId: string, e: React.MouseEvent) => {
    if (activeTool === 'text' || activeTool === 'select') {
      e.stopPropagation();

      if (e.ctrlKey || e.metaKey) {
        toggleTextItemSelection(textItemId);
      } else if (!selectedTextItems.includes(textItemId)) {
        clearTextSelection();
        toggleTextItemSelection(textItemId);
      }

      if (selectedTextItems.length > 0 || textItemId) {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const canvasRect = nodeRef.current?.getBoundingClientRect();
        if (canvasRect) {
          setTextToolbarPosition({
            x: rect.left - canvasRect.left + rect.width / 2,
            y: rect.top - canvasRect.top - 60
          });
          setShowTextEditToolbar(true);
        }
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (activeTool === 'select' || activeTool === 'text') {
      if (!e.ctrlKey && !e.metaKey) {
        clearTextSelection();
        setShowTextEditToolbar(false);
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'select' && !e.ctrlKey && !e.metaKey) {
      const canvasRect = nodeRef.current?.getBoundingClientRect();
      if (canvasRect) {
        setSelectionStart({
          x: e.clientX - canvasRect.left,
          y: e.clientY - canvasRect.top
        });
        setIsDraggingSelection(true);
        clearTextSelection();
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSelection && selectionStart) {
      const canvasRect = nodeRef.current?.getBoundingClientRect();
      if (canvasRect) {
        const currentX = e.clientX - canvasRect.left;
        const currentY = e.clientY - canvasRect.top;

        setSelectionBox({
          x: Math.min(selectionStart.x, currentX),
          y: Math.min(selectionStart.y, currentY),
          width: Math.abs(currentX - selectionStart.x),
          height: Math.abs(currentY - selectionStart.y)
        });
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDraggingSelection && selectionBox) {
      const itemsInBox = extractedTextItems.filter(item => {
        if (item.pageIndex !== activePage) return false;
        return (
          item.x < selectionBox.x + selectionBox.width &&
          item.x + item.width > selectionBox.x &&
          item.y < selectionBox.y + selectionBox.height &&
          item.y + item.height > selectionBox.y
        );
      });

      itemsInBox.forEach(item => toggleTextItemSelection(item.id));
    }

    setIsDraggingSelection(false);
    setSelectionStart(null);
    setSelectionBox(null);
  };

  const getSelectedTextItem = () => {
    if (selectedTextItems.length === 1) {
      return extractedTextItems.find(item => item.id === selectedTextItems[0]);
    }
    if (selectedTextItems.length > 1) {
      return extractedTextItems.find(item => item.id === selectedTextItems[0]);
    }
    return null;
  };

  const updateSelectedTextStyle = (updates: Partial<typeof extractedTextItems[0]>) => {
    if (selectedTextItems.length > 0) {
      applyStyleToSelectedText(updates);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      if (e.key === 'Delete' && selectedTextItems.length > 0) {
        e.preventDefault();
        deleteSelectedTextItems();
        setShowTextEditToolbar(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedTextItems, undo, redo, deleteSelectedTextItems]);

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, [activeTool]);

  return (
    <div className="flex-1 bg-gray-100 overflow-y-auto overflow-x-auto p-4 flex justify-center items-start relative canvas-click-area" style={{ maxHeight: 'calc(100vh - 64px)' }}>
      <div className="space-y-8">
        {pdfPages.map((page, pageIndex) => (
          <div
            key={pageIndex}
            className={`relative bg-white shadow-lg select-text mx-auto ${pageIndex === activePage ? 'ring-2 ring-primary' : ''}`}
            style={{
              width: '595px',
              minHeight: '842px',
              backgroundImage: `url(${page})`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'top left',
              pointerEvents: 'auto',
            }}
            ref={pageIndex === activePage ? nodeRef : null}
            data-testid="canvas-container"
            onClick={handleCanvasClick}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
          >
        {/* Editable PDF Text Layer */}
        {extractedTextItems
          .filter(item => item.pageIndex === pageIndex)
          .map((textItem) => {
            const isSelected = selectedTextItems.includes(textItem.id);
            // Always use originalColor first, then color, then default
            const textColor = textItem.originalColor || textItem.color || '#000000';

            return (
            <div key={textItem.id} style={{ position: 'absolute', left: `${textItem.x}px`, top: `${textItem.y}px` }}>
              <div
                contentEditable={activeTool === 'text' || activeTool === 'select'}
                suppressContentEditableWarning
                onClick={(e) => handleTextItemClick(textItem.id, e)}
                onBlur={(e) => {
                  const newText = e.currentTarget.textContent || '';
                  if (newText !== textItem.text) {
                    updateExtractedTextItem(textItem.id, { text: newText });
                  }
                }}
                style={{
                  fontSize: `${textItem.fontSize}px`,
                  fontFamily: textItem.fontFamily || 'Arial',
                  color: textColor,
                  fontWeight: textItem.fontWeight || 'normal',
                  fontStyle: textItem.fontStyle || 'normal',
                  minWidth: `${textItem.width}px`,
                  minHeight: `${textItem.height}px`,
                  whiteSpace: 'pre',
                  cursor: activeTool === 'text' || activeTool === 'select' ? 'text' : 'default',
                  outline: isSelected ? '2px solid #3b82f6' : 'none',
                  userSelect: activeTool === 'text' || activeTool === 'select' ? 'text' : 'none',
                  pointerEvents: 'auto',
                  lineHeight: '1.2',
                  padding: '2px',
                  margin: '0',
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                }}
              >
                {textItem.text}
              </div>
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  left: '-4px',
                  right: '-4px',
                  bottom: '-4px',
                  border: '2px solid #3b82f6',
                  borderRadius: '4px',
                  pointerEvents: 'none',
                  boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.2)'
                }}>
                  {/* Resize handles */}
                  <div style={{ position: 'absolute', top: '-4px', left: '-4px', width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%', cursor: 'nw-resize' }} />
                  <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%', cursor: 'ne-resize' }} />
                  <div style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%', cursor: 'sw-resize' }} />
                  <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%', cursor: 'se-resize' }} />
                </div>
              )}
            </div>
          );
          })}

        {/* Selection Box for Multi-Select */}
        {selectionBox && isDraggingSelection && pageIndex === activePage && (
          <div
            style={{
              position: 'absolute',
              left: `${selectionBox.x}px`,
              top: `${selectionBox.y}px`,
              width: `${selectionBox.width}px`,
              height: `${selectionBox.height}px`,
              border: '2px dashed #3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              pointerEvents: 'none',
              zIndex: 100
            }}
          />
        )}

        {/* Multi-Select Bounding Box */}
        {selectedTextItems.length > 1 && pageIndex === activePage && (() => {
          const selectedItems = extractedTextItems.filter(item =>
            selectedTextItems.includes(item.id) && item.pageIndex === pageIndex
          );
          if (selectedItems.length === 0) return null;

          const minX = Math.min(...selectedItems.map(i => i.x));
          const minY = Math.min(...selectedItems.map(i => i.y));
          const maxX = Math.max(...selectedItems.map(i => i.x + i.width));
          const maxY = Math.max(...selectedItems.map(i => i.y + i.height));

          return (
            <div
              style={{
                position: 'absolute',
                left: `${minX - 4}px`,
                top: `${minY - 4}px`,
                width: `${maxX - minX + 8}px`,
                height: `${maxY - minY + 8}px`,
                border: '2px solid #3b82f6',
                borderRadius: '4px',
                pointerEvents: 'none',
                zIndex: 99
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-24px',
                right: '0',
                background: '#3b82f6',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {selectedTextItems.length} items
              </div>
            </div>
          );
        })()}

        

        {/* Text Selection Annotation Toolbar */}
        {showAnnotationToolbar && selectionPosition && activeTool === 'select' && pageIndex === activePage && (
          <div
            className="absolute z-50 bg-white shadow-lg border rounded-lg p-2 flex gap-1"
            style={{
              left: `${selectionPosition.x}px`,
              top: `${selectionPosition.y}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:bg-yellow-100"
              onClick={() => applyAnnotation('highlight', '#FFFF00')}
              title="Highlight"
            >
              <Highlighter className="w-4 h-4 text-yellow-600" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:bg-red-100"
              onClick={() => applyAnnotation('strikethrough', '#FF0000')}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4 text-red-600" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:bg-blue-100"
              onClick={() => applyAnnotation('underline', '#0000FF')}
              title="Underline"
            >
              <Underline className="w-4 h-4 text-blue-600" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:bg-green-100"
              onClick={() => applyAnnotation('squiggle', '#00FF00')}
              title="Squiggle"
            >
              <Minus className="w-4 h-4 text-green-600" style={{ textDecoration: 'wavy underline' }} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:bg-gray-100"
              onClick={() => applyAnnotation('redaction', '#000000')}
              title="Redaction"
            >
              <Square className="w-4 h-4 text-gray-800" fill="currentColor" />
            </Button>
          </div>
        )}
        {/* Direct Draw Canvas Overlay */}
        {activeTool === 'draw' && pageIndex === activePage && (
          <DirectDrawCanvas pageIndex={pageIndex} />
        )}

        {/* Draggable Layers */}
        {layers.filter(l => l.page === pageIndex).map((layer) => {
          const layerRef = { current: null };
          return (
          <Draggable
            key={layer.id}
            position={{ x: layer.x, y: layer.y }}
            onStop={(e: any, data: any) => updateLayer(layer.id, { x: data.x, y: data.y })}
            bounds="parent"
            handle=".handle"
            nodeRef={layerRef}
            disabled={layer.type === 'text' && activeTool !== 'select'}
          >
            <div ref={layerRef} className="absolute group z-10 inline-block" style={{ pointerEvents: 'auto' }}>
               {activeTool === 'select' && (
                 <div className="absolute -top-6 left-0 right-0 hidden group-hover:flex justify-between bg-white shadow-sm rounded border px-2 py-1 z-20">
                   <GripHorizontal className="w-4 h-4 text-gray-400 cursor-move handle" />
                   <Trash2
                     className="w-4 h-4 text-red-500 cursor-pointer hover:bg-red-50 rounded"
                     onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                   />
                 </div>
               )}

               {layer.type === 'text' && (
                 <div className={`border-2 ${activeTool === 'select' ? 'hover:border-blue-400 border-transparent' : 'border-transparent'} ${layer.isOriginalPdfText ? 'bg-transparent' : 'bg-white/50'}`}
                   style={{
                     padding: layer.isOriginalPdfText ? '0' : '4px',
                   }}
                 >
                   <textarea
                     className="bg-transparent outline-none resize-none"
                     value={layer.content}
                     onChange={(e) => {
                       updateLayer(layer.id, { content: e.target.value });
                     }}
                     style={{
                       fontSize: `${layer.fontSize || 16}px`,
                       fontFamily: layer.fontFamily || 'sans-serif',
                       color: layer.fontColor || '#000000',
                       fontWeight: layer.fontWeight || 'normal',
                       fontStyle: layer.fontStyle || 'normal',
                       textAlign: layer.textAlign as any || 'left',
                       minWidth: layer.isOriginalPdfText ? `${layer.width}px` : '100px',
                       width: layer.isOriginalPdfText ? `${layer.width}px` : `${Math.max(100, layer.content.length * (layer.fontSize || 16) * 0.6)}px`,
                       height: layer.isOriginalPdfText ? `${layer.height}px` : 'auto',
                       lineHeight: layer.isOriginalPdfText ? `${layer.height}px` : 'normal',
                       pointerEvents: 'auto',
                       userSelect: 'text',
                       cursor: 'text',
                       whiteSpace: layer.isOriginalPdfText ? 'nowrap' : 'pre-wrap',
                       overflow: 'hidden',
                     }}
                     rows={layer.isOriginalPdfText ? 1 : (layer.content.split('\n').length || 1)}
                     onClick={(e) => e.stopPropagation()}
                     onMouseDown={(e) => e.stopPropagation()}
                     onFocus={(e) => {
                       e.currentTarget.style.outline = '1px solid #3b82f6';
                     }}
                     onBlur={(e) => {
                       e.currentTarget.style.outline = 'none';
                     }}
                   />
                 </div>
               )}

               {layer.type === 'image' && (
                 <div className={`border-2 border-transparent ${activeTool === 'select' ? 'hover:border-primary/50 border-dashed' : ''}`}>
                   <img
                     src={layer.content}
                     alt="Layer"
                     style={{
                       width: `${layer.width || 200}px`,
                       height: `${layer.height || 150}px`,
                       objectFit: 'contain',
                       pointerEvents: 'none'
                     }}
                   />
                 </div>
               )}

               {layer.type === 'annotation' && (
                 <div
                   className="pointer-events-none"
                   style={{
                     width: `${layer.width}px`,
                     height: `${layer.height}px`,
                     position: 'relative'
                   }}
                 >
                   {layer.annotationType === 'highlight' && (
                     <div style={{
                       width: '100%',
                       height: '100%',
                       backgroundColor: layer.annotationColor,
                       opacity: 0.4
                     }} />
                   )}
                   {layer.annotationType === 'strikethrough' && (
                     <div style={{
                       width: '100%',
                       height: '2px',
                       backgroundColor: layer.annotationColor,
                       position: 'absolute',
                       top: '50%',
                       left: 0
                     }} />
                   )}
                   {layer.annotationType === 'underline' && (
                     <div style={{
                       width: '100%',
                       height: '2px',
                       backgroundColor: layer.annotationColor,
                       position: 'absolute',
                       bottom: 0,
                       left: 0
                     }} />
                   )}
                   {layer.annotationType === 'Squiggle' && (
                     <svg width="100%" height="100%" style={{ position: 'absolute', bottom: 0, left: 0 }}>
                       <path
                         d={`M 0 ${layer.height || 30} Q 5 ${(layer.height || 30) - 3} 10 ${layer.height || 30} T 20 ${layer.height || 30} T 30 ${layer.height || 30} T 40 ${layer.height || 30} T 50 ${layer.height || 30} T 60 ${layer.height || 30} T 70 ${layer.height || 30} T 80 ${layer.height || 30} T 90 ${layer.height || 30} T 100 ${layer.height || 30}`}
                         stroke={layer.annotationColor}
                         fill="none"
                         strokeWidth="2"
                       />
                     </svg>
                   )}
                   {layer.annotationType === 'redaction' && (
                     <div style={{
                       width: '100%',
                       height: '100%',
                       backgroundColor: layer.annotationColor,
                       opacity: 1
                     }} />
                   )}
                 </div>
               )}
            </div>
          </Draggable>
        );
        })}
          </div>
        ))}
      </div>
    </div>
  );
}