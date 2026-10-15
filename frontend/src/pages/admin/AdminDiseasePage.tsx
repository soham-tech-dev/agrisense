import React, { useEffect, useState } from 'react';
import { Bug, Plus, Edit2, CheckCircle2, XCircle, RefreshCw, X, Save } from 'lucide-react';
import axios from 'axios';

interface DiseaseItem {
  id: string;
  crop: string;
  name_en: string;
  name_mr: string;
  symptoms_en: string;
  symptoms_mr: string;
  advisory_en: string;
  advisory_mr: string;
  prevention_en?: string;
  prevention_mr?: string;
  source?: string;
  active: boolean;
}

export const AdminDiseasePage: React.FC = () => {
  const [diseases, setDiseases] = useState<DiseaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DiseaseItem | null>(null);

  // Form State
  const [crop, setCrop] = useState('Tomato');
  const [nameEn, setNameEn] = useState('');
  const [nameMr, setNameMr] = useState('');
  const [symptomsEn, setSymptomsEn] = useState('');
  const [symptomsMr, setSymptomsMr] = useState('');
  const [advisoryEn, setAdvisoryEn] = useState('');
  const [advisoryMr, setAdvisoryMr] = useState('');
  const [preventionEn, setPreventionEn] = useState('');
  const [preventionMr, setPreventionMr] = useState('');
  const [source, setSource] = useState('PlantVillage');
  const [isSaving, setIsSaving] = useState(false);

  const fetchDiseases = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('agrisense_token');
      const res = await axios.get('/api/v1/admin/disease', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiseases(res.data);
    } catch (err) {
      console.error('Failed to load diseases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiseases();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setCrop('Tomato');
    setNameEn('');
    setNameMr('');
    setSymptomsEn('');
    setSymptomsMr('');
    setAdvisoryEn('');
    setAdvisoryMr('');
    setPreventionEn('');
    setPreventionMr('');
    setSource('PlantVillage');
    setShowModal(true);
  };

  const openEditModal = (item: DiseaseItem) => {
    setEditingItem(item);
    setCrop(item.crop);
    setNameEn(item.name_en);
    setNameMr(item.name_mr);
    setSymptomsEn(item.symptoms_en);
    setSymptomsMr(item.symptoms_mr);
    setAdvisoryEn(item.advisory_en);
    setAdvisoryMr(item.advisory_mr);
    setPreventionEn(item.prevention_en || '');
    setPreventionMr(item.prevention_mr || '');
    setSource(item.source || 'PlantVillage');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem('agrisense_token');
    const headers = { Authorization: `Bearer ${token}` };

    const payload = {
      crop,
      name_en: nameEn,
      name_mr: nameMr,
      symptoms_en: symptomsEn,
      symptoms_mr: symptomsMr,
      advisory_en: advisoryEn,
      advisory_mr: advisoryMr,
      prevention_en: preventionEn || undefined,
      prevention_mr: preventionMr || undefined,
      source
    };

    try {
      if (editingItem) {
        await axios.put(`/api/v1/admin/disease/${editingItem.id}`, payload, { headers });
      } else {
        await axios.post('/api/v1/admin/disease', { ...payload, id: `disease_${Date.now()}` }, { headers });
      }
      setShowModal(false);
      fetchDiseases();
    } catch (err) {
      console.error('Failed to save disease entry:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (diseaseId: string, currentActive: boolean) => {
    const token = localStorage.getItem('agrisense_token');
    try {
      await axios.patch(
        `/api/v1/admin/disease/${diseaseId}/status?active=${!currentActive}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDiseases((prev) =>
        prev.map((d) => (d.id === diseaseId ? { ...d, active: !currentActive } : d))
      );
    } catch (err) {
      console.error('Failed to toggle disease status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Bug className="w-6 h-6 text-emerald-400" />
            <span>Disease Catalog Management (रोग कॅटलॉग व्यवस्थापन)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Add, update, activate or deactivate plant pathology disease entries and expert advisories.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-950"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Disease (नवीन रोग जोडा)</span>
        </button>
      </div>

      {/* Disease List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center">
            <RefreshCw className="w-4 h-4 animate-spin mr-2 text-emerald-400" />
            <span>Loading disease catalog...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Crop</th>
                  <th className="p-4">Disease Name (MR / EN)</th>
                  <th className="p-4">Source</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {diseases.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-850/50 transition">
                    <td className="p-4 font-bold text-emerald-400">{item.crop}</td>
                    <td className="p-4 space-y-0.5">
                      <div className="font-bold text-white text-sm">{item.name_mr}</div>
                      <div className="text-[11px] text-slate-400 italic">{item.name_en}</div>
                    </td>
                    <td className="p-4 text-slate-400">{item.source || 'PlantVillage'}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleStatus(item.id, item.active)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border transition ${
                          item.active
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
                        }`}
                      >
                        {item.active ? 'ACTIVE (सक्रिय)' : 'INACTIVE (अक्रिय)'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openEditModal(item)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 inline-flex items-center gap-1 transition"
                      >
                        <Edit2 className="w-3 h-3 text-emerald-400" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Disease Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="font-bold text-white text-base">
                {editingItem ? 'Edit Disease Catalog Entry' : 'Add New Disease Catalog Entry'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Crop (पिक)</label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="Tomato">Tomato (टोमॅटो)</option>
                    <option value="Cotton">Cotton (कापूस)</option>
                    <option value="Onion">Onion (कांदा)</option>
                    <option value="Sugarcane">Sugarcane (ऊस)</option>
                    <option value="Soybean">Soybean (सोयाबीन)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Source (स्रोत)</label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Marathi Name (मराठी नाव)</label>
                <input
                  type="text"
                  value={nameMr}
                  onChange={(e) => setNameMr(e.target.value)}
                  placeholder="उदा. टोमॅटो अर्ली ब्लाइट (करपा)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">English Name</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Tomato Early Blight"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Marathi Symptoms (लक्षणे)</label>
                <textarea
                  value={symptomsMr}
                  onChange={(e) => setSymptomsMr(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">English Symptoms</label>
                <textarea
                  value={symptomsEn}
                  onChange={(e) => setSymptomsEn(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Marathi Advisory & Remedies (उपाय व सल्ला)</label>
                <textarea
                  value={advisoryMr}
                  onChange={(e) => setAdvisoryMr(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">English Advisory</label>
                <textarea
                  value={advisoryEn}
                  onChange={(e) => setAdvisoryEn(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Disease Entry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
