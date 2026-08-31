import React, { useState } from 'react';
import { PROHIBITED_SPECIES_RULES } from '../data/uwrData';
import { ShieldAlert, BookOpen, Info, HeartHandshake, Search } from 'lucide-react';

export const KnowledgeBase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-emerald-900 text-white p-5 rounded-xl shadow-md border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            UWR Policy Manual & Knowledge Base
          </h2>
          <p className="text-xs text-emerald-200 mt-1">
            Complete reference guide transcribed directly from the official UWR Hotline Manual.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-emerald-300 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search manual policies..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-emerald-700 bg-emerald-950 text-white placeholder-emerald-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of Policy Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: UWR DOES NOT TAKE... */}
        <div className="bg-white rounded-xl shadow-md border border-red-200 overflow-hidden">
          <div className="bg-red-900 text-white p-4 font-bold text-base flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-300" />
            <span>UWR Does NOT Take... (Prohibited Rules)</span>
          </div>

          <div className="p-5 space-y-3 text-xs text-gray-800">
            {PROHIBITED_SPECIES_RULES.map(rule => (
              <div key={rule.id} className="p-3 bg-red-50/60 rounded-lg border border-red-100 space-y-1">
                <div className="font-bold text-red-900 text-sm">{rule.title}</div>
                <div className="text-gray-700 leading-relaxed">{rule.description}</div>
                <div className="font-semibold text-emerald-900 pt-1">
                  Required Action: {rule.actionRequired}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module 2: COMMON CALLS GUIDANCE */}
        <div className="bg-white rounded-xl shadow-md border border-emerald-200 overflow-hidden">
          <div className="bg-emerald-900 text-white p-4 font-bold text-base flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>Common Calls Protocol</span>
          </div>

          <div className="p-5 space-y-4 text-xs text-gray-800">
            <div className="bg-emerald-50/70 p-3.5 rounded-lg border border-emerald-100 space-y-1">
              <div className="font-bold text-emerald-950 text-sm">I Found a Baby Bird (Fledgling vs. Nestling)</div>
              <p className="leading-relaxed">
                If naked/unfeathered = Needs to come in. If feathered and hopping on the ground = <strong>Fledgling</strong>. Fledglings jump out before flying. Parents feed them on the ground. Leave alone unless outdoor cats are near or tail is over 2" long and damaged.
              </p>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-lg border border-amber-200 space-y-1">
              <div className="font-bold text-amber-950 text-sm">My Cat Caught an Animal (Cat Bite Protocol)</div>
              <p className="leading-relaxed font-medium text-amber-950">
                CRITICAL: Cats carry <em>Pasteurella</em> bacteria on teeth and claws. Puncture wounds inject bacteria into bloodstreams. Animals WILL DIE without antibiotics from a rehabber, even if active and fine!
              </p>
            </div>

            <div className="bg-emerald-50/70 p-3.5 rounded-lg border border-emerald-100 space-y-1">
              <div className="font-bold text-emerald-950 text-sm">Baby Duck or Goose (Dry Rule)</div>
              <p className="leading-relaxed">
                Baby ducks/geese CANNOT be given access to water or sinks! They lack waterproof oil and will get wet to skin, become chilled, and die. Keep dry and warm!
              </p>
            </div>

            <div className="bg-emerald-50/70 p-3.5 rounded-lg border border-emerald-100 space-y-1">
              <div className="font-bold text-emerald-950 text-sm">Banded Pigeons</div>
              <p className="leading-relaxed">
                Pigeons with leg bands belong to private owners/racers. Call the Banded Pigeon Hotline at 1-800-755-2778.
              </p>
            </div>
          </div>
        </div>

        {/* Module 3: ADVICE FOR CALLERS (Container & Care) */}
        <div className="bg-white rounded-xl shadow-md border border-emerald-200 overflow-hidden">
          <div className="bg-emerald-800 text-white p-4 font-bold text-base flex items-center space-x-2">
            <Info className="w-5 h-5 text-amber-400" />
            <span>Advice for Callers (Container & Care Rules)</span>
          </div>

          <ul className="p-5 space-y-3 text-xs text-gray-800 list-disc list-inside leading-relaxed">
            <li><strong>Prepare Container:</strong> Paper bag or cardboard box with soft cloth bottom. Tape box shut or roll bag top. Write name, phone, & exact find location.</li>
            <li><strong>Protect Yourself:</strong> Wear gloves. Do not attempt capture if afraid.</li>
            <li><strong>Providing Warmth:</strong> Sealed warm water bottle wrapped in cloth, or rice sock warmed in microwave. Heating pad on LOW under HALF of box.</li>
            <li><strong>Keep Quiet:</strong> Safe dark space away from children, pets, and household noise.</li>
            <li><strong>FOOD & WATER RULE:</strong> Animals fine overnight WITHOUT food/water. <strong>EXCEPT Hummingbirds:</strong> Mix 1/4 tsp sugar in 1 tsp water, let dip beak tip.</li>
          </ul>
        </div>

        {/* Module 4: HANDS OFF & MEDIA RESTRICTIONS */}
        <div className="bg-white rounded-xl shadow-md border border-emerald-200 overflow-hidden">
          <div className="bg-emerald-950 text-white p-4 font-bold text-base flex items-center space-x-2">
            <HeartHandshake className="w-5 h-5 text-amber-400" />
            <span>Hands Off & Media Protocols</span>
          </div>

          <div className="p-5 space-y-4 text-xs text-gray-800">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-1">
              <div className="font-bold text-amber-900 text-sm">HANDS OFF! (Wild Animal Stress)</div>
              <p className="leading-relaxed">
                Wild animals are NOT comforted by human petting or holding! To a wild animal, human holding simulates predator capture and can cause fatal shock.
              </p>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 space-y-1">
              <div className="font-bold text-emerald-900 text-sm">The Myth of Human Touch</div>
              <p className="leading-relaxed">
                It is NOT TRUE that parents reject baby animals if touched by humans. Parents accept baby birds and mammals back readily.
              </p>
            </div>

            <div className="p-3 bg-red-50 rounded-lg border border-red-200 space-y-1">
              <div className="font-bold text-red-900 text-sm">Don't Put Rescues on News or Social Media!</div>
              <p className="leading-relaxed">
                To keep on good terms with ODFW, keep rehab cases off all media (social and public news). Permission required before posting anything.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
