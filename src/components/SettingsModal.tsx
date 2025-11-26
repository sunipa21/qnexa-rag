import React from 'react';
import { Settings } from './Settings';
import type { LLMConfig } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: LLMConfig;
    onConfigChange: (config: LLMConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onConfigChange }) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="modal-content settings-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>⚙️ Settings</h2>
                    <button className="modal-close-btn" onClick={onClose} title="Close">
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    <Settings config={config} onConfigChange={onConfigChange} />
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="modal-btn-primary">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
