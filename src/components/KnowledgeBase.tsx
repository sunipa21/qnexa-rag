import React, { useState, useEffect } from 'react';
import { knowledgeBase, type Document } from '../services/knowledge-base';
import { extractTextFromPDF } from '../services/pdf-parser';
import { fetchUrlContent, getDomainFromUrl } from '../services/web-scraper';
import '../modal.css';

export const KnowledgeBase: React.FC = () => {
    const [processingStatus, setProcessingStatus] = useState<string>('');
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState<{ show: boolean; action: 'pdf' | 'url' | 'all' | null }>({ show: false, action: null });
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; docId: string; docName: string }>({ show: false, docId: '', docName: '' });
    const [documents, setDocuments] = useState<Document[]>([]);
    const [uploading, setUploading] = useState(false);
    const [fetchingUrl, setFetchingUrl] = useState(false);
    const [urlFetchStatus, setUrlFetchStatus] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [urlInput, setUrlInput] = useState('');
    const [embeddingProgress, setEmbeddingProgress] = useState<{ current: number; total: number; startTime: number } | null>(null);
    const [vectorStats, setVectorStats] = useState<{ count: number; documentsWithEmbeddings: number }>({ count: 0, documentsWithEmbeddings: 0 });

    useEffect(() => {
        loadDocuments();
        loadVectorStats();
    }, []);

    const loadDocuments = () => {
        setDocuments(knowledgeBase.getAllDocuments());
    };

    const loadVectorStats = async () => {
        const stats = await knowledgeBase.getVectorStats();
        setVectorStats(stats);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            return;
        }

        setUploading(true);
        setError(null);
        const startTime = Date.now();

        try {
            const text = await extractTextFromPDF(file);

            if (text.length < 10) {
                throw new Error('PDF appears to be empty or contains no extractable text');
            }

            setProcessingStatus('Generating embeddings for ' + file.name + '...');
            await knowledgeBase.addDocument(file.name, text, 'pdf', undefined, (current, total) => {
                setEmbeddingProgress({ current, total, startTime });
            });

            setEmbeddingProgress(null);
            setProcessingStatus('✅ ' + file.name + ' is ready to search!');
            setTimeout(() => setProcessingStatus(''), 3000);
            loadDocuments();
            loadVectorStats();

            // Reset file input
            event.target.value = '';
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload PDF');
        } finally {
            setUploading(false);
        }
    };

    const handleAddUrl = async () => {
        if (!urlInput.trim()) {
            setError('Please enter a URL');
            return;
        }

        setFetchingUrl(true);
        setError(null);
        const startTime = Date.now();

        try {
            const content = await fetchUrlContent(urlInput, (status) => {
                setUrlFetchStatus(status);
            });

            if (content.length < 50) {
                throw new Error('Could not extract meaningful content from this URL');
            }

            const domain = getDomainFromUrl(urlInput);
            setProcessingStatus('Generating embeddings for ' + domain + '...');
            await knowledgeBase.addDocument(domain, content, 'url', urlInput, (current, total) => {
                setEmbeddingProgress({ current, total, startTime });
            });

            setEmbeddingProgress(null);
            setProcessingStatus('✅ ' + domain + ' is ready to search!');
            setTimeout(() => setProcessingStatus(''), 3000);
            loadDocuments();
            loadVectorStats();
            setUrlInput('');
        } catch (err: any) {
            console.error('URL fetch error:', err);
            setError(err.message || 'Failed to fetch URL content');
        } finally {
            setFetchingUrl(false);
            setUrlFetchStatus('');
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteConfirm({ show: true, docId: id, docName: name });
    };

    const confirmDelete = async () => {
        const { docId } = deleteConfirm;
        setDeleteConfirm({ show: false, docId: '', docName: '' });

        console.log('Deleting document:', docId);

        try {
            await knowledgeBase.deleteDocument(docId);
            await loadDocuments();
            await loadVectorStats();
            console.log('Document deleted successfully');
        } catch (error) {
            console.error('Error deleting document:', error);
            setError('Failed to delete document: ' + (error as Error).message);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm({ show: false, docId: '', docName: '' });
    };

    const handleDeleteBySourceClick = (source: 'pdf' | 'url') => {
        setBulkDeleteConfirm({ show: true, action: source });
    };

    const handleClearAllClick = () => {
        setBulkDeleteConfirm({ show: true, action: 'all' });
    };

    const confirmBulkDelete = async () => {
        const { action } = bulkDeleteConfirm;
        setBulkDeleteConfirm({ show: false, action: null });

        if (!action) return;

        try {
            if (action === 'all') {
                await knowledgeBase.clear();
                setProcessingStatus('✅ All documents cleared!');
            } else {
                const count = await knowledgeBase.deleteBySource(action);
                const label = action === 'pdf' ? 'PDFs' : 'URLs';
                setProcessingStatus(`✅ Deleted ${count} ${label}!`);
            }
            setTimeout(() => setProcessingStatus(''), 3000);
            await loadDocuments();
            await loadVectorStats();
        } catch (error) {
            console.error('Bulk delete error:', error);
            setError('Failed to delete documents');
        }
    };

    const cancelBulkDelete = () => {
        setBulkDeleteConfirm({ show: false, action: null });
    };

    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (timestamp: number): string => {
        return new Date(timestamp).toLocaleDateString();
    };

    const getSourceIcon = (source: 'pdf' | 'url' | 'search'): string => {
        switch (source) {
            case 'pdf': return '📄';
            case 'url': return '🌐';
            case 'search': return '🔍';
            default: return '📄';
        }
    };

    const getEstimatedTime = (progress: { current: number; total: number; startTime: number }) => {
        if (progress.current === 0) return 'Calculating...';

        const elapsed = Date.now() - progress.startTime;
        const msPerChunk = elapsed / progress.current;
        const remainingChunks = progress.total - progress.current;
        const remainingMs = remainingChunks * msPerChunk;

        if (remainingMs < 1000) return 'Almost done...';
        if (remainingMs < 60000) return `~${Math.ceil(remainingMs / 1000)}s remaining`;
        return `~${Math.ceil(remainingMs / 60000)}m remaining`;
    };

    const totalSize = knowledgeBase.getTotalSize();

    return (
        <div className="knowledge-base-panel">
            <h2>Knowledge Base</h2>

            <div className="kb-upload-section">
                <label htmlFor="pdf-upload" className="upload-button">
                    {uploading ? 'Uploading...' : '📄 Upload PDF'}
                    <input
                        id="pdf-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                    />
                </label>
            </div>

            <div className="kb-url-section">
                <input
                    type="text"
                    className="url-input"
                    placeholder="Enter URL to add..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddUrl()}
                    disabled={fetchingUrl}
                />
                <button
                    className="add-url-button"
                    onClick={handleAddUrl}
                    disabled={fetchingUrl || !urlInput.trim()}
                >
                    {fetchingUrl ? '⏳' : '🌐 Add URL'}
                </button>
            </div>

            {processingStatus && (
                <div className="processing-status">
                    <div className="processing-status-text">
                        <span>{processingStatus}</span>
                    </div>
                </div>
            )}

            {urlFetchStatus && (
                <div className="embedding-progress">
                    <div className="embedding-progress-text">
                        <span>🌐 {urlFetchStatus}</span>
                    </div>
                </div>
            )}

            {embeddingProgress && (
                <div className="embedding-progress">
                    <div className="embedding-progress-text">
                        <span>⚡ Generating embeddings...</span>
                        <span className="font-bold">{Math.round((embeddingProgress.current / embeddingProgress.total) * 100)}%</span>
                    </div>
                    <div className="embedding-progress-bar">
                        <div
                            className="embedding-progress-fill"
                            style={{ width: `${(embeddingProgress.current / embeddingProgress.total) * 100}% ` }}
                        />
                    </div>
                    <div className="embedding-progress-text">
                        <span>{embeddingProgress.current} / {embeddingProgress.total} chunks</span>
                        <span className="embedding-progress-time">{getEstimatedTime(embeddingProgress)}</span>
                    </div>
                </div>
            )}

            {error && <div className="kb-error">{error}</div>}

            <div className="kb-stats">
                <div className="kb-stat-item">
                    <span className="kb-stat-icon">📄</span>
                    <div className="kb-stat-content">
                        <span className="kb-stat-value">{documents.length}</span>
                        <span className="kb-stat-label">document{documents.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>
                <div className="kb-stat-item">
                    <span className="kb-stat-icon">💾</span>
                    <div className="kb-stat-content">
                        <span className="kb-stat-value">{formatSize(totalSize)}</span>
                        <span className="kb-stat-label">storage</span>
                    </div>
                </div>
                <div className="kb-stat-item">
                    <span className="kb-stat-icon">✨</span>
                    <div className="kb-stat-content">
                        <span className="kb-stat-value">{vectorStats.count}</span>
                        <span className="kb-stat-label">vector{vectorStats.count !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>

            {/* Deletion Controls */}
            <div className="kb-delete-controls">
                <div className="kb-delete-buttons">
                    <button onClick={() => handleDeleteBySourceClick('pdf')} className="delete-source-btn">
                        Delete All PDFs
                    </button>
                    <button onClick={() => handleDeleteBySourceClick('url')} className="delete-source-btn">
                        Delete All URLs
                    </button>
                    <button onClick={handleClearAllClick} className="delete-all-btn">
                        Clear All
                    </button>
                </div>
            </div>

            <div className="kb-documents-list">
                {documents.length === 0 ? (
                    <div className="kb-empty">
                        No documents yet. Upload a PDF or add a URL to get started.
                    </div>
                ) : (
                    documents.map(doc => (
                        <div key={doc.id} className="kb-document-item">
                            <div className="kb-doc-info">
                                <div className="kb-doc-name" title={doc.sourceUrl || doc.name}>
                                    <span className="kb-source-icon">{getSourceIcon(doc.source)}</span>
                                    {doc.name}
                                    {doc.hasEmbeddings && <span className="kb-vector-badge" title="Has embeddings">🧠</span>}
                                </div>
                                <div className="kb-doc-meta">
                                    {doc.chunks.length} chunks · {formatDate(doc.uploadedAt)}
                                    {doc.sourceUrl && (
                                        <a
                                            href={doc.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="kb-source-link"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            🔗
                                        </a>
                                    )}
                                </div>
                            </div>
                            <button
                                className="kb-delete-btn"
                                onClick={(e) => handleDeleteClick(e, doc.id, doc.name)}
                                title="Delete document"
                            >
                                🗑️
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Custom Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="modal-overlay" onClick={cancelDelete}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Delete Document</h3>
                        <p>Are you sure you want to delete <strong>{deleteConfirm.docName}</strong>?</p>
                        <p className="modal-warning">This action cannot be undone.</p>
                        <div className="modal-buttons">
                            <button onClick={cancelDelete} className="modal-btn-cancel">Cancel</button>
                            <button onClick={confirmDelete} className="modal-btn-delete">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Confirmation Modal */}
            {bulkDeleteConfirm.show && (
                <div className="modal-overlay" onClick={cancelBulkDelete}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {bulkDeleteConfirm.action === 'all' ? 'Clear All Documents' :
                                bulkDeleteConfirm.action === 'pdf' ? 'Delete All PDFs' :
                                    'Delete All URLs'}
                        </h3>
                        <p>
                            {bulkDeleteConfirm.action === 'all'
                                ? 'Are you sure you want to delete ALL documents from your knowledge base?'
                                : `Are you sure you want to delete all ${bulkDeleteConfirm.action === 'pdf' ? 'PDF' : 'URL'} documents?`}
                        </p>
                        <p className="modal-warning">This action cannot be undone.</p>
                        <div className="modal-buttons">
                            <button onClick={cancelBulkDelete} className="modal-btn-cancel">Cancel</button>
                            <button onClick={confirmBulkDelete} className="modal-btn-delete">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
