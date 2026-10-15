import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  AlertTriangle, 
  History, 
  ArrowRight, 
  CheckCircle2, 
  Image as ImageIcon,
  Sun,
  Focus,
  Leaf,
  Info,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserCrop } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const DiseasePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const lang = language || 'mr';
  const isMarathi = lang === 'mr';

  const [mode, setMode] = useState<'upload' | 'camera'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [farmerCrops, setFarmerCrops] = useState<UserCrop[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState<string>('');

  // Camera webcam states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    api.getFarmerCrops()
      .then(crops => setFarmerCrops(crops))
      .catch(() => setFarmerCrops([]));

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setErrorMessage(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setErrorMessage(
        isMarathi
          ? "कॅमेरा सुरू करता आला नाही. कृपया ब्राऊझर सेटिंग्जमध्ये कॅमेरा परवानगी द्या किंवा गॅलरीतून फोटो अपलोड करा."
          : "Could not start camera. Please allow camera permissions in browser settings or upload from gallery."
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `captured_leaf_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
        stopCamera();
        setMode('upload');
      }
    }, 'image/jpeg', 0.92);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleResetImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!navigator.onLine) {
      setErrorMessage(
        isMarathi
          ? "रोग निदानासाठी इंटरनेट कनेक्शन आवश्यक आहे."
          : "Internet connection is required to analyze crop diseases."
      );
      return;
    }

    if (!selectedFile) {
      setErrorMessage(
        isMarathi
          ? "कृपया पिकाच्या बाधित पानाचा स्पष्ट फोटो निवडा किंवा काढा."
          : "Please select or take a clear photograph of the affected leaf."
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setAnalysisStep(isMarathi ? '१. फोटोची स्पष्टता व रंग तपासत आहे...' : '1. Validating leaf clarity and color...');

    try {
      setTimeout(() => {
        setAnalysisStep(isMarathi ? '२. OpenCV पानांचे डाग शोधत आहे...' : '2. Segmenting leaf spots via OpenCV...');
      }, 700);

      setTimeout(() => {
        setAnalysisStep(isMarathi ? '३. AI मॉडेल द्वारे रोग व उपाय शोधत आहे...' : '3. Running AI disease identification...');
      }, 1400);

      const response = await api.predictDisease(selectedFile, selectedCropId || undefined);
      navigate(`/disease/result/${response.scan_id}`);
    } catch (err: any) {
      console.error("Disease prediction failed:", err);
      setErrorMessage(
        err.message || (isMarathi ? "कृपया बाधित पानाचा स्पष्ट फोटो काढून पुन्हा प्रयत्न करा." : "Please take a clear photo of the affected leaf and try again.")
      );
    } finally {
      setIsLoading(false);
      setAnalysisStep('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-14 font-sans">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white p-6 sm:p-8 shadow-xl border border-forest-800/60">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-botanical-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-forest-800/80 border border-botanical-500/30 rounded-full text-xs font-bold text-botanical-300">
              <ShieldCheck className="w-4 h-4 text-botanical-400" />
              <span>{isMarathi ? 'AI पिक आरोग्य तपासणी • KVK प्रमाणित' : 'AI Crop Health Scanner • KVK Certified'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isMarathi ? 'पिक रोग निदान (Crop Pathology)' : 'Crop Disease Detection'}
            </h1>
            <p className="text-forest-200 text-xs sm:text-sm leading-relaxed">
              {isMarathi
                ? 'बाधित पानाचा फोटो काढा किंवा निवडा. सेकंदात रोगाचे नाव, तीव्रता आणि रासायनिक व सेंद्रिय उपाय मिळवा.'
                : 'Capture or upload a leaf photo for instant AI pathology diagnosis and verified treatment steps.'}
            </p>
          </div>

          <Link
            to="/disease/history"
            className="flex items-center gap-2 bg-forest-800/80 hover:bg-forest-700/80 text-forest-100 border border-forest-600/50 px-4 py-2.5 rounded-xl shadow-xs transition text-xs sm:text-sm font-bold shrink-0"
          >
            <History className="w-4 h-4 text-botanical-400" />
            <span>{isMarathi ? 'माझे जुने स्कॅन' : 'Past Scans'}</span>
          </Link>
        </div>
      </div>

      {/* Photography Tips Card for Farmers */}
      <Card variant="subtle" padding="sm" className="space-y-2 border-botanical-200/80">
        <h4 className="text-xs font-black text-forest-900 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-botanical-600" />
          <span>{isMarathi ? 'अचूक निदानासाठी ३ महत्त्वाच्या टिप्स:' : '3 Tips for Accurate Diagnosis:'}</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-botanical-50 text-botanical-700 flex items-center justify-center shrink-0">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-800">
              {isMarathi ? '१. एकाच पानाचा जवळून फोटो घ्या.' : '1. Close-up of a single affected leaf.'}
            </span>
          </div>
          <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Sun className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-800">
              {isMarathi ? '२. चांगला नैसर्गिक प्रकाश असावा (सावली नको).' : '2. Natural daylight, avoid dark shadows.'}
            </span>
          </div>
          <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
              <Focus className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-800">
              {isMarathi ? '३. रोगाचे ठिपके स्पष्ट व फोकसमध्ये ठेवा.' : '3. Disease spots sharp and in focus.'}
            </span>
          </div>
        </div>
      </Card>

      {/* Main Upload / Camera Card */}
      <Card variant="elevated" className="space-y-6">
        
        {/* Toggle Mode Buttons */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-md mx-auto">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setMode('upload');
            }}
            className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              mode === 'upload' ? 'bg-white text-forest-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{isMarathi ? 'फोटो निवडा' : 'Upload Photo'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('camera');
              startCamera();
            }}
            className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              mode === 'camera' ? 'bg-white text-forest-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{isMarathi ? 'कॅमेऱ्याने फोटो घ्या' : 'Take Photo'}</span>
          </button>
        </div>

        {/* Validation Error Banner */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-300 p-4 rounded-2xl flex items-start gap-3 animate-fade-in text-left">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-black text-rose-900 uppercase">
                {isMarathi ? 'फोटो त्रुटी' : 'Photo Notice'}
              </h4>
              <p className="text-xs text-rose-800 font-semibold mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Camera View Mode */}
        {mode === 'camera' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-full max-w-lg aspect-[4/3] bg-black rounded-3xl overflow-hidden shadow-inner flex items-center justify-center border-4 border-botanical-500">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Viewfinder crosshairs */}
              <div className="absolute inset-8 border border-white/40 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="w-8 h-8 border-t-2 border-l-2 border-botanical-400 absolute top-2 left-2" />
                <div className="w-8 h-8 border-t-2 border-r-2 border-botanical-400 absolute top-2 right-2" />
                <div className="w-8 h-8 border-b-2 border-l-2 border-botanical-400 absolute bottom-2 left-2" />
                <div className="w-8 h-8 border-b-2 border-r-2 border-botanical-400 absolute bottom-2 right-2" />
              </div>

              {!isCameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 text-white p-4 text-center">
                  <Camera className="w-10 h-10 text-botanical-400 mb-2 animate-bounce" />
                  <p className="text-sm font-bold">
                    {isMarathi ? 'कॅमेरा सुरू होत आहे...' : 'Starting camera...'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="forest"
                size="lg"
                onClick={capturePhoto}
                disabled={!isCameraActive}
                leftIcon={<Camera className="w-5 h-5" />}
              >
                <span>{isMarathi ? 'फोटो काढा' : 'Capture Photo'}</span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={stopCamera}
              >
                <span>{isMarathi ? 'रद्द करा' : 'Cancel'}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Upload Mode */}
        {mode === 'upload' && (
          <div className="space-y-4">
            {previewUrl ? (
              <div className="space-y-3">
                <div className="relative max-w-md mx-auto aspect-[4/3] rounded-3xl overflow-hidden border-4 border-botanical-500 shadow-md">
                  <img
                    src={previewUrl}
                    alt="Selected Leaf Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetImage}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isMarathi ? 'दुसरा फोटो निवडा' : 'Choose Different Photo'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 hover:border-botanical-500 bg-surface-subtle hover:bg-forest-50/40 transition-all rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center cursor-pointer text-center group">
                <div className="p-4 bg-white text-forest-800 rounded-2xl group-hover:scale-110 transition-transform mb-3 shadow-sm border border-slate-200">
                  <ImageIcon className="w-10 h-10 text-botanical-600" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {isMarathi ? 'येथे पानाचा फोटो निवडा किंवा टाका' : 'Tap to choose or drag leaf photo'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  JPG, PNG, WEBP (Max 10MB)
                </p>
                <span className="mt-4 px-5 py-2.5 bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold rounded-xl shadow-sm transition">
                  {isMarathi ? 'गॅलरीतून निवडा' : 'Browse Gallery'}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </label>
            )}
          </div>
        )}

        {/* Optional Crop Selection */}
        {farmerCrops.length > 0 && (
          <div className="max-w-md mx-auto pt-1 text-left">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isMarathi ? 'पिक निवडा (पर्यायी)' : 'Select Crop (Optional)'}
            </label>
            <select
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold bg-white focus:ring-2 focus:ring-botanical-500 focus:border-botanical-500 shadow-xs"
            >
              <option value="">{isMarathi ? '-- सर्व पिके --' : '-- All Crops --'}</option>
              {farmerCrops.map((item) => (
                <option key={item.id} value={item.crop_id}>
                  {isMarathi ? item.crop.name_mr : item.crop.name_en} ({item.acres_allocated} {isMarathi ? 'एकर' : 'acres'})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Analysis Progress Indicator */}
        {isLoading && (
          <div className="bg-forest-50/80 border border-botanical-300 p-4 rounded-2xl max-w-md mx-auto text-center space-y-2 animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-forest-900 font-bold text-sm">
              <RefreshCw className="w-5 h-5 animate-spin text-botanical-600" />
              <span>{analysisStep || (isMarathi ? 'विश्लेषण चालू आहे...' : 'Analyzing...')}</span>
            </div>
            <p className="text-xs text-slate-500">
              {isMarathi ? 'कृपया काही सेकंद थांबा, AI रोग व उपचार शोधत आहे.' : 'Please wait a moment while AI diagnoses the crop.'}
            </p>
          </div>
        )}

        {/* Submit Action */}
        <div className="pt-2 flex justify-center">
          <Button
            variant="forest"
            size="lg"
            fullWidth
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading}
            isLoading={isLoading}
            className="max-w-md"
            rightIcon={!isLoading ? <ArrowRight className="w-5 h-5" /> : undefined}
          >
            <span>{isMarathi ? 'रोग निदान करा (Analyze Disease)' : 'Run Diagnosis'}</span>
          </Button>
        </div>

      </Card>
    </div>
  );
};

export default DiseasePage;
