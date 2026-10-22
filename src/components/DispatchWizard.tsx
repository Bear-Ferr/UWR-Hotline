import React, { useState, useEffect } from 'react';
import { evaluateDispatchRouting } from '../services/routingEngine';
import type { RoutingInput, RoutingRecommendation } from '../services/routingEngine';
import { storageService } from '../services/storageService';
import type { RescueReport } from '../services/storageService';
import { OREGON_COUNTIES, COMMON_SPECIES_SUGGESTIONS, getTaxonomicGroupForSpecies } from '../data/uwrData';
import { Phone, PhoneForwarded, AlertTriangle, ShieldAlert, CheckCircle, Info, Clock, MapPin, User, Save, RefreshCw, Navigation, Building } from 'lucide-react';

interface DispatchWizardProps {
  initialSpeciesCategory?: string;
  initialSpeciesName?: string;
  onReportSaved: () => void;
  onNavigateToHistory?: () => void;
}

export const DispatchWizard: React.FC<DispatchWizardProps> = ({
  initialSpeciesCategory,
  initialSpeciesName,
  onReportSaved,
  onNavigateToHistory
}) => {
  // Intake Form State
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [callerLocation, setCallerLocation] = useState('Roseburg');
  const [externalCounty, setExternalCounty] = useState('Lane County (Eugene/Springfield)');
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

  // Infer taxonomic category directly from species name
  const inferredCategory = 
    (specificSpecies && getTaxonomicGroupForSpecies(specificSpecies)) ||
    initialSpeciesCategory ||
    'Passerines & Small Songbirds';

  const lowerSpecies = specificSpecies.trim().toLowerCase();

  // Dynamic species circumstance flags based on entered species
  const isRaccoonSpecies = lowerSpecies.includes('raccoon') || inferredCategory === 'Raccoons';
  const isPigeonOrDoveSpecies = lowerSpecies.includes('pigeon') || lowerSpecies.includes('dove') || inferredCategory === 'Pigeons & Doves';
  const isMarineSpecies = lowerSpecies.includes('seal') || lowerSpecies.includes('sea lion') || lowerSpecies.includes('walrus') || lowerSpecies.includes('marine mammal') || lowerSpecies.includes('otter');
  const isDomesticSpecies = lowerSpecies.includes('cat') || lowerSpecies.includes('dog') || lowerSpecies.includes('chicken') || lowerSpecies.includes('rooster') || lowerSpecies.includes('peacock') || lowerSpecies.includes('parrot') || lowerSpecies.includes('cockatiel') || lowerSpecies.includes('guinea pig') || lowerSpecies.includes('ferret') || lowerSpecies.includes('rock pigeon') || lowerSpecies.includes('exotic');
  const isFawnOrDeerSpecies = lowerSpecies.includes('fawn') || lowerSpecies.includes('deer') || lowerSpecies.includes('elk') || inferredCategory === 'Fawns & Ungulates';

  // Auto-sync flags when species changes
  useEffect(() => {
    setIsSealOrMarine(isMarineSpecies);
    setIsDomesticOrExotic(isDomesticSpecies);
    if (!isPigeonOrDoveSpecies) {
      setIsBandedPigeon(false);
    }
    if (!isRaccoonSpecies) {
      setIsCityRaccoon(false);
    }
  }, [specificSpecies, inferredCategory]);

  // Sync props when pre-filled from Wildlife ID guide
  useEffect(() => {
    if (initialSpeciesName) {
      setSpecificSpecies(initialSpeciesName);
    }
  }, [initialSpeciesName]);

  const routingInput: RoutingInput = {
    category: inferredCategory,
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
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    try {
      const topRehabber = recommendation.recommendedRehabbers[0]?.rehabber;
      const topCarrier = recommendation.recommendedCarriers[0]?.carrier;

      storageService.addReport({
        callerName: callerName || 'Anonymous Caller',
        callerPhone: callerPhone || 'Not provided',
        callerLocation: callerLocation === 'Out of Region / Other County' ? `${externalCounty} (Out of Region)` : callerLocation,
        speciesCategory: inferredCategory,
        specificSpecies: specificSpecies || inferredCategory,
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
      if (onReportSaved) {
        onReportSaved();
      }
    } catch (err) {
      console.error('Save report failed:', err);
      alert('Error saving report: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleReset = () => {
    setCallerName('');
    setCallerPhone('');
    setCallerLocation('Roseburg');
    setExternalCounty('Lane County (Eugene/Springfield)');
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
              type="button"
              onClick={handleReset}
              className="text-xs bg-emerald-800 hover:bg-emerald-700 text-emerald-100 px-2.5 py-1 rounded flex items-center space-x-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <form id="dispatch-intake-form" onSubmit={handleSaveReport} className="p-5 space-y-4 text-sm">
            {/* Caller Information & Location */}
            <div className="bg-emerald-50/50 p-3.5 rounded-lg border border-emerald-100 space-y-3">
              <h3 className="font-semibold text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-700" />
                Caller Information & Location
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Caller Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Smith"
                    value={callerName}
                    onChange={e => setCallerName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="541-555-0123"
                    value={callerPhone}
                    onChange={e => setCallerPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Specific Common Name (Search or Type Any Animal)
                  </label>
                  <input
                    type="text"
                    list="common-species-list"
                    placeholder="e.g. Turkey Vulture, Banded Pigeon, American Robin, Barn Swallow, Bobcat"
                    value={specificSpecies}
                    onChange={e => setSpecificSpecies(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                  />
                  <datalist id="common-species-list">
                    {COMMON_SPECIES_SUGGESTIONS.map(spec => (
                      <option key={spec} value={spec} />
                    ))}
                  </datalist>
                  {specificSpecies && (
                    <p className="mt-1 text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                      <span>✓ Matched Category:</span>
                      <span className="font-bold underline">{inferredCategory}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Age / Growth Stage</label>
                  <select
                    value={ageStage}
                    onChange={e => setAgeStage(e.target.value as RoutingInput['ageStage'])}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-sm"
                  >
                    <option value="Unknown">Unknown / Adult</option>
                    <option value="Naked Baby / Nestling">Naked Baby / Nestling</option>
                    <option value="Feathered Fledgling">Feathered Fledgling</option>
                    <option value="Adult / Older">Adult / Older</option>
                  </select>
                </div>
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

            {/* Dynamic Special Circumstances Section - Only shown when relevant to species */}
            {(isRaccoonSpecies || isPigeonOrDoveSpecies || isMarineSpecies || isDomesticSpecies || isFawnOrDeerSpecies) && (
              <div className="bg-amber-50/80 p-3 rounded-lg border border-amber-200 space-y-2 animate-in fade-in">
                <h3 className="font-semibold text-amber-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-700" />
                  <span>Special Circumstances for {specificSpecies || inferredCategory}</span>
                </h3>

                <div className="space-y-2 text-xs font-medium text-amber-950">
                  {isRaccoonSpecies && (
                    <label className="flex items-center space-x-2 bg-white p-2 rounded border border-amber-300 hover:bg-amber-100/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCityRaccoon}
                        onChange={e => setIsCityRaccoon(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>Originates Inside City Limits (Requires Licensed City Permit Rehabber)</span>
                    </label>
                  )}

                  {isPigeonOrDoveSpecies && (
                    <label className="flex items-center space-x-2 bg-white p-2 rounded border border-amber-300 hover:bg-amber-100/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isBandedPigeon}
                        onChange={e => setIsBandedPigeon(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>Owner Leg Band Present (Banded Racing / Domestic Pigeon)</span>
                    </label>
                  )}

                  {isMarineSpecies && (
                    <div className="flex items-center space-x-2 bg-amber-100 p-2 rounded border border-amber-400 text-amber-950 font-bold">
                      <ShieldAlert className="w-4 h-4 text-amber-800 shrink-0" />
                      <span>Coastal Marine Mammal Call (Auto-flagged for Marine Protocol)</span>
                    </div>
                  )}

                  {isDomesticSpecies && (
                    <div className="flex items-center space-x-2 bg-amber-100 p-2 rounded border border-amber-400 text-amber-950 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0" />
                      <span>Domestic Pet / Exotic Animal (Auto-flagged for Animal Control / Saving Grace)</span>
                    </div>
                  )}

                  {isFawnOrDeerSpecies && (
                    <div className="flex items-center space-x-2 bg-red-100 p-2 rounded border border-red-400 text-red-950 font-bold">
                      <ShieldAlert className="w-4 h-4 text-red-700 shrink-0" />
                      <span>Fawn / Deer / Elk (PROHIBITED — Auto-flagged for ODFW / State Police Referral)</span>
                    </div>
                  )}
                </div>
              </div>
            )}

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

        {/* DISPATCH ACTION BAR: SMS COPY, PRINT TICKET, SAVE REPORT */}
        <div className="bg-white p-4 rounded-xl shadow-md border border-emerald-200 space-y-3">
          {saveSuccess && (
            <div className="bg-emerald-700 text-white p-3 rounded-lg shadow flex flex-col sm:flex-row items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center space-x-2 font-semibold text-xs">
                <CheckCircle className="w-5 h-5 text-amber-300 shrink-0" />
                <span>Rescue report saved to History!</span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    setSaveSuccess(false);
                  }}
                  className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-2.5 py-1 rounded text-xs transition"
                >
                  New Intake Call
                </button>
                {onNavigateToHistory && (
                  <button
                    type="button"
                    onClick={onNavigateToHistory}
                    className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-2.5 py-1 rounded text-xs transition"
                  >
                    View in History
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const topRehabber = recommendation.recommendedRehabbers[0]?.rehabber;
                  const smsText = `[UWR DISPATCH]\nSpecies: ${specificSpecies || inferredCategory}\nLocation: ${callerLocation === 'Out of Region / Other County' ? externalCounty : callerLocation}\nCaller: ${callerName || 'Anonymous'} (${callerPhone || 'No Phone'})\nCondition: ${physicalCondition} (${ageStage})\nAssigned: ${recommendation.isOutOfRegion ? (recommendation.outOfRegionCenter?.facilityName || 'External Center') : (topRehabber?.name ? `${topRehabber.name} (${topRehabber.primaryPhone})` : 'UWR Hotline')}\nNotes: ${notes || 'None'}`;
                  navigator.clipboard.writeText(smsText);
                  alert('📱 SMS Dispatch Script copied to clipboard! You can now paste and text this directly to rehabbers or transport volunteers.');
                }}
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3 py-2.5 rounded-lg text-xs flex items-center justify-center space-x-1.5 shadow transition cursor-pointer"
              >
                <span>📱 Copy SMS Dispatch Text</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="bg-slate-700 hover:bg-slate-800 text-white font-bold px-3 py-2.5 rounded-lg text-xs flex items-center justify-center space-x-1.5 shadow transition cursor-pointer"
              >
                <span>🖨️ Print Intake Ticket</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2 flex-1">
                <label className="text-xs font-bold text-gray-700 shrink-0">Outcome:</label>
                <select
                  value={selectedOutcomeStatus}
                  onChange={e => setSelectedOutcomeStatus(e.target.value as RescueReport['outcomeStatus'])}
                  className="w-full text-xs font-semibold px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Referred to Rehabber">Referred to Rehabber</option>
                  <option value="Referred to Carrier">Referred to Carrier</option>
                  <option value="Referred to ODFW/Police">Referred to ODFW/Police</option>
                  <option value="Resolved - Left in Place">Resolved - Left in Place</option>
                  <option value="Pending">Pending Callback</option>
                </select>
              </div>

              <button
                type="submit"
                form="dispatch-intake-form"
                onClick={handleSaveReport}
                className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-4 py-2.5 rounded-lg text-xs flex items-center justify-center space-x-1.5 shadow-md transition shrink-0 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: ROUTING RECOMMENDATIONS & DECISION ENGINE (7 cols) */}
      <div className="lg:col-span-7 space-y-6">

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
                  According to UWR policy and Oregon state regulations, volunteers cannot take non-native species, fawns, deer, elk, adult raccoons, coyotes, seals, or domestic pets.
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

            {/* EQUAL SPECIAL CONTACTS & REFERRAL OPTIONS */}
            {recommendation.officialReferrals.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-red-950 uppercase tracking-wide">
                  Official Referral Options (Provide All Options Equally to Caller):
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recommendation.officialReferrals.map(contact => (
                    <div key={contact.id} className="bg-red-900 text-white p-3 rounded-xl shadow border border-red-800 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="font-bold text-xs text-amber-300">{contact.name}</div>
                        <div className="text-[11px] text-red-100 mt-0.5 leading-snug">{contact.info}</div>
                      </div>

                      <a
                        href={`tel:${contact.phone}`}
                        className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center justify-center space-x-1.5 shadow transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call {contact.phone}</span>
                      </a>
                    </div>
                  ))}
                </div>
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
                        <span
                          title={rehabber.role.includes('Sub') ? 'Sub-Permittee: Operates legally under a primary licensed rehabilitator permit' : 'Licensed Primary Rehabilitator'}
                          className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium cursor-help border border-emerald-300"
                        >
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

                      <div className="text-xs space-y-1 pt-0.5">
                        <div className="text-gray-700 font-medium">
                          <span className="font-bold text-gray-900">All Specialties: </span>
                          {rehabber.speciesSpecialties.join(', ')}
                        </div>
                        <div className="text-emerald-900 font-semibold text-[11px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                          <span>🎯 Match Reason:</span>
                          <span>{matchReason}</span>
                        </div>
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
      </div>
    </div>
  );
};
