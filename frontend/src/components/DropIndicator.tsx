import { DragEvent, useState } from 'react';

interface DropIndicatorProps {
  index: number;
  onDrop: (taskId: string, index: number) => void;
  className?: string;
  lineClassName?: string;
  block?: boolean;
  blockClassName?: string;
  blockHeight?: number;
}

export function DropIndicator({
  index,
  onDrop,
  className = 'h-2 px-1',
  lineClassName = 'h-0.5 w-full',
  block = false,
  blockClassName = 'h-14 w-full',
  blockHeight = 56,
}: DropIndicatorProps) {
  const [over, setOver] = useState(false);

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes('text/plain')) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    setOver(true);
  };

  const handleDragLeave = () => setOver(false);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setOver(false);
    const taskId = event.dataTransfer.getData('text/plain');
    if (taskId) {
      onDrop(taskId, index);
    }
  };

  const showBlock = block && over;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={
        showBlock
          ? `flex items-start transition-all ${blockClassName}`
          : `flex items-center transition-colors ${className}`
      }
    >
      {showBlock ? (
        <div
          className="w-full rounded-xl border-2 border-dashed border-brand bg-brand-light/50"
          style={{ height: blockHeight }}
        />
      ) : (
        <div
          className={`rounded-full transition-colors ${lineClassName} ${
            over ? 'bg-brand' : 'bg-transparent'
          }`}
        />
      )}
    </div>
  );
}