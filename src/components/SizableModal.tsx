import React, { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { useResizable } from '../hooks';

interface ResizableModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  storageKey?: string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  defaultWidth?: number;
  defaultHeight?: number;
}

export const ResizableModal = forwardRef<HTMLDivElement, ResizableModalProps>(
  ({ 
    children, 
    isOpen, 
    onClose, 
    storageKey,
    minWidth = 400,
    minHeight = 300,
    maxWidth,
    maxHeight,
    defaultWidth = 600,
    defaultHeight = 500
  }, ref) => {
    const modalRef = React.useRef<HTMLDivElement>(null);
    const { handleMouseDown, isResizing } = useResizable(modalRef as React.RefObject<HTMLElement>, {
      minWidth,
      minHeight,
      maxWidth: maxWidth || window.innerWidth * 0.9,
      maxHeight: maxHeight || window.innerHeight * 0.9,
      defaultWidth,
      defaultHeight,
      storageKey
    });

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    };

    return (
      <div 
        className={`modal-overlay ${isResizing ? 'resizing' : ''}`}
        onClick={handleOverlayClick}
      >
        <div 
          className="modal resizable-modal" 
          ref={(node) => {
            // Handle both refs
            modalRef.current = node;
            if (ref) {
              if (typeof ref === 'function') {
                ref(node);
              } else {
                ref.current = node;
              }
            }
          }}
        >
          {/* Resize Handles */}
          <div 
            className="resize-handle resize-handle-n" 
            onMouseDown={(e) => handleMouseDown(e, 'n')}
            aria-label="Resize top"
          />
          <div 
            className="resize-handle resize-handle-s" 
            onMouseDown={(e) => handleMouseDown(e, 's')}
            aria-label="Resize bottom"
          />
          <div 
            className="resize-handle resize-handle-e" 
            onMouseDown={(e) => handleMouseDown(e, 'e')}
            aria-label="Resize right"
          />
          <div 
            className="resize-handle resize-handle-w" 
            onMouseDown={(e) => handleMouseDown(e, 'w')}
            aria-label="Resize left"
          />
          <div 
            className="resize-handle resize-handle-ne" 
            onMouseDown={(e) => handleMouseDown(e, 'ne')}
            aria-label="Resize top-right"
          />
          <div 
            className="resize-handle resize-handle-nw" 
            onMouseDown={(e) => handleMouseDown(e, 'nw')}
            aria-label="Resize top-left"
          />
          <div 
            className="resize-handle resize-handle-se" 
            onMouseDown={(e) => handleMouseDown(e, 'se')}
            aria-label="Resize bottom-right"
          />
          <div 
            className="resize-handle resize-handle-sw" 
            onMouseDown={(e) => handleMouseDown(e, 'sw')}
            aria-label="Resize bottom-left"
          />

          {/* Resize Indicator */}
          <div className="resize-indicator">
            <span className="resize-dots">⋮⋮</span>
          </div>

          {children}
        </div>
      </div>
    );
  }
);

ResizableModal.displayName = 'ResizableModal';