import React, { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';

interface DataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTextImport: (jsonText: string) => void;
}

export const DataModal: React.FC<DataModalProps> = ({ isOpen, onClose, onFileImport, onTextImport }) => {
  const [jsonText, setJsonText] = useState('');
  const [activeTab, setActiveTab] = useState<'paste' | 'file'>('paste');

  if (!isOpen) {
    return null;
  }

  const handleImportClick = () => {
    if (jsonText.trim()) {
      onTextImport(jsonText);
      setJsonText('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width: '600px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="data-modal-title" className="modal-title">Importera Data</h2>
          <button className="modal-close" onClick={onClose} aria-label="Stäng modal">
            <X size={24} />
          </button>
        </div>

        <div className="data-modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'paste' ? 'active' : ''}`}
            onClick={() => setActiveTab('paste')}
          >
            <FileText size={18} /> Klistra in JSON
          </button>
          <button
            className={`tab-btn ${activeTab === 'file' ? 'active' : ''}`}
            onClick={() => setActiveTab('file')}
          >
            <Upload size={18} /> Ladda upp Fil
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'paste' && (
            <div className="form-group">
              <label htmlFor="json-paste-area" className="form-label">
                Klistra in din JSON-data här
              </label>
              <textarea
                id="json-paste-area"
                rows={10}
                className="form-textarea"
                placeholder="[{...}]"
                value={jsonText}
                onChange={e => setJsonText(e.target.value)}
              />
            </div>
          )}

          {activeTab === 'file' && (
            <div className="form-group" style={{ textAlign: 'center', padding: '40px 0' }}>
               <label className="btn btn-primary" style={{ display: 'inline-flex' }}>
                  <Upload size={20} /> Välj JSON-fil
                  <input
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={onFileImport}
                  />
                </label>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Avbryt</button>
          {activeTab === 'paste' && (
            <button
              className="btn btn-success"
              onClick={handleImportClick}
              disabled={!jsonText.trim()}
            >
              Importera text
            </button>
          )}
        </div>
      </div>
    </div>
  );
};