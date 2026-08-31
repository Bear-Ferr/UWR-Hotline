import React, { useState } from 'react';
import { WILDLIFE_SPECIES_CATALOG } from '../data/wildlifeGuideData';
import { WildlifeAvatar } from './WildlifeAvatar';
import { Search, Eye, AlertTriangle, ArrowRight } from 'lucide-react';

interface WildlifeGuideProps {
  onSelectSpeciesForDispatch: (category: string, speciesName: string) => void;
}

export const WildlifeGuide: React.FC<WildlifeGuideProps> = ({ onSelectSpeciesForDispatch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Passerine', 'Raptor', 'Heron', 'Precocial', 'Fawns/Bears', 'Mammal (Prohibited)'];

  const filteredSpecies = WILDLIFE_SPECIES_CATALOG.filter(species => {
    const matchesCategory = selectedCategory === 'All' || species.category.toLowerCase().includes(selectedCategory.toLowerCase());

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      species.commonName.toLowerCase().includes(term) ||
      species.scientificName.toLowerCase().includes(term) ||
      species.description.toLowerCase().includes(term) ||
      species.appearance.size.toLowerCase().includes(term) ||
      species.appearance.colors.some(c => c.toLowerCase().includes(term)) ||
      species.appearance.keyFeatures.some(f => f.toLowerCase().includes(term)) ||
      species.appearance.beakOrMouth.toLowerCase().includes(term);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-emerald-900 text-white p-5 rounded-xl shadow-md border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Eye className="w-6 h-6 text-amber-400" />
            Umpqua Wildlife Identification Guide
          </h2>
          <p className="text-xs text-emerald-200 mt-1">
            Search common species found in the Umpqua Watershed by common name, visual appearance, beak type, or colors.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-emerald-950 font-bold shadow'
                  : 'bg-emerald-800 text-emerald-200 hover:bg-emerald-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-xl mx-auto">
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3" />
        <input
          type="text"
          placeholder="Search by name, color ('red breast', 'heart face'), size, or beak..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 border rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      {/* Species Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSpecies.map(species => (
          <div key={species.id} className="bg-white rounded-xl shadow-md border overflow-hidden hover:shadow-lg transition flex flex-col justify-between">
            <div>
              {/* Species Vector Avatar & Category Overlay */}
              <div className="relative h-48 bg-slate-900 overflow-hidden">
                <WildlifeAvatar
                  speciesId={species.id}
                  category={species.category}
                  commonName={species.commonName}
                />
                <span className="absolute top-3 left-3 bg-emerald-950/90 backdrop-blur-md text-amber-300 font-bold text-xs px-2.5 py-1 rounded-md shadow border border-emerald-800">
                  {species.category}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{species.commonName}</h3>
                  <div className="text-xs text-gray-500 italic">{species.scientificName}</div>
                </div>

                {/* Appearance Specs */}
                <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-100 text-xs space-y-1.5 text-gray-700">
                  <div>
                    <span className="font-bold text-emerald-900">Size & Beak:</span> {species.appearance.size} • {species.appearance.beakOrMouth}
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {species.appearance.colors.map((color, idx) => (
                      <span key={idx} className="bg-white px-2 py-0.5 rounded border border-emerald-200 text-[11px] font-medium text-emerald-900">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {species.description}
                </p>

                {/* Baby vs Adult Notes */}
                <div className="bg-amber-50/80 p-3 rounded-lg border border-amber-200 text-xs text-amber-950 space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Baby vs. Adult / Fledgling Notes:
                  </div>
                  <div className="leading-snug">{species.babyVsAdultNotes}</div>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-800">
                Common in Umpqua Watershed
              </span>

              <button
                onClick={() => onSelectSpeciesForDispatch(species.dispatchCategory, species.commonName)}
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow transition"
              >
                <span>Dispatch Intake</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
