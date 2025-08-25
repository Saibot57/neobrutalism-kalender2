// src/components/IconPicker.tsx - Modal för att välja ikoner (emoji/lucide/custom)
import React, { useState, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, Upload, X } from 'lucide-react';

interface IconPickerProps {
  currentIcon: string;
  currentIconType: 'emoji' | 'lucide' | 'custom';
  customIcons?: { [key: string]: string };
  onSelectIcon: (icon: string, type: 'emoji' | 'lucide' | 'custom') => void;
  onClose: () => void;
}

// Popular emojis for family and activities
const EMOJI_CATEGORIES = {
  'Människor': ['👶', '👧', '👦', '👩', '👨', '👵', '👴', '🧑', '👱‍♀️', '👱‍♂️', '👩‍🦰', '👨‍🦰', '👩‍🦱', '👨‍🦱', '👩‍🦳', '👨‍🦳'],
  'Sport': ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '⛳', '🏹', '🎣', '🥊', '🥋', '🎽', '⛸', '🥌', '🎿', '⛷', '🏂', '🏋️‍♀️', '🏋️‍♂️', '🤸‍♀️', '🤸‍♂️', '⛹️‍♀️', '⛹️‍♂️', '🤺', '🤾‍♀️', '🤾‍♂️', '🏌️‍♀️', '🏌️‍♂️', '🏇', '🧘‍♀️', '🧘‍♂️', '🏄‍♀️', '🏄‍♂️', '🏊‍♀️', '🏊‍♂️', '🤽‍♀️', '🤽‍♂️', '🚣‍♀️', '🚣‍♂️', '🧗‍♀️', '🧗‍♂️', '🚴‍♀️', '🚴‍♂️'],
  'Aktiviteter': ['🎯', '🎮', '🎲', '🎨', '🎭', '🎪', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🎻', '🎰', '🧩', '♟', '🎳'],
  'Utbildning': ['📚', '📖', '📝', '✏️', '📏', '📐', '📌', '📍', '✂️', '🖊', '🖍', '📓', '📔', '📕', '📗', '📘', '📙', '📑', '🔬', '🔭', '📊', '📈', '📉', '🗂', '📁', '📂', '🗃', '📋', '📅', '📆', '🗓', '📇', '🗒', '📰', '🎓', '🏫', '💻', '⌨️', '🖥', '🖨'],
  'Mat': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍑', '🍒', '🍍', '🥭', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🌽', '🥕', '🥔', '🍠', '🥐', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🥞', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥟', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯'],
  'Transport': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍', '🛺', '🚁', '🛸', '🚀', '✈️', '🛫', '🛬', '🛩', '🚂', '🚆', '🚄', '🚅', '🚈', '🚇', '🚊', '🚝', '🚞', '🚋', '🚃', '🚍', '⛵', '🚤', '🛥', '🛳', '⛴', '🚢'],
  'Djur': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈'],
  'Övrigt': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '⭐', '🌟', '✨', '⚡', '🔥', '💥', '🌈', '☀️', '🌤', '⛅', '☁️', '🌦', '🌧', '⛈', '🌩', '🌨', '❄️', '☃️', '⛄', '🌬', '💨', '🌪', '🌫', '🌊', '💧', '💦', '☔', '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽', '⛪', '🕌', '🛕', '🕍', '⛩', '🕋', '⛲', '⛺', '🌁', '🌃', '🏙', '🌄', '🌅', '🌆', '🌇', '🌉', '♨️', '🎠', '🎡', '🎢', '💈', '🎪', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🛻', '🚚', '🚛', '🚜', '🏎', '🏍', '🛵', '🦽', '🦼', '🛺', '🚲', '🛴', '🛹', '🛼', '🚏', '🛣', '🛤', '🛢', '⛽', '🚨', '🚥', '🚦', '🛑', '🚧']
};

// Popular Lucide icons for activities
const LUCIDE_CATEGORIES = {
  'Sport & Rörelse': ['Activity', 'Bike', 'Dumbbell', 'Footprints', 'Heart', 'HeartPulse', 'Mountain', 'PersonStanding', 'Run', 'Shirt', 'Swim', 'Target', 'Trophy', 'Walking'],
  'Utbildning': ['Book', 'BookOpen', 'GraduationCap', 'Library', 'NotebookPen', 'Pencil', 'School', 'BookMarked', 'Calculator', 'Compass', 'Ruler', 'Backpack', 'BrainCircuit'],
  'Hem & Familj': ['Home', 'Baby', 'Users', 'UserPlus', 'Heart', 'Sofa', 'Bed', 'Bath', 'Coffee', 'Utensils', 'ChefHat', 'Cookie', 'Pizza', 'Soup'],
  'Underhållning': ['Music', 'Headphones', 'Mic', 'Piano', 'Guitar', 'Drum', 'Radio', 'Tv', 'Film', 'Gamepad', 'Gamepad2', 'Dice1', 'Dice5', 'PartyPopper', 'Gift', 'Sparkles'],
  'Transport': ['Car', 'Bus', 'Train', 'Plane', 'Ship', 'Anchor', 'Navigation', 'MapPin', 'Map', 'Locate', 'Route', 'Milestone', 'Signpost'],
  'Natur & Väder': ['Sun', 'Moon', 'Cloud', 'CloudRain', 'CloudSnow', 'Wind', 'Thermometer', 'Umbrella', 'Flower', 'Trees', 'Leaf', 'Bug', 'Bird', 'Fish', 'Dog', 'Cat'],
  'Tid & Schema': ['Calendar', 'CalendarDays', 'Clock', 'Clock2', 'Clock3', 'Clock4', 'Clock5', 'Clock6', 'Clock7', 'Clock8', 'Clock9', 'Clock10', 'Clock11', 'Clock12', 'Timer', 'Hourglass', 'AlarmClock', 'Watch'],
  'Verktyg': ['Wrench', 'Hammer', 'Screwdriver', 'Scissors', 'Paintbrush', 'Palette', 'Brush', 'PenTool', 'Eraser', 'Highlighter', 'Package', 'Box', 'Archive', 'Folder', 'FolderOpen']
};

