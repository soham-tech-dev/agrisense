import React, { useState, useEffect } from 'react';
import { Tractor, Sprout, Plus, Trash2, MapPin, Layers, Save, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { api } from '../services/api';
import { Farm as FarmType, UserCrop, Crop } from '../types';

export const Farm: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isMarathi = user?.language === 'mr';

  const [farms, setFarms] = useState<FarmType[]>([]);
  const [userCrops, setUserCrops] = useState<UserCrop[]>([]);
  const [masterCrops, setMasterCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  // Farm Form State
  const [landSize, setLandSize] = useState(2.5);
  const [ownershipType, setOwnershipType] = useState<'owned' | 'leased' | 'sharecropped'>('owned');
  const [location, setLocation] = useState('Nashik District');
  const [savingFarm, setSavingFarm] = useState(false);

  // Add Crop Modal State
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedCropId, setSelectedCropId] = useState('');
  const [season, setSeason] = useState('Kharif');
  const [acresAllocated, setAcresAllocated] = useState(1.0);
  const [addingCrop, setAddingCrop] = useState(false);

  const loadFarmData = async () => {
    try {
      const [farmsData, userCropsData, masterCropsData] = await Promise.all([
        api.getFarms(),
        api.getFarmerCrops(),
        api.getMasterCrops()
      ]);
      setFarms(farmsData);
      setUserCrops(userCropsData);
      setMasterCrops(masterCropsData);

      if (farmsData.length > 0) {
        setLandSize(farmsData[0].land_size);
        setOwnershipType(farmsData[0].ownership_type);
        setLocation(farmsData[0].location || '');
      }
      if (masterCropsData.length > 0) {
        setSelectedCropId(masterCropsData[0].id);
      }
    } catch (err: any) {
      showToast(err.message || 'माहिती लोड करण्यात त्रुटी आली', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarmData();
  }, []);

  const handleSaveFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFarm(true);
    try {
      if (farms.length > 0) {
        const updated = await api.updateFarm(farms[0].id, {
          land_size: landSize,
          ownership_type: ownershipType,
          location
        });
        setFarms([updated]);
      } else {
        const created = await api.createFarm({ land_size: landSize, ownership_type: ownershipType, location });
        setFarms([created]);
      }
      showToast('जमिनीची माहिती जतन केली!', 'success');
    } catch (err: any) {
      showToast(err.message || 'त्रुटी आली', 'error');
    } finally {
      setSavingFarm(false);
    }
  };

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCropId) return;
    setAddingCrop(true);
    try {
      await api.addFarmerCrop(selectedCropId, season, acresAllocated);
      showToast('नवीन पिक यशस्वीपणे जोडले!', 'success');
      setIsCropModalOpen(false);
      const updatedCrops = await api.getFarmerCrops();
      setUserCrops(updatedCrops);
    } catch (err: any) {
      showToast(err.message || 'पिक जोडताना त्रुटी आली', 'error');
    } finally {
      setAddingCrop(false);
    }
  };

  const handleRemoveCrop = async (userCropId: string) => {
    try {
      await api.removeFarmerCrop(userCropId);
      setUserCrops(prev => prev.filter(c => c.id !== userCropId));
      showToast('पिक काढले गेले', 'info');
    } catch (err: any) {
      showToast(err.message || 'त्रुटी आली', 'error');
    }
  };

  if (loading) {
    return <LoadingState message="शेती व पिकांची माहिती लोड होत आहे..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-14 font-sans">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white p-6 sm:p-8 shadow-xl border border-forest-800/60">
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-botanical-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-forest-800/80 border border-botanical-500/30 rounded-full text-xs font-bold text-botanical-300">
              <Tractor className="w-4 h-4 text-botanical-400" />
              <span>{isMarathi ? 'माझी शेती व्यवस्थापन' : 'Farm & Acreage Management'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isMarathi ? 'शेतजमीन व पिक पोर्टफोलिओ' : 'Farm Land & Crop Portfolio'}
            </h1>
            <p className="text-forest-200 text-xs sm:text-sm leading-relaxed">
              {isMarathi
                ? 'जमिनीचे एकूण क्षेत्रफळ, मालकी स्वरूप आणि हंगामवार लागवड केलेल्या पिकांचे वाटप.'
                : 'Manage registered plots, active crops, acreage distribution, and seasonal allocations.'}
            </p>
          </div>

          <Button
            variant="forest"
            size="md"
            className="bg-botanical-500 hover:bg-botanical-400 text-forest-950 font-black border-none shadow-md shrink-0"
            leftIcon={<Plus className="w-4 h-4 text-forest-950" />}
            onClick={() => setIsCropModalOpen(true)}
          >
            {isMarathi ? '+ पिक जोडा' : '+ Add Crop'}
          </Button>
        </div>
      </div>

      {/* Farm Land Details Card */}
      <Card title={isMarathi ? 'जमिनीचा तपशील (Farm Details)' : 'Farm Details'}>
        <form onSubmit={handleSaveFarm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label={isMarathi ? 'जमिनीचे क्षेत्र (एकरामध्ये)' : 'Land Size (Acres)'}
              type="number"
              step="0.1"
              min="0.1"
              value={landSize}
              onChange={(e) => setLandSize(parseFloat(e.target.value) || 1.0)}
              required
            />

            <Select
              label={isMarathi ? 'मालकी प्रकार (Ownership Type)' : 'Ownership Type'}
              value={ownershipType}
              options={[
                { value: 'owned', label: isMarathi ? 'स्वतःची (Owned)' : 'Owned' },
                { value: 'leased', label: isMarathi ? 'खंडाने घेतलेली (Leased)' : 'Leased' },
                { value: 'sharecropped', label: isMarathi ? 'बटईने घेतलेली (Sharecropped)' : 'Sharecropped' },
              ]}
              onChange={(e) => setOwnershipType(e.target.value as any)}
            />

            <Input
              label={isMarathi ? 'ठिकाण / शेताचा पत्ता' : 'Location Landmark'}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="उदा. निफाड रोड शेत"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="forest"
              isLoading={savingFarm}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {isMarathi ? 'जमीन तपशील जतन करा' : 'Save Land Info'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Cultivated Crops List Card */}
      <Card
        title={isMarathi ? 'लागवड केलेली पिके (Cultivated Crops)' : 'Cultivated Crop Portfolio'}
        subtitle={isMarathi ? 'आपल्या शेतातील सक्रिय पिकांची यादी.' : 'List of active crops in your seasonal cycle.'}
        badge={<Badge variant="forest">{userCrops.length} {isMarathi ? 'पिके' : 'Crops'}</Badge>}
      >
        {userCrops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
            {userCrops.map((uc) => (
              <div
                key={uc.id}
                className="bg-surface-subtle border border-slate-200/80 hover:border-botanical-300 rounded-2xl p-4 flex items-center justify-between shadow-2xs transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-forest-800 text-botanical-300 flex items-center justify-center font-bold">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">
                      {isMarathi ? uc.crop.name_mr : uc.crop.name_en}
                    </h4>
                    <p className="text-xs text-forest-700 font-medium">
                      हंगाम: <strong>{uc.season || 'Kharif'}</strong> • क्षेत्र: <strong>{uc.acres_allocated || 1}A</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveCrop(uc.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="पिक काढा"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title={isMarathi ? 'कोणतेही पिक जोडलेले नाही' : 'No Crops Added'}
            description={isMarathi ? 'आपल्या शेतातील पिकांची निवड करा जेणेकरून अचूक सल्ले मिळतील.' : 'Add your active crops to receive tailored advisories.'}
            actionText={isMarathi ? 'नवीन पिक जोडा' : 'Add First Crop'}
            onAction={() => setIsCropModalOpen(true)}
          />
        )}
      </Card>

      {/* Add Crop Modal */}
      <Modal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        title={isMarathi ? 'नवीन पिक जोडा (Add Crop)' : 'Add Crop to Farm'}
      >
        <form onSubmit={handleAddCrop} className="space-y-4">
          <Select
            label={isMarathi ? 'पिक निवडा (Select Crop)' : 'Select Crop'}
            value={selectedCropId}
            options={masterCrops.map((c) => ({
              value: c.id,
              label: `${c.name_mr} (${c.name_en}) - ${c.category}`,
            }))}
            onChange={(e) => setSelectedCropId(e.target.value)}
          />

          <Select
            label={isMarathi ? 'हंगाम (Season)' : 'Crop Season'}
            value={season}
            options={[
              { value: 'Kharif', label: isMarathi ? 'खरिप (Kharif)' : 'Kharif' },
              { value: 'Rabi', label: isMarathi ? 'रब्बी (Rabi)' : 'Rabi' },
              { value: 'Summer', label: isMarathi ? 'उन्हाळी (Summer)' : 'Summer' },
              { value: 'Perennial', label: isMarathi ? 'बहुवार्षिक (Perennial)' : 'Perennial' },
            ]}
            onChange={(e) => setSeason(e.target.value)}
          />

          <Input
            label={isMarathi ? 'पिकाखालील क्षेत्र (एकरामध्ये)' : 'Allocated Acres'}
            type="number"
            step="0.1"
            min="0.1"
            value={acresAllocated}
            onChange={(e) => setAcresAllocated(parseFloat(e.target.value) || 1.0)}
            required
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => setIsCropModalOpen(false)}
            >
              रद्द करा (Cancel)
            </Button>
            <Button
              type="submit"
              variant="forest"
              fullWidth
              isLoading={addingCrop}
            >
              पिक जोडा (Add Crop)
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Farm;
