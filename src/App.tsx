import { useState, useEffect } from 'react';
import { Settings } from './components/Settings';
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

  const [sidebarWidth, setSidebarWidth] = useState(480);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    localStorage.setItem('llm_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('use_knowledge_base', JSON.stringify(useKnowledgeBase));
  }, [useKnowledgeBase]);

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
        <h1>AI Knowledge Manager</h1>
      </header>

      <main className="main-content">
        <aside
          className="sidebar"
          style={{ width: sidebarWidth, minWidth: sidebarWidth }}
        >
          <Settings config={config} onConfigChange={setConfig} />

          <div className="kb-toggle-section">
            <label className="kb-toggle-label">
              <input
                type="checkbox"
                checked={useKnowledgeBase}
                onChange={(e) => setUseKnowledgeBase(e.target.checked)}
              />
              <span>Use Knowledge Base</span>
            </label>
          </div>

          <KnowledgeBase />

          <div className="sidebar-resizer" onMouseDown={startResizing}></div>
        </aside>

        <section className="chat-section">
          <ChatInterface config={config} useKnowledgeBase={useKnowledgeBase} />
        </section>
      </main>
    </div>
  );
}

export default App;
