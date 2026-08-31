import React from 'react';

interface WildlifeAvatarProps {
  speciesId: string;
  category: string;
  commonName: string;
}

export const WildlifeAvatar: React.FC<WildlifeAvatarProps> = ({ speciesId, commonName }) => {
  switch (speciesId) {
    case 'crow-raven':
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#0f172a" />
          <circle cx="210" cy="50" r="35" fill="#1e293b" />
          {/* Crow Silhouette & Beak */}
          <path d="M70 120 C 90 80, 140 60, 180 70 C 210 75, 230 100, 220 130 C 200 160, 100 170, 70 120 Z" fill="#020617" />
          <path d="M180 70 L 250 85 L 185 95 Z" fill="#020617" /> {/* Beak */}
          <circle cx="170" cy="75" r="4" fill="#38bdf8" /> {/* Eye */}
          <text x="15" y="160" fill="#94a3b8" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Corvus (Crow / Raven)</text>
        </svg>
      );

    case 'robin':
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#1e1b4b" />
          {/* Grey Back & Head */}
          <path d="M80 130 C 90 70, 150 50, 190 70 C 220 85, 230 120, 200 150 Z" fill="#475569" />
          {/* Bright Orange Breast */}
          <path d="M120 110 C 130 90, 180 90, 190 120 C 185 150, 140 155, 120 110 Z" fill="#ea580c" />
          {/* Yellow Bill */}
          <path d="M190 70 L 230 75 L 195 82 Z" fill="#facc15" />
          <circle cx="175" cy="72" r="3" fill="#ffffff" />
          <circle cx="175" cy="72" r="1.5" fill="#000000" />
          <text x="15" y="160" fill="#cbd5e1" fontSize="12" fontWeight="bold" fontFamily="sans-serif">American Robin (Red Breast)</text>
        </svg>
      );

    case 'stellers-jay':
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#0c4a6e" />
          {/* Black Crest & Head */}
          <path d="M140 30 L 165 70 L 120 70 Z" fill="#0f172a" />
          <path d="M100 130 C 110 70, 160 60, 190 80 C 220 100, 210 150, 150 160 Z" fill="#0284c7" />
          <path d="M120 70 C 140 60, 180 60, 185 90 L 130 100 Z" fill="#0f172a" />
          <path d="M180 75 L 225 82 L 182 88 Z" fill="#0f172a" />
          <circle cx="165" cy="75" r="3" fill="#38bdf8" />
          <text x="15" y="160" fill="#bae6fd" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Steller's Jay (Blue & Crest)</text>
        </svg>
      );

    case 'anna-hummingbird':
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#064e3b" />
          {/* Green Body */}
          <path d="M100 120 C 110 80, 160 70, 180 85 C 200 100, 190 140, 130 145 Z" fill="#15803d" />
          {/* Magenta Crown */}
          <path d="M160 75 C 165 65, 185 65, 185 85 Z" fill="#ec4899" />
          {/* Needle Beak */}
          <path d="M185 80 L 260 88 L 185 83 Z" fill="#020617" />
          <circle cx="175" cy="78" r="2.5" fill="#ffffff" />
          <text x="15" y="160" fill="#a7f3d0" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Anna's Hummingbird (Needle Bill)</text>
        </svg>
      );

    case 'starling':
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#450a0a" />
          {/* Iridescent Dark Body */}
          <path d="M90 120 C 100 70, 150 60, 180 75 C 210 90, 200 140, 140 150 Z" fill="#1e1b4b" />
          {/* Yellow Bill */}
          <path d="M180 75 L 225 78 L 182 85 Z" fill="#facc15" />
          {/* Speckles */}
          <circle cx="120" cy="110" r="2" fill="#f8fafc" />
          <circle cx="140" cy="125" r="2" fill="#f8fafc" />
          <circle cx="160" cy="100" r="2" fill="#f8fafc" />
          <text x="15" y="160" fill="#fca5a5" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Starling (PROHIBITED NON-NATIVE)</text>
        </svg>
      );

    case 'house-sparrow':
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#450a0a" />
          <path d="M90 120 C 100 70, 150 60, 180 75 C 200 90, 190 140, 130 145 Z" fill="#78350f" />
          {/* Black Bib */}
          <path d="M155 85 C 165 85, 175 95, 165 110 Z" fill="#0f172a" />
          <path d="M180 75 L 210 80 L 182 85 Z" fill="#1e293b" />
          <text x="15" y="160" fill="#fca5a5" fontSize="12" fontWeight="bold" fontFamily="sans-serif">House Sparrow (PROHIBITED)</text>
        </svg>
      );

    case 'red-tailed-hawk':
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#451a03" />
          {/* Body */}
          <path d="M80 130 C 90 60, 150 40, 190 60 C 220 80, 210 140, 140 150 Z" fill="#78350f" />
          {/* Red Tail */}
          <path d="M80 130 L 40 160 L 95 150 Z" fill="#ea580c" />
          {/* Hooked Beak */}
          <path d="M190 60 L 230 75 L 210 85 L 192 72 Z" fill="#facc15" />
          <path d="M215 70 L 230 75 L 210 85 Z" fill="#0f172a" />
          <circle cx="175" cy="62" r="4" fill="#fef08a" />
          <circle cx="175" cy="62" r="2" fill="#000000" />
          <text x="15" y="160" fill="#fed7aa" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Red-Tailed Hawk (Hooked Beak & Red Tail)</text>
        </svg>
      );

    case 'barn-owl':
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#312e81" />
          {/* Golden Body */}
          <path d="M100 130 C 110 70, 150 50, 180 70 C 210 90, 200 140, 140 150 Z" fill="#d97706" />
          {/* Heart Face */}
          <path d="M160 60 C 145 40, 125 60, 150 85 C 175 85, 195 60, 180 40 Z" fill="#ffffff" />
          <path d="M150 65 L 155 75 L 148 75 Z" fill="#d97706" />
          <circle cx="140" cy="58" r="3.5" fill="#0f172a" />
          <circle cx="160" cy="58" r="3.5" fill="#0f172a" />
          <text x="15" y="160" fill="#c7d2fe" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Barn Owl (Heart Face Disc)</text>
        </svg>
      );

    case 'great-horned-owl':
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#1c1917" />
          {/* Horn Tufts */}
          <path d="M130 30 L 145 60 L 120 60 Z" fill="#44403c" />
          <path d="M180 30 L 190 60 L 165 60 Z" fill="#44403c" />
          {/* Body */}
          <path d="M90 130 C 100 60, 150 50, 190 70 C 210 90, 200 140, 140 150 Z" fill="#78350f" />
          {/* Yellow Eyes */}
          <circle cx="142" cy="65" r="6" fill="#facc15" />
          <circle cx="142" cy="65" r="3" fill="#000000" />
          <circle cx="168" cy="65" r="6" fill="#facc15" />
          <circle cx="168" cy="65" r="3" fill="#000000" />
          <text x="15" y="160" fill="#e7e5e4" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Great Horned Owl (Ear Tufts & Yellow Eyes)</text>
        </svg>
      );

    case 'bald-eagle':
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#020617" />
          {/* Dark Body */}
          <path d="M70 130 C 80 80, 130 70, 160 85 C 190 100, 180 150, 120 160 Z" fill="#1e1b4b" />
          {/* Snow White Head */}
          <path d="M140 85 C 145 45, 190 45, 200 75 C 195 95, 160 100, 140 85 Z" fill="#ffffff" />
          {/* Massive Yellow Beak */}
          <path d="M195 62 L 245 72 L 205 85 L 195 70 Z" fill="#facc15" />
          <circle cx="180" cy="62" r="3.5" fill="#facc15" />
          <circle cx="180" cy="62" r="1.5" fill="#000000" />
          <text x="15" y="160" fill="#e2e8f0" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Bald Eagle (White Head & Massive Yellow Beak)</text>
        </svg>
      );

    case 'great-blue-heron':
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#0f172a" />
          {/* Long S-Neck */}
          <path d="M100 160 C 130 120, 110 80, 150 50 C 170 40, 185 50, 180 65 L 160 70 C 140 85, 150 120, 120 160 Z" fill="#475569" />
          {/* Dagger Yellow Beak */}
          <path d="M180 52 L 260 55 L 182 62 Z" fill="#facc15" />
          {/* Black Crest Plume */}
          <path d="M160 42 L 130 30 L 155 48 Z" fill="#020617" />
          <circle cx="170" cy="50" r="2.5" fill="#facc15" />
          <text x="15" y="160" fill="#cbd5e1" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Great Blue Heron (Dagger Spearing Beak)</text>
        </svg>
      );

    case 'mallard-duckling':
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#065f46" />
          {/* Fluffy Yellow/Brown Body */}
          <path d="M90 130 C 100 80, 150 70, 180 85 C 200 100, 190 145, 130 150 Z" fill="#facc15" />
          {/* Eye Stripe */}
          <path d="M160 75 L 195 80" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
          {/* Duck Bill */}
          <path d="M180 82 L 220 86 L 182 92 Z" fill="#f97316" />
          <circle cx="172" cy="78" r="3" fill="#000000" />
          <text x="15" y="160" fill="#a7f3d0" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Mallard Duckling (KEEP DRY!)</text>
        </svg>
      );

    case 'california-quail':
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#14532d" />
          {/* Topknot Plume */}
          <path d="M170 50 Q 185 20 200 35 Q 180 40 168 55 Z" fill="#020617" />
          {/* Body */}
          <path d="M90 130 C 100 80, 140 70, 170 85 C 190 100, 180 145, 120 150 Z" fill="#64748b" />
          <path d="M170 80 L 195 85 L 172 90 Z" fill="#0f172a" />
          <text x="15" y="160" fill="#bbf7d0" fontSize="12" fontWeight="bold" fontFamily="sans-serif">California Quail (Topknot Plume)</text>
        </svg>
      );

    case 'black-tailed-deer-fawn':
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#78350f" />
          {/* Fawn Coat */}
          <path d="M70 130 C 80 80, 140 70, 180 85 C 210 100, 200 150, 120 160 Z" fill="#b45309" />
          {/* Spots */}
          <circle cx="110" cy="110" r="3.5" fill="#ffffff" />
          <circle cx="130" cy="100" r="3.5" fill="#ffffff" />
          <circle cx="150" cy="115" r="3.5" fill="#ffffff" />
          <circle cx="125" cy="125" r="3.5" fill="#ffffff" />
          <circle cx="160" cy="130" r="3.5" fill="#ffffff" />
          {/* Large Ears */}
          <path d="M175 75 Q 190 40 195 65 Z" fill="#78350f" />
          <text x="15" y="160" fill="#fef3c7" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Fawn (White Spotted Coat)</text>
        </svg>
      );

    case 'raccoon-baby':
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#1e293b" />
          {/* Ringed Tail */}
          <path d="M60 130 L 20 150" stroke="#0f172a" strokeWidth="16" strokeLinecap="round" />
          <path d="M50 135 L 40 142" stroke="#ffffff" strokeWidth="16" />
          {/* Body */}
          <path d="M80 130 C 90 80, 140 70, 170 85 C 200 100, 190 145, 120 150 Z" fill="#475569" />
          {/* Mask */}
          <path d="M150 80 L 195 80 L 185 95 L 140 95 Z" fill="#020617" />
          <circle cx="160" cy="87" r="2.5" fill="#ffffff" />
          <circle cx="180" cy="87" r="2.5" fill="#ffffff" />
          <text x="15" y="160" fill="#e2e8f0" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Raccoon (Black Eye Mask & Ringed Tail)</text>
        </svg>
      );

    case 'bobcat':
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#713f12" />
          {/* Spotted Coat */}
          <path d="M80 130 C 90 80, 140 70, 170 85 C 200 100, 190 145, 120 150 Z" fill="#a16207" />
          {/* Ear Tufts */}
          <path d="M165 60 L 172 40 L 175 60 Z" fill="#020617" />
          <text x="15" y="160" fill="#fef08a" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Bobcat (Tufted Ears & Spotted Fur)</text>
        </svg>
      );

    case 'beaver':
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#451a03" />
          {/* Flat Paddle Tail */}
          <ellipse cx="60" cy="140" rx="30" ry="12" fill="#1c1917" />
          {/* Dark Body */}
          <path d="M90 130 C 100 80, 140 70, 170 85 C 200 100, 190 145, 120 150 Z" fill="#78350f" />
          {/* Orange Teeth */}
          <rect x="185" y="90" width="4" height="8" fill="#ea580c" />
          <rect x="190" y="90" width="4" height="8" fill="#ea580c" />
          <text x="15" y="160" fill="#fed7aa" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Beaver (Flat Tail & Orange Teeth)</text>
        </svg>
      );

    case 'opossum':
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#450a0a" />
          {/* Grey Body */}
          <path d="M80 130 C 90 80, 140 70, 170 85 C 200 100, 190 145, 120 150 Z" fill="#94a3b8" />
          {/* White Face & Pink Snout */}
          <path d="M160 80 L 210 88 L 170 100 Z" fill="#f8fafc" />
          <circle cx="210" cy="88" r="4" fill="#f43f5e" />
          <text x="15" y="160" fill="#fca5a5" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Opossum (PROHIBITED NON-NATIVE)</text>
        </svg>
      );

    case 'nutria':
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#450a0a" />
          <path d="M80 130 C 90 80, 140 70, 170 85 C 200 100, 190 145, 120 150 Z" fill="#78350f" />
          <rect x="195" y="88" width="5" height="9" fill="#ea580c" />
          <text x="15" y="160" fill="#fca5a5" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Nutria (PROHIBITED NON-NATIVE)</text>
        </svg>
      );

    case 'western-pond-turtle':
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#064e3b" />
          {/* Olive Shell */}
          <ellipse cx="140" cy="110" rx="55" ry="35" fill="#3f6212" />
          <ellipse cx="140" cy="110" rx="45" ry="28" stroke="#facc15" strokeWidth="2" fill="none" />
          {/* Head */}
          <circle cx="205" cy="110" r="12" fill="#15803d" />
          <circle cx="208" cy="107" r="2" fill="#facc15" />
          <text x="15" y="160" fill="#a7f3d0" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Western Pond Turtle (Native Turtle)</text>
        </svg>
      );

    case 'garter-snake':
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#14532d" />
          <path d="M50 140 Q 100 80 150 130 T 250 90" stroke="#15803d" strokeWidth="18" strokeLinecap="round" fill="none" />
          <path d="M50 140 Q 100 80 150 130 T 250 90" stroke="#facc15" strokeWidth="4" strokeLinecap="round" fill="none" />
          <text x="15" y="160" fill="#bbf7d0" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Garter Snake (Yellow Longitudinal Stripes)</text>
        </svg>
      );

    default:
      return (
        <svg className="w-full h-full" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="180" fill="#064e3b" />
          <circle cx="150" cy="80" r="40" fill="#047857" />
          <text x="150" y="140" fill="#ffffff" textAnchor="middle" fontSize="14" fontWeight="bold">{commonName}</text>
        </svg>
      );
  }
};