export const IconPicker: React.FC<IconPickerProps> = ({
  currentIcon,
  currentIconType,
  customIcons = {},
  onSelectIcon,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'emoji' | 'lucide' | 'custom'>(currentIconType);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle custom icon upload
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (100KB limit)
    if (file.size > 100000) {
      alert('Bilden är för stor. Max 100KB tillåten.');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Endast bildfiler är tillåtna.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      const iconId = `custom-${Date.now()}`;
      
      // Save to localStorage
      const savedIcons = JSON.parse(localStorage.getItem('customIcons') || '{}');
      savedIcons[iconId] = base64String;
      localStorage.setItem('customIcons', JSON.stringify(savedIcons));
      
      // Select the uploaded icon
      onSelectIcon(iconId, 'custom');
    };
    reader.readAsDataURL(file);
  };

  // Get custom icons from localStorage
  const getCustomIcons = () => {
    const saved = localStorage.getItem('customIcons');
    return saved ? JSON.parse(saved) : {};
  };

  // Filter icons based on search
  const filterIcons = (icons: string[], query: string) => {
    if (!query) return icons;
    return icons.filter(icon => icon.toLowerCase().includes(query.toLowerCase()));
  };

  // Get filtered emojis
  const getFilteredEmojis = () => {
    let emojis: string[] = [];
    if (selectedCategory === 'all') {
      emojis = Object.values(EMOJI_CATEGORIES).flat();
    } else {
      emojis = EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES] || [];
    }
    return filterIcons(emojis, searchQuery);
  };

  // Get filtered Lucide icons
  const getFilteredLucideIcons = () => {
    let icons: string[] = [];
    if (selectedCategory === 'all') {
      icons = Object.values(LUCIDE_CATEGORIES).flat();
    } else {
      icons = LUCIDE_CATEGORIES[selectedCategory as keyof typeof LUCIDE_CATEGORIES] || [];
    }
    return filterIcons(icons, searchQuery);
  };

  // Render Lucide icon component
  const renderLucideIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent size={24} />;
  };

  const allCustomIcons = { ...customIcons, ...getCustomIcons() };

  return (
    <div className="icon-picker-overlay" onClick={onClose}>
      <div className="icon-picker" onClick={(e) => e.stopPropagation()}>
        <div className="icon-picker-header">
          <h3>Välj Ikon</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="icon-picker-tabs">
          <button 
            className={`tab ${activeTab === 'emoji' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('emoji');
              setSelectedCategory('all');
              setSearchQuery('');
            }}
          >
            😊 Emojis
          </button>
          <button 
            className={`tab ${activeTab === 'lucide' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('lucide');
              setSelectedCategory('all');
              setSearchQuery('');
            }}
          >
            <LucideIcons.Shapes size={16} /> Ikoner
          </button>
          <button 
            className={`tab ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('custom');
              setSearchQuery('');
            }}
          >
            <Upload size={16} /> Egna
          </button>
        </div>

        {/* Search bar */}
        <div className="icon-picker-search">
          <Search size={20} />
          <input 
            type="text"
            placeholder="Sök..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category filter */}
        {activeTab !== 'custom' && (
          <div className="icon-picker-categories">
            <button 
              className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              Alla
            </button>
            {Object.keys(activeTab === 'emoji' ? EMOJI_CATEGORIES : LUCIDE_CATEGORIES).map(cat => (
              <button 
                key={cat}
                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Icon grid */}
        <div className="icon-picker-grid">
          {activeTab === 'emoji' && getFilteredEmojis().map(emoji => (
            <button
              key={emoji}
              className={`icon-item ${currentIcon === emoji && currentIconType === 'emoji' ? 'selected' : ''}`}
              onClick={() => onSelectIcon(emoji, 'emoji')}
              title={emoji}
            >
              <span style={{ fontSize: '24px' }}>{emoji}</span>
            </button>
          ))}

          {activeTab === 'lucide' && getFilteredLucideIcons().map(iconName => (
            <button
              key={iconName}
              className={`icon-item ${currentIcon === iconName && currentIconType === 'lucide' ? 'selected' : ''}`}
              onClick={() => onSelectIcon(iconName, 'lucide')}
              title={iconName}
            >
              {renderLucideIcon(iconName)}
            </button>
          ))}

          {activeTab === 'custom' && (
            <>
              <button
                className="icon-item upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={24} />
                <span>Ladda upp</span>
              </button>
              {Object.entries(allCustomIcons).map(([id, dataUrl]) => (
                <button
                  key={id}
                  className={`icon-item ${currentIcon === id && currentIconType === 'custom' ? 'selected' : ''}`}
                  onClick={() => onSelectIcon(id, 'custom')}
                >
                  <img src={dataUrl} alt="Custom icon" style={{ width: 24, height: 24 }} />
                </button>
              ))}
            </>
          )}
        </div>

        <input 
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleIconUpload}
        />
      </div>
    </div>
  );
};