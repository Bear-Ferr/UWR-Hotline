import React, { useState } from 'react';
import { Camera, Upload, Sparkles, CheckCircle2, AlertTriangle, Key, X, RefreshCw, ArrowRight, ShieldAlert, FileSearch, ExternalLink } from 'lucide-react';
import { analyzeWildlifeImage } from '../services/aiVisionService';
import type { AIVisionDiagnosis } from '../services/aiVisionService';

interface AIPhotoIdentifierProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToDispatch?: (diagnosis: {
    speciesName: string;
    category: string;
    ageStage: string;
    physicalCondition: string;
    isProhibited: boolean;
  }) => void;
}

export const AIPhotoIdentifier: React.FC<AIPhotoIdentifierProps> = ({
  isOpen,
  onClose,
  onApplyToDispatch
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('uwr_gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(!localStorage.getItem('uwr_gemini_api_key'));
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<AIVisionDiagnosis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveApiKey = (key: string) => {
    const trimmed = key.trim();
    setApiKey(trimmed);
    localStorage.setItem('uwr_gemini_api_key', trimmed);
    setShowKeyInput(false);
    setErrorMsg(null);
  };

  const handleImageUpload = (file: File) => {
    setErrorMsg(null);
    setDiagnosis(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSelectedImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const result = await analyzeWildlifeImage(selectedImage, apiKey);
      setDiagnosis(result);
    } catch (err: any) {
      const msg = err.message || String(err);
      if (msg === 'MISSING_API_KEY' || msg === 'KEY_EXPIRED_OR_INVALID' || msg === 'GCP_API_DISABLED') {
        setShowKeyInput(true);
        if (msg === 'KEY_EXPIRED_OR_INVALID') {
          setErrorMsg('The current access key expired or is invalid. Please generate a free, non-expiring API key from Google AI Studio and paste it below.');
        } else if (msg === 'GCP_API_DISABLED') {
          setErrorMsg('The Gemini API service is disabled on this GCP project. Please generate a free standalone key from Google AI Studio.');
        } else {
          setErrorMsg('Please enter a Google Gemini API Key below to run live AI photo identification.');
        }
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApply = () => {
    if (!diagnosis || !onApplyToDispatch) return;
    onApplyToDispatch({
      speciesName: diagnosis.speciesName,
      category: diagnosis.category,
      ageStage: diagnosis.ageStage,
      physicalCondition: diagnosis.physicalCondition,
      isProhibited: diagnosis.isProhibited
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-emerald-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-emerald-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-amber-500 text-emerald-950 p-1.5 rounded-lg shadow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg flex items-center gap-2">
                AI Visual Wildlife Identifier
                <span className="text-[10px] bg-emerald-800 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-700">
                  Gemini 1.5 Vision
                </span>
              </h2>
              <p className="text-xs text-emerald-200">
                Upload or capture a photo to identify species, age, & condition
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-sm">
          {/* API Key Banner / Settings */}
          {showKeyInput ? (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-3 animate-in fade-in">
              <div className="flex items-start space-x-2 text-amber-950">
                <Key className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-sm text-amber-950">Enter Google Gemini API Key</div>
                  <div>
                    Get a free, non-expiring API key from Google AI Studio. Stored securely in your browser so you only enter it once!
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  className="flex-1 px-3 py-1.5 border rounded-lg text-xs font-mono focus:ring-2 focus:ring-amber-500 bg-white"
                />
                <button
                  onClick={() => handleSaveApiKey(apiKey)}
                  className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-3.5 py-1.5 rounded-lg text-xs shadow"
                >
                  Save Key
                </button>
              </div>

              <div className="border-t border-amber-200 pt-2 flex items-center justify-between text-[11px]">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-900 hover:underline flex items-center gap-1"
                >
                  <span>Get Free Key at Google AI Studio &rarr;</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                AI Engine: <strong className="text-emerald-900">Gemini 1.5 Flash Vision</strong>
              </span>
              <button
                onClick={() => setShowKeyInput(true)}
                className="text-emerald-800 font-semibold hover:underline text-[11px]"
              >
                Key Settings
              </button>
            </div>
          )}

          {/* Photo Dropzone / Camera Capture */}
          {!selectedImage ? (
            <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-6 sm:p-8 text-center bg-emerald-50/40 transition flex flex-col items-center justify-center space-y-3">
              <div className="bg-emerald-100 text-emerald-800 p-3 rounded-full shadow-inner">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Upload or Capture Wildlife Photo</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Drag and drop a clear photo of the bird, mammal, or reptile sent by caller
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <label className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 cursor-pointer shadow transition">
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                    className="hidden"
                  />
                </label>

                <label className="bg-slate-700 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 cursor-pointer shadow transition">
                  <Camera className="w-4 h-4" />
                  <span>Take Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Photo Preview & Action Bar */}
              <div className="relative bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center max-h-64">
                <img
                  src={selectedImage}
                  alt="Wildlife Preview"
                  className="max-h-64 object-contain"
                />

                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setDiagnosis(null);
                    setErrorMsg(null);
                  }}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-full shadow transition"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {!diagnosis && !isAnalyzing && (
                <button
                  onClick={handleAnalyze}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-3 rounded-xl shadow-md text-sm flex items-center justify-center space-x-2 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Diagnose & Identify Photo with AI</span>
                </button>
              )}
            </div>
          )}

          {/* Loading Spinner */}
          {isAnalyzing && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3 animate-pulse">
              <Sparkles className="w-8 h-8 text-amber-500 mx-auto animate-spin" />
              <div className="font-bold text-emerald-950 text-sm">
                Analyzing photo with Gemini 1.5 Flash Vision AI...
              </div>
              <div className="text-xs text-emerald-800">
                Evaluating beak morphology, plumage/fur texture, species taxonomy, and age indicators...
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-red-950 text-xs font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* AI Diagnosis Result View */}
          {diagnosis && (
            <div className="space-y-4 animate-in fade-in">
              {/* Top Banner: Species & Native Flag */}
              <div className={`p-4 rounded-xl shadow border flex items-start justify-between gap-3 ${
                diagnosis.isProhibited ? 'bg-red-50 border-red-300 text-red-950' : 'bg-emerald-50 border-emerald-300 text-emerald-950'
              }`}>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Identified Wildlife Species:
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {diagnosis.speciesName}
                    {diagnosis.scientificName && (
                      <span className="text-xs font-normal text-gray-500 italic">({diagnosis.scientificName})</span>
                    )}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <span className="bg-emerald-800 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      Category: {diagnosis.category}
                    </span>
                    <span className="bg-amber-500 text-emerald-950 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      Stage: {diagnosis.ageStage}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      diagnosis.isProhibited ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {diagnosis.isProhibited ? '⚠️ STATE PROHIBITED / SPECIAL' : '✅ NATIVE REHABBABLE'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Confidence</div>
                  <div className="text-sm font-extrabold text-emerald-800">
                    {Math.round(diagnosis.confidenceScore * 100)}%
                  </div>
                </div>
              </div>

              {/* Visual Observations */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                <div className="font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileSearch className="w-4 h-4 text-emerald-700" />
                  AI Visual Diagnostic Indicators:
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-700 font-medium">
                  {diagnosis.visualObservations.map((obs, idx) => (
                    <li key={idx}>{obs}</li>
                  ))}
                </ul>
              </div>

              {/* Recommended Action */}
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl text-amber-950 text-xs space-y-1">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Recommended Action for Dispatcher:
                </div>
                <div className="font-medium text-gray-800 leading-relaxed">
                  {diagnosis.recommendedAction}
                </div>
              </div>

              {/* Auto-Fill Button */}
              {onApplyToDispatch && (
                <button
                  onClick={handleApply}
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 rounded-xl shadow-lg text-sm flex items-center justify-center space-x-2 transition"
                >
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  <span>Auto-Fill Hotline Dispatch Form with AI Diagnosis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
