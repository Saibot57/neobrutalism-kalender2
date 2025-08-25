import React, { forwardRef, useState, useEffect } from 'react';
import { Minimize2, Square, Maximize2, Expand } from 'lucide-react';
import type { ReactNode } from 'react';

interface SizeableModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  storageKey?: string;
  defaultSize?: 'small' | 'medium' | 'large' | 'fullscreen';
  allowedSizes?: ('small' | 'medium' | 'large' | 'fullscreen')[];
}

// Predefined size configurations
const MODAL_SIZES = {
  small: {
    width: '400px',
    height: '500px',
    maxWidth: '90vw',
    maxHeight: '70vh'
  },
  medium: {
    width: '600px',
    height: '700px',
    maxWidth: '90vw',
    maxHeight: '80vh'
  },
  large: {
    width: '900px',
    height: '800px',
    maxWidth: '95vw',
    maxHeight: '85vh'
  },
  fullscreen: {
    width: '95vw',
    height: '95vh',
    maxWidth: '95vw',
    maxHeight: '95vh'
  }
};

const SIZE_ICONS = {
  small: Minimize2,
  medium: Square,
  large: Maximize2,
  fullscreen: Expand
};

const SIZE_LABELS = {
  small: 'Liten',
  medium: 'Medium',
  large: 'Stor',
  fullscreen: 'Fullskärm'
};

export const SizeableModal = forwardRef<HTMLDivElement, SizeableModalProps>(
  ({ 
    children, 
    isOpen, 
    onClose, 
    storageKey,
    defaultSize = 'medium',
    allowedSizes = ['small', 'medium', 'large', 'fullscreen']
  }, ref) => {
    
    // Load saved size from localStorage if available
    const getSavedSize = (): typeof defaultSize => {
      if (storageKey) {
        try {
          const saved = localStorage.getItem(`modal-size-${storageKey}`);
          if (saved && allowedSizes.includes(saved as any)) {
            return saved as typeof defaultSize;
          }
        } catch (e) {
          console.warn('Failed to load saved size:', e);
        }
      }
      return defaultSize;
    };

    const [currentSize, setCurrentSize] = useState<'small' | 'medium' | 'large' | 'fullscreen'>(getSavedSize);

    // Save size to localStorage when it changes
    useEffect(() => {
      if (storageKey && isOpen) {
        try {
          localStorage.setItem(`modal-size-${storageKey}`, currentSize);
        } catch (e) {
          console.warn('Failed to save size:', e);
        }
      }
    }, [currentSize, storageKey, isOpen]);

    // Keyboard shortcuts for size changes
    useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        // Alt + 1/2/3/4 for different sizes
        if (e.altKey) {
          switch(e.key) {
            case '1':
              if (allowedSizes.includes('small')) setCurrentSize('small');
              break;
            case '2':
              if (allowedSizes.includes('medium')) setCurrentSize('medium');
              break;
            case '3':
              if (allowedSizes.includes('large')) setCurrentSize('large');
              break;
            case '4':
              if (allowedSizes.includes('fullscreen')) setCurrentSize('fullscreen');
              break;
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, allowedSizes]);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    };

    const sizeStyle = MODAL_SIZES[currentSize];

    return (
      <div 
        className="modal-overlay"
        onClick={handleOverlayClick}
      >
        <div 
          className={`modal sizeable-modal size-${currentSize}`}
          ref={ref}
          style={{
            width: sizeStyle.width,
            height: sizeStyle.height,
            maxWidth: sizeStyle.maxWidth,
            maxHeight: sizeStyle.maxHeight
          }}
        >
          {/* Size Controls */}
          <div className="modal-size-controls">
            {allowedSizes.map(size => {
              const Icon = SIZE_ICONS[size];
              return (
                <button
                  key={size}
                  className={`size-control-btn ${currentSize === size ? 'active' : ''}`}
                  onClick={() => setCurrentSize(size)}
                  title={`${SIZE_LABELS[size]} (Alt+${allowedSizes.indexOf(size) + 1})`}
                  aria-label={`Ändra till ${SIZE_LABELS[size]}`}
                >
                  <Icon size={16} />
                  <span className="size-label">{SIZE_LABELS[size]}</span>
                </button>
              );
            })}
          </div>

          {children}
        </div>
      </div>
    );
  }
);

SizeableModal.displayName = 'SizeableModal';