import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface DragSnapshot {
  taskId: string;
  title: string;
  kind: 'root' | 'subtask';
  width: number;
  height: number;
}

interface DragContextValue {
  drag: DragSnapshot | null;
  draggedId: string | null;
  beginDrag: (snapshot: DragSnapshot, clientX: number, clientY: number) => void;
  endDrag: () => void;
}

const DragContext = createContext<DragContextValue | null>(null);

export function useDragState(): DragContextValue {
  const value = useContext(DragContext);
  if (!value) {
    throw new Error('useDragState debe usarse dentro de <DragProvider>');
  }
  return value;
}

export function createTransparentDragImage(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas;
}

export function DragProvider({ children }: { children: ReactNode }) {
  const [drag, setDrag] = useState<DragSnapshot | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (event: DragEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };
    const handleEnd = () => setDrag(null);
    document.addEventListener('dragover', handleMove);
    document.addEventListener('drag', handleMove);
    document.addEventListener('dragend', handleEnd);
    document.addEventListener('drop', handleEnd);
    return () => {
      document.removeEventListener('dragover', handleMove);
      document.removeEventListener('drag', handleMove);
      document.removeEventListener('dragend', handleEnd);
      document.removeEventListener('drop', handleEnd);
    };
  }, []);

  const beginDrag = (
    snapshot: DragSnapshot,
    clientX: number,
    clientY: number,
  ) => {
    setDrag(snapshot);
    setPosition({ x: clientX, y: clientY });
  };

  const endDrag = () => setDrag(null);

  return (
    <DragContext.Provider
      value={{ drag, draggedId: drag?.taskId ?? null, beginDrag, endDrag }}
    >
      {children}
      {drag ? (
        <div
          className="pointer-events-none fixed left-0 top-0 z-[100] overflow-hidden rounded-2xl border border-slate-300 bg-white/90 opacity-70 shadow-2xl"
          style={{
            transform: `translate(${position.x + 12}px, ${position.y + 12}px)`,
            width: drag.width,
            height: Math.min(drag.height, window.innerHeight - 48),
          }}
        >
          <div className="flex h-full items-center px-4">
            <span className="line-clamp-3 text-sm font-medium text-ink">
              {drag.title}
            </span>
          </div>
        </div>
      ) : null}
    </DragContext.Provider>
  );
}

export default DragProvider;