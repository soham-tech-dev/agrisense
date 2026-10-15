import React, { useEffect, useState } from 'react';
import { BookOpen, Upload, Trash2, RefreshCw, Layers, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import axios from 'axios';

interface KnowledgeDoc {
  id: string;
  title: string;
  organization: string;
  crop: string;
  topic: string;
  language: string;
  source?: string;
  year: number;
  version: string;
  verified: boolean;
  chunk_count: number;
  content_summary?: string;
  uploaded_at: string;
}

export const AdminKnowledgePage: React.FC = () => {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [reindexingId, setReindexingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('KVK Pune');
  const [crop, setCrop] = useState('Onion');
  const [topic, setTopic] = useState('Disease');
  const [language, setLanguage] = useState('mr');
  const [rawContent, setRawContent] = useState('');

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('agrisense_token');
      const res = await axios.get('/api/v1/admin/knowledge', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocs(res.data);
    } catch (err) {
      console.error('Failed to fetch knowledge docs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isUploading) return;
    setIsUploading(true);

    try {
      const token = localStorage.getItem('agrisense_token');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('organization', organization);
      formData.append('crop', crop);
      formData.append('topic', topic);
      formData.append('language', language);
      formData.append('raw_content', rawContent);

      await axios.post('/api/v1/admin/knowledge', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setTitle('');
      setRawContent('');
      setShowUploadModal(false);
      fetchDocs();
    } catch (err) {
      console.error('Upload document error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReindex = async (docId: string) => {
    setReindexingId(docId);
    try {
      const token = localStorage.getItem('agrisense_token');
      await axios.post(
        `/api/v1/admin/knowledge/${docId}/index`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDocs();
    } catch (err) {
      console.error('Reindex error:', err);
    } finally {
      setReindexingId(null);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      const token = localStorage.getItem('agrisense_token');
      await axios.delete(`/api/v1/admin/knowledge/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocs((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      console.error('Delete doc error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            <span>KVK / ICAR Knowledge Base Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload agricultural reference materials, inspect ChromaDB vector chunk status, and trigger re-indexing.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-950"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document (नवीन दस्तऐवज जोडा)</span>
        </button>
      </div>

      {/* Document List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center">
            <RefreshCw className="w-4 h-4 animate-spin mr-2 text-emerald-400" />
            <span>Loading KVK Knowledge Base...</span>
          </div>
        ) : docs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No knowledge documents indexed yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Document Title & Org</th>
                  <th className="p-4">Crop / Topic</th>
                  <th className="p-4 text-center">Vector Chunks</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-850/50 transition">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{doc.title}</div>
                      <div className="text-[11px] text-emerald-400 font-semibold">{doc.organization} • v{doc.version}</div>
                    </td>
                    <td className="p-4">
                      <div>Crop: {doc.crop}</div>
                      <div className="text-[11px] text-slate-400">Topic: {doc.topic}</div>
                    </td>
                    <td className="p-4 text-center font-bold text-amber-400">
                      <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/30">
                        <Layers className="w-3 h-3" />
                        {doc.chunk_count} Chunks
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle className="w-3 h-3" /> Indexed
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleReindex(doc.id)}
                        disabled={reindexingId === doc.id}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 inline-flex items-center gap-1 transition"
                      >
                        <RefreshCw className={`w-3 h-3 text-emerald-400 ${reindexingId === doc.id ? 'animate-spin' : ''}`} />
                        <span>Re-index</span>
                      </button>

                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 rounded-lg text-xs font-bold text-rose-300 inline-flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">Upload KVK Document Entry</h3>
            
            <form onSubmit={handleUpload} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Document Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. KVK Sugarcane Advisory Manual"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Organization</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Crop</label>
                  <input
                    type="text"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Raw Text / Advisory Document Content</label>
                <textarea
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  rows={4}
                  placeholder="Paste verified KVK agricultural document text..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'Indexing...' : 'Index Document'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
