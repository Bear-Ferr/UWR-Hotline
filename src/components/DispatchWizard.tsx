import React, { useState, useEffect } from 'react';
import { evaluateDispatchRouting } from '../services/routingEngine';
import type { RoutingInput, RoutingRecommendation } from '../services/routingEngine';
import { storageService } from '../services/storageService';
import type { RescueReport } from '../services/storageService';
import { OREGON_COUNTIES } from '../data/uwrData';
import { Phone, PhoneForwarded, AlertTriangle, ShieldAlert, CheckCircle, Info, Clock, MapPin, User, Save, RefreshCw, Navigation, Building } from 'lucide-react';

interface DispatchWizardProps {
  initialSpeciesCategory?: string;
  initialSpeciesName?: string;
  onReportSaved: () => void;
}

export const DispatchWizard: React.FC<DispatchWizardProps> = ({
  initialSpeciesCategory,
  initialSpeciesName,
  onReportSaved
}) => {
  // Intake Form State
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [callerLocation, setCallerLocation] = useState('Roseburg');
  const [externalCounty, setExternalCounty] = useState('Lane County (Eugene/Springfield)');
  const [category, setCategory] = useState(initialSpeciesCategory || 'Passerine');
  const [specificSpecies, setSpecificSpecies] = useState(initialSpeciesName || '');
  const [ageStage, setAgeStage] = useState<RoutingInput['ageStage']>('Unknown');
  const [physicalCondition, setPhysicalCondition] = useState<RoutingInput['physicalCondition']>('Injured / Sick / Bleeding');
  
  // Special Circumstance Flags
  const [isCityRaccoon, setIsCityRaccoon] = useState(false);
  const [isBandedPigeon, setIsBandedPigeon] = useState(false);
  const [isSealOrMarine, setIsSealOrMarine] = useState(false);
  const [isDomesticOrExotic, setIsDomesticOrExotic] = useState(false);
  const [notes, setNotes] = useState('');

  // Report Save State
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedOutcomeStatus, setSelectedOutcomeStatus] = useState<RescueReport['outcomeStatus']>('Referred to Rehabber');

  // Sync props when pre-filled from Wildlife ID guide
  useEffect(() => {
    if (initialSpeciesCategory) setCategory(initialSpeciesCategory);
    if (initialSpeciesName) setSpecificSpecies(initialSpeciesName);
  }, [initialSpeciesCategory, initialSpeciesName]);

  const routingInput: RoutingInput = {
    category,
    specificSpecies,
    location: callerLocation,
    externalCounty: callerLocation === 'Out of Region / Other County' ? externalCounty : undefined,
    ageStage,
    physicalCondition,
    isCityRaccoon,
    isBandedPigeon,
    isSealOrMarine,
    isDomesticOrExotic,
    currentHour: new Date().getHours()
  };

  const recommendation: RoutingRecommendation = evaluateDispatchRouting(routingInput);

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    const topRehabber = recommendation.recommendedRehabbers[0]?.rehabber;
    const topCarrier = recommendation.recommendedCarriers[0]?.carrier;

    storageService.addReport({
      callerName: callerName || 'Anonymous Caller',
      callerPhone: callerPhone || 'Not provided',
      callerLocation: callerLocation === 'Out of Region / Other County' ? `${externalCounty} (Out of Region)` : callerLocation,
      speciesCategory: category,
      specificSpecies: specificSpecies || category,
      animalCondition: `${physicalCondition} • Age: ${ageStage}`,
      isCatCaught: physicalCondition === 'Cat Caught / Bite',
      isProhibited: recommendation.isProhibited || recommendation.isOutOfRegion,
      assignedRehabberId: topRehabber?.id,
      assignedRehabberName: recommendation.isOutOfRegion ? recommendation.outOfRegionCenter?.facilityName : topRehabber?.name,
      assignedCarrierName: topCarrier?.name,
      outcomeStatus: recommendation.isOutOfRegion ? 'Referred to ODFW/Police' : (recommendation.isProhibited ? 'Referred to ODFW/Police' : selectedOutcomeStatus),
      notes: notes || 'Call handled via UWR Hotline App.'
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
    onReportSaved();
  };

  const handleReset = () => {
    setCallerName('');
    setCallerPhone('');
    setCallerLocation('Roseburg');
    setExternalCounty('Lane County (Eugene/Springfield)');
    setCategory('Passerine');
    setSpecificSpecies('');
    setAgeStage('Unknown');
    setPhysicalCondition('Injured / Sick / Bleeding');
    setIsCityRaccoon(false);
    setIsBandedPigeon(false);
    setIsSealOrMarine(false);
    setIsDomesticOrExotic(false);
    setNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: CALL INTAKE FORM (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PhoneForwarded className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-lg">Hotline Call Intake Form</h2>
            </div>
            <button
              onClick={handleReset}
              className="text-xs bg-emerald-800 hover:bg-emerald-700 text-emerald-100 px-2.5 py-1 rounded flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <form className="p-5 space-y-4 text-sm">
            {/* Caller Information & Location */}
            <div className="bg-emerald-50/50 p-3.5 rounded-lg border border-emerald-100 space-y-3">
              <h3 className="font-semibold text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-700" />
                Caller Information & Location
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Caller Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Smith"
                    value={callerName}
                    onChange={e => setCallerName(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="541-555-0123"
                    value={callerPhone}
                    onChange={e => setCallerPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  Call Location / City
                </label>
                <select
                  value={callerLocation}
                  onChange={e => setCallerLocation(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                >
                  <option value="Roseburg">Roseburg / North Roseburg</option>
                  <option value="Green">Green / Roseburg</option>
                  <option value="Garden Valley">Garden Valley / Hucrest</option>
                  <option value="Melrose">Melrose / Lookingglass</option>
                  <option value="Myrtle Creek">Myrtle Creek / Canyonville</option>
                  <option value="Winston">Winston / Dillard</option>
                  <option value="Sutherlin">Sutherlin / Oakland</option>
                  <option value="Yoncalla">Yoncalla / Drain</option>
                  <option value="Glide">Glide / Idleyld Park</option>
                  <option value="Umpqua">Umpqua / Calapooia</option>
                  <option value="Camas Valley">Camas Valley / Tenmile</option>
                  <option value="Out of Region / Other County">⚠️ Out of Region / Other Oregon County</option>
                </select>
              </div>

              {/* External County Selector (When Out of Region is picked) */}
              {callerLocation === 'Out of Region / Other County' && (
                <div className="bg-amber-100/70 p-3 rounded-md border border-amber-300 space-y-1 animate-in fade-in">
                  <label className="block text-xs font-bold text-amber-950 flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-amber-700" />
                    Select Caller's Oregon County for Local Referral
                  </label>
                  <select
                    value={externalCounty}
                    onChange={e => setExternalCounty(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-amber-500 bg-white font-semibold text-xs text-amber-950"
                  >
                    {OREGON_COUNTIES.map(county => (
                      <option key={county} value={county}>
                        {county}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Animal Category & Species */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
                Animal & Species Details
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Taxonomic Group</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium text-emerald-900"
                  >
                    <option value="Passerine">Passerines (Songbirds/Crows)</option>
                    <option value="Raptors">Raptors (Hawks/Owls/Eagles)</option>
                    <option value="Herons">Herons & Egrets</option>
                    <option value="Precocials">Precocials (Quail/Ducklings)</option>
                    <option value="Seabirds">Seabirds</option>
                    <option value="Mammals">Mammals (Small/Large)</option>
                    <option value="Fawns/Bears">Fawns & Bear Cubs</option>
                    <option value="Raccoons">Raccoons (Restricted)</option>
                    <option value="Herptiles">Herptiles (Turtles/Snakes)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Age / Growth Stage</label>
                  <select
                    value={ageStage}
                    onChange={e => setAgeStage(e.target.value as RoutingInput['ageStage'])}
                    className="w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Unknown">Unknown / Adult</option>
                    <option value="Naked Baby / Nestling">Naked Baby / Nestling</option>
                    <option value="Feathered Fledgling">Feathered Fledgling</option>
                    <option value="Adult / Older">Adult / Older</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Specific Common Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Robin, Red-Tailed Hawk, Fawn, Squirrel"
                  value={specificSpecies}
                  onChange={e => setSpecificSpecies(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Animal Physical Condition */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-800">
                Animal Physical Condition
              </label>
              <select
                value={physicalCondition}
                onChange={e => setPhysicalCondition(e.target.value as RoutingInput['physicalCondition'])}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium text-xs text-gray-900"
              >
                <option value="Injured / Sick / Bleeding">Injured / Sick / Bleeding</option>
                <option value="Cat Caught / Bite">🚨 Cat Caught / Bite (Pasteurella Antibiotic Risk)</option>
                <option value="Dog Attack">Dog Attack / Crushed</option>
                <option value="Orphaned / Nestling">Orphaned / Naked Nestling</option>
                <option value="Feathered Fledgling">Feathered Fledgling (Hopping on ground)</option>
                <option value="Healthy Trapped in Live Trap">Healthy Trapped in Live Trap (Prohibited Relocation)</option>
              </select>
            </div>

            {/* Special Circumstances / Classification Flags */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2">
              <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
                Special Circumstances / Special Species
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-800">
                <label className="flex items-center space-x-2 bg-white p-2 rounded border hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCityRaccoon}
                    onChange={e => setIsCityRaccoon(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Inside City Limits (Raccoon)</span>
                </label>

                <label className="flex items-center space-x-2 bg-white p-2 rounded border hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBandedPigeon}
                    onChange={e => setIsBandedPigeon(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Banded Pigeon</span>
                </label>

                <label className="flex items-center space-x-2 bg-white p-2 rounded border hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSealOrMarine}
                    onChange={e => setIsSealOrMarine(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Coastal Seal Call</span>
                </label>

                <label className="flex items-center space-x-2 bg-white p-2 rounded border hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDomesticOrExotic}
                    onChange={e => setIsDomesticOrExotic(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Domestic Pet / Exotic</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Hotline Call Notes</label>
              <textarea
                rows={2}
                placeholder="Caller details, situation, injury notes..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: ROUTING RECOMMENDATIONS & DECISION ENGINE (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Save Confirmation Notification */}
        {saveSuccess && (
          <div className="bg-emerald-600 text-white p-3.5 rounded-xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center space-x-2 font-semibold text-sm">
              <CheckCircle className="w-5 h-5 text-amber-300" />
              <span>Rescue report saved successfully to your Volunteer History!</span>
            </div>
          </div>
        )}

        {/* OUT OF REGION / EXTERNAL COUNTY REFERRAL BOX */}
        {recommendation.isOutOfRegion && recommendation.outOfRegionCenter && (
          <div className="bg-amber-50 border-2 border-amber-500 rounded-xl p-5 shadow-md text-amber-950 space-y-4 animate-in fade-in">
            <div className="flex items-start space-x-3">
              <Building className="w-7 h-7 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-amber-950 uppercase tracking-wide">
                  OUT OF WATERSHED REFERRAL ({externalCounty})
                </h3>
                <p className="text-xs font-medium text-amber-900 mt-1">
                  Do not accept out-of-county animals without special rehabber permission. Refer the caller directly to their local regional rehab center or ODFW district office listed below.
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-300 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-2">
                <div>
                  <div className="text-xs text-amber-800 font-semibold uppercase">Recommended Regional Facility:</div>
                  <div className="text-base font-bold text-emerald-950">{recommendation.outOfRegionCenter.facilityName}</div>
                  <div className="text-xs text-gray-600">Location: {recommendation.outOfRegionCenter.city} ({recommendation.outOfRegionCenter.approvedCounties})</div>
                </div>

                <a
                  href={`tel:${recommendation.outOfRegionCenter.phone}`}
                  className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-4 py-2 rounded-lg text-sm flex items-center space-x-1.5 shadow"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {recommendation.outOfRegionCenter.phone}</span>
                </a>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-semibold text-gray-700">ODFW District Office Phone:</span>
                <a href={`tel:${recommendation.outOfRegionCenter.odfwOfficePhone}`} className="font-bold text-emerald-900 hover:underline">
                  {recommendation.outOfRegionCenter.odfwOfficePhone}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* PROHIBITED SPECIES WARNING BANNER */}
        {recommendation.isProhibited && (
          <div className="bg-red-50 border-2 border-red-500 rounded-xl p-5 shadow-md text-red-900 space-y-3">
            <div className="flex items-start space-x-3">
              <ShieldAlert className="w-7 h-7 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-red-950 uppercase tracking-wide">
                  UWR CANNOT REHAB THIS ANIMAL ({recommendation.prohibitedTitle})
                </h3>
                <p className="text-xs font-medium text-red-800 mt-1">
                  According to UWR policy and Oregon state regulations, volunteers cannot take non-native species, adult raccoons, coyotes, seals, domestic pets, or older deer.
                </p>
              </div>
            </div>

            {recommendation.policyWarnings.map(rule => (
              <div key={rule.id} className="bg-white p-3 rounded-lg border border-red-200 text-xs text-gray-800 space-y-1">
                <div className="font-bold text-red-800">{rule.title}</div>
                <div>{rule.description}</div>
                <div className="font-semibold text-emerald-900 pt-1">
                  Required Action: {rule.actionRequired}
                </div>
              </div>
            ))}

            {recommendation.officialReferral && (
              <div className="bg-red-900 text-white p-3.5 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs text-red-200 uppercase font-semibold">Refer Caller Directly To:</div>
                  <div className="font-bold text-sm">{recommendation.officialReferral.name}</div>
                  <div className="text-xs text-red-100">{recommendation.officialReferral.info}</div>
                </div>
                <a
                  href={`tel:${recommendation.officialReferral.phone}`}
                  className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-4 py-2 rounded-lg text-sm flex items-center space-x-1.5 shadow"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {recommendation.officialReferral.phone}</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* CRITICAL ALERTS & CLINICAL WARNINGS */}
        {recommendation.criticalAlerts.map((alert, idx) => (
          <div key={idx} className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm text-amber-950 text-xs font-semibold leading-relaxed flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>{alert}</div>
          </div>
        ))}

        {/* RECOMMENDED REHABBERS (If not prohibited and in watershed) */}
        {!recommendation.isProhibited && !recommendation.isOutOfRegion && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-emerald-800 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                <span>Recommended UWR Rehabilitators ({recommendation.recommendedRehabbers.length})</span>
              </div>
              <span className="text-xs bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded">
                Sorted by Specialty & Hours
              </span>
            </div>

            <div className="p-4 divide-y divide-gray-100">
              {recommendation.recommendedRehabbers.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No specific local UWR rehabber registered for this exact category. Check Regional Referral Centers in Directory.
                </div>
              ) : (
                recommendation.recommendedRehabbers.map(({ rehabber, isOpenNow, matchReason }) => (
                  <div key={rehabber.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900 text-sm">{rehabber.name}</span>
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                          {rehabber.role}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOpenNow ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                          {isOpenNow ? 'OPEN NOW' : 'OFF HOURS'}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-700" />
                          {rehabber.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          {rehabber.hours}
                        </span>
                      </div>

                      <div className="text-xs text-emerald-800 italic font-medium">
                        {matchReason}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                      <a
                        href={`tel:${rehabber.primaryPhone}`}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        <span>Cell: {rehabber.primaryPhone}</span>
                      </a>

                      {rehabber.landlinePhone && (
                        <a
                          href={`tel:${rehabber.landlinePhone}`}
                          className="bg-slate-700 hover:bg-slate-800 text-amber-300 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          <span>Landline (L): {rehabber.landlinePhone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* CALLER ADVICE SCRIPT BOX */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-emerald-950 text-emerald-100 px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center space-x-2">
            <Info className="w-4 h-4 text-amber-400" />
            <span>Instructions to Read to Caller ("Advice for Callers")</span>
          </div>

          <ul className="p-4 space-y-2 text-xs text-gray-700 list-disc list-inside bg-emerald-50/30 font-medium">
            {recommendation.callerAdviceScripts.map((script, idx) => (
              <li key={idx} className="leading-relaxed">
                {script}
              </li>
            ))}
          </ul>
        </div>

        {/* DISPATCH ACTION BAR: SMS COPY, PRINT TICKET, SAVE REPORT */}
        <div className="bg-white p-4 rounded-xl shadow-md border border-emerald-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const topRehabber = recommendation.recommendedRehabbers[0]?.rehabber;
                const smsText = `[UWR DISPATCH]\nSpecies: ${specificSpecies || category}\nLocation: ${callerLocation === 'Out of Region / Other County' ? externalCounty : callerLocation}\nCaller: ${callerName || 'Anonymous'} (${callerPhone || 'No Phone'})\nCondition: ${physicalCondition} (${ageStage})\nAssigned: ${recommendation.isOutOfRegion ? (recommendation.outOfRegionCenter?.facilityName || 'External Center') : (topRehabber?.name ? `${topRehabber.name} (${topRehabber.primaryPhone})` : 'UWR Hotline')}\nNotes: ${notes || 'None'}`;
                navigator.clipboard.writeText(smsText);
                alert('📱 SMS Dispatch Script copied to clipboard! You can now paste and text this directly to rehabbers or transport volunteers.');
              }}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center space-x-1.5 shadow transition"
            >
              <span>📱 Copy SMS Dispatch Text</span>
            </button>

            <button
              onClick={() => {
                window.print();
              }}
              className="bg-slate-700 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center space-x-1.5 shadow transition"
            >
              <span>🖨️ Print Intake Ticket</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <label className="text-xs font-bold text-gray-700">Outcome:</label>
            <select
              value={selectedOutcomeStatus}
              onChange={e => setSelectedOutcomeStatus(e.target.value as RescueReport['outcomeStatus'])}
              className="text-xs font-semibold px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="Referred to Rehabber">Referred to Rehabber</option>
              <option value="Referred to Carrier">Referred to Carrier</option>
              <option value="Referred to ODFW/Police">Referred to ODFW/Police</option>
              <option value="Resolved - Left in Place">Resolved - Left in Place</option>
              <option value="Pending">Pending Callback</option>
            </select>

            <button
              onClick={handleSaveReport}
              className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-1.5 shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
