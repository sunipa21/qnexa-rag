import { useState, useEffect } from 'react';
import { SettingsModal } from './components/SettingsModal';
import { ChatInterface } from './components/ChatInterface';
import { KnowledgeBase } from './components/KnowledgeBase';
import type { LLMConfig } from './types';
import './index.css';

const DEFAULT_CONFIG: LLMConfig = {
  provider: 'ollama',
  model: 'llama3',
  baseUrl: 'http://localhost:11434',
};

function App() {
  console.log('Rendering App component');
  const [config, setConfig] = useState<LLMConfig>(() => {
    try {
      const saved = localStorage.getItem('llm_config');
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch (e) {
      console.error('Error parsing config from localStorage', e);
      return DEFAULT_CONFIG;
    }
  });

  const [useKnowledgeBase, setUseKnowledgeBase] = useState(() => {
    const saved = localStorage.getItem('use_knowledge_base');
    return saved ? JSON.parse(saved) : true;
  });

  const [useWebSearch, setUseWebSearch] = useState(() => {
    const saved = localStorage.getItem('use_web_search');
    return saved ? JSON.parse(saved) : false;
  });

  const [sidebarWidth, setSidebarWidth] = useState(480);
  const [isResizing, setIsResizing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('llm_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('use_knowledge_base', JSON.stringify(useKnowledgeBase));
  }, [useKnowledgeBase]);

  useEffect(() => {
    localStorage.setItem('use_web_search', JSON.stringify(useWebSearch));
  }, [useWebSearch]);

  const startResizing = () => {
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      const newWidth = mouseMoveEvent.clientX;
      if (newWidth > 250 && newWidth < 600) {
        setSidebarWidth(newWidth);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  return (
    <div className="app-container">
      <header className="app-header">
        <img src="/qnexa-logo.png" alt="Qnexa AI - The Central Nexus for Intelligent Queries" className="app-logo" />
        <button
          className="settings-icon-btn"
          onClick={() => setIsSettingsOpen(true)}
          title="Settings"
        >
          ⚙️
        </button>
      </header>

      <main className="main-content">
        <aside
          className="sidebar"
          style={{ width: sidebarWidth, minWidth: sidebarWidth }}
        >
          <div className="kb-toggle-section">
            <label className="kb-toggle-label">
              <span>Use Knowledge Base</span>
              <input
                type="checkbox"
                checked={useKnowledgeBase}
                onChange={(e) => setUseKnowledgeBase(e.target.checked)}
              />
            </label>
          </div>

          <div className="kb-toggle-section">
            <label className="kb-toggle-label">
              <span>🔍 Search Web</span>
              <input
                type="checkbox"
                checked={useWebSearch}
                onChange={(e) => setUseWebSearch(e.target.checked)}
              />
            </label>
          </div>

          <KnowledgeBase />

          <div className="sidebar-resizer" onMouseDown={startResizing}></div>
        </aside>

        <section className="chat-section">
          <ChatInterface config={config} useKnowledgeBase={useKnowledgeBase} useWebSearch={useWebSearch} />
        </section>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={setConfig}
      />
    </div>
  );
}

export default App;
