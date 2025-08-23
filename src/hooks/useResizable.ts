import { useState, useEffect, useCallback } from 'react';
import type { RefObject } from 'react';

interface Size {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

interface UseResizableOptions {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  defaultWidth?: number;
  defaultHeight?: number;
  storageKey?: string;
}

export const useResizable = (
  ref: RefObject<HTMLElement>,
  options: UseResizableOptions = {}
) => {
  const {
    minWidth = 400,
    minHeight = 300,
    maxWidth = window.innerWidth * 0.9,
    maxHeight = window.innerHeight * 0.9,
    defaultWidth = 600,
    defaultHeight = 500,
    storageKey
  } = options;

  // Load saved size from localStorage if available
  const getSavedSize = (): Size => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(`resizable-${storageKey}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            width: Math.min(Math.max(parsed.width, minWidth), maxWidth),
            height: Math.min(Math.max(parsed.height, minHeight), maxHeight)
          };
        }
      } catch (e) {
        console.warn('Failed to load saved size:', e);
      }
    }
    return { width: defaultWidth, height: defaultHeight };
  };

  const [size, setSize] = useState<Size>(getSavedSize);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [startSize, setStartSize] = useState<Size>({ width: 0, height: 0 });
  const [startPos, setStartPos] = useState<Position>({ x: 0, y: 0 });

  // Save size to localStorage
  useEffect(() => {
    if (storageKey && !isResizing) {
      try {
        localStorage.setItem(`resizable-${storageKey}`, JSON.stringify(size));
      } catch (e) {
        console.warn('Failed to save size:', e);
      }
    }
  }, [size, storageKey, isResizing]);

  const handleMouseDown = useCallback((e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeDirection(direction);
    setStartSize({ ...size });
    setStartPos({ x: e.clientX, y: e.clientY });
  }, [size]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;
      
      let newWidth = startSize.width;
      let newHeight = startSize.height;

      // Handle horizontal resizing
      if (resizeDirection.includes('e')) {
        newWidth = startSize.width + deltaX;
      } else if (resizeDirection.includes('w')) {
        newWidth = startSize.width - deltaX;
      }

      // Handle vertical resizing
      if (resizeDirection.includes('s')) {
        newHeight = startSize.height + deltaY;
      } else if (resizeDirection.includes('n')) {
        newHeight = startSize.height - deltaY;
      }

      // Apply constraints
      newWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
      newHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection('');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection, startPos, startSize, minWidth, minHeight, maxWidth, maxHeight]);

  // Apply size to element
  useEffect(() => {
    if (ref.current) {
      ref.current.style.width = `${size.width}px`;
      ref.current.style.height = `${size.height}px`;
    }
  }, [size, ref]);

  return {
    size,
    isResizing,
    handleMouseDown,
    resetSize: () => setSize({ width: defaultWidth, height: defaultHeight })
  };
};