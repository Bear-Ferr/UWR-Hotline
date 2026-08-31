import { REHABBERS, CRITTER_CARRIERS, OFFICIAL_CONTACTS, REFERRAL_CENTERS, PROHIBITED_SPECIES_RULES } from '../data/uwrData';
import type { Rehabber, CritterCarrier, OfficialContact, ReferralCenter, PolicyRule } from '../data/uwrData';

export interface RoutingInput {
  category: string;
  specificSpecies?: string;
  location: string;             // 'Roseburg', 'Myrtle Creek', 'Out of Region / Other County', etc.
  externalCounty?: string;      // 'Lane County', 'Jackson County', etc.
  ageStage: 'Naked Baby / Nestling' | 'Feathered Fledgling' | 'Adult / Older' | 'Unknown';
  physicalCondition: 'Injured / Sick / Bleeding' | 'Cat Caught / Bite' | 'Dog Attack' | 'Orphaned / Nestling' | 'Feathered Fledgling' | 'Healthy Trapped in Live Trap';
  isCityRaccoon: boolean;
  isBandedPigeon: boolean;
  isSealOrMarine: boolean;
  isDomesticOrExotic: boolean;
  currentHour?: number;
}

export interface RoutingRecommendation {
  isProhibited: boolean;
  isOutOfRegion: boolean;
  prohibitedTitle?: string;
  policyWarnings: PolicyRule[];
  criticalAlerts: string[];
  recommendedRehabbers: { rehabber: Rehabber; isOpenNow: boolean; matchReason: string }[];
  recommendedCarriers: { carrier: CritterCarrier; isOpenNow: boolean }[];
  officialReferrals: OfficialContact[];
  outOfRegionCenter?: ReferralCenter;
  callerAdviceScripts: string[];
}

export const evaluateDispatchRouting = (input: RoutingInput): RoutingRecommendation => {
  const currentHour = input.currentHour ?? new Date().getHours();
  const criticalAlerts: string[] = [];
  const policyWarnings: PolicyRule[] = [];
  let isProhibited = false;
  let isOutOfRegion = false;
  let prohibitedTitle: string | undefined = undefined;
  const officialReferrals: OfficialContact[] = [];
  let outOfRegionCenter: ReferralCenter | undefined = undefined;

  // Helper to safely push unique official contacts
  const addOfficialReferral = (id: string) => {
    const contact = OFFICIAL_CONTACTS.find(c => c.id === id);
    if (contact && !officialReferrals.some(existing => existing.id === id)) {
      officialReferrals.push(contact);
    }
  };

  // 1. Check Out of Region / Outside Watershed
  if (input.location === 'Out of Region / Other County' || (input.externalCounty && !input.externalCounty.includes('Douglas'))) {
    isOutOfRegion = true;
    const countyLower = (input.externalCounty || '').toLowerCase();
    outOfRegionCenter = REFERRAL_CENTERS.find(center =>
      center.countyTags.some(tag => tag !== 'douglas' && countyLower.includes(tag))
    );

    // Fallback if generic out of region
    if (!outOfRegionCenter) {
      outOfRegionCenter = REFERRAL_CENTERS.find(c => c.id === 'cascades-raptor');
    }

    criticalAlerts.push(
      `OUT OF WATERSHED CALL: Do not let caller bring an out-of-county animal to UWR without express rehabber permission! Refer caller to local center in their county (${outOfRegionCenter?.facilityName} at ${outOfRegionCenter?.phone} or ODFW Office ${outOfRegionCenter?.odfwOfficePhone}).`
    );
  }

  // 2. Check Physical Animal Condition (Cat Bite, Dog Attack, Fledgling, Live Trapped)
  if (input.physicalCondition === 'Cat Caught / Bite') {
    criticalAlerts.push(
      'CRITICAL: CAT CAUGHT ANIMAL — Cats carry Pasteurella bacteria on teeth and claws. Puncture wounds inject bacteria directly into tissues. THIS ANIMAL REQUIRES IMMEDIATE ANTIBIOTICS FROM A REHABBER EVEN IF ACTIVE AND LOOKING FINE!'
    );
  } else if (input.physicalCondition === 'Dog Attack') {
    criticalAlerts.push(
      'DOG ATTACK NOTICE: Internal injuries or crush damage may be present even if external wounds are hidden by fur/feathers. Requires immediate rehabber evaluation.'
    );
  } else if (input.physicalCondition === 'Healthy Trapped in Live Trap') {
    isProhibited = true;
    prohibitedTitle = 'Healthy Live-Trapped Animal (PROHIBITED)';
    const rule = PROHIBITED_SPECIES_RULES.find(r => r.id === 'live-trapped');
    if (rule) policyWarnings.push(rule);
    addOfficialReferral('f5-wildlife');
    addOfficialReferral('odfw-roseburg');
    addOfficialReferral('saving-grace');
  }

  // 3. Check Fledgling / Baby Bird Flag
  if (input.category === 'Passerine' && (input.ageStage === 'Feathered Fledgling' || input.physicalCondition === 'Feathered Fledgling')) {
    criticalAlerts.push(
      'FLEDGLING PROTOCOL: If baby bird is feathered and hopping on ground, it is learning to fly. Parents feed it on ground. LEAVE ALONE unless outdoor cats are present or tail is damaged.'
    );
  }

  // 4. Check Special Circumstance: Banded Pigeon Flag
  if (input.isBandedPigeon) {
    isProhibited = true;
    prohibitedTitle = 'Banded Racing Pigeon (PROHIBITED)';
    addOfficialReferral('banded-pigeon');
    addOfficialReferral('avian-specialist');
    criticalAlerts.push('BANDED PIGEON: Belongs to private owner. Call Banded Pigeon Hotline at 1-800-755-2778 or Avian Specialist.');
  }

  // 5. Check Special Circumstance: Marine Seal Flag
  if (input.isSealOrMarine) {
    isProhibited = true;
    prohibitedTitle = 'Marine Mammal / Seal (UWR Prohibited)';
    const rule = PROHIBITED_SPECIES_RULES.find(r => r.id === 'seals-marine');
    if (rule) policyWarnings.push(rule);
    addOfficialReferral('oregon-shores');
    addOfficialReferral('osp-dispatch');
    criticalAlerts.push('WARNING: Keep caller at least 30 feet away from seals on beach. Capturing seals without OSP permission incurs severe state fines!');
  }

  // 6. Check Special Circumstance: Domestic / Exotic Flag
  if (input.isDomesticOrExotic) {
    isProhibited = true;
    prohibitedTitle = 'Domestic or Exotic Pet (UWR Prohibited)';
    const rule = PROHIBITED_SPECIES_RULES.find(r => r.id === 'domestic-exotics');
    if (rule) policyWarnings.push(rule);
    addOfficialReferral('saving-grace');
    addOfficialReferral('animal-control');
    addOfficialReferral('spca');
  }

  // 7. Check Non-Native / Prohibited Mammals and Birds
  const hasSpecificSpecies = Boolean(input.specificSpecies && input.specificSpecies.trim().length > 0);
  const lowerSpecies = hasSpecificSpecies ? input.specificSpecies!.trim().toLowerCase() : '';

  const isNonNative =
    hasSpecificSpecies &&
    (lowerSpecies.includes('opossum') ||
      lowerSpecies.includes('nutria') ||
      lowerSpecies.includes('fox squirrel') ||
      lowerSpecies.includes('starling') ||
      lowerSpecies.includes('sparrow') ||
      lowerSpecies.includes('collared dove') ||
      lowerSpecies.includes('coyote') ||
      lowerSpecies.includes('cougar'));

  if (isNonNative) {
    isProhibited = true;
    prohibitedTitle = 'Non-Native or State Prohibited Species';
    const rule = PROHIBITED_SPECIES_RULES.find(r => r.id === 'non-native-species');
    if (rule) policyWarnings.push(rule);
    addOfficialReferral('odfw-roseburg');
    addOfficialReferral('f5-wildlife');
    addOfficialReferral('osp-dispatch');
  }

  // 8. Check Raccoon Restrictions
  if ((hasSpecificSpecies && lowerSpecies.includes('raccoon')) || input.category === 'Raccoons') {
    if (input.ageStage === 'Adult / Older') {
      isProhibited = true;
      prohibitedTitle = 'Adult Raccoon (PROHIBITED)';
      const rule = PROHIBITED_SPECIES_RULES.find(r => r.id === 'coyotes-raccoons-cougars');
      if (rule) policyWarnings.push(rule);
      addOfficialReferral('osp-dispatch');
      addOfficialReferral('odfw-roseburg');
      addOfficialReferral('roseburg-police');
    } else if (input.isCityRaccoon) {
      const rule = PROHIBITED_SPECIES_RULES.find(r => r.id === 'city-raccoons');
      if (rule) policyWarnings.push(rule);
      addOfficialReferral('f5-wildlife');
      addOfficialReferral('odfw-roseburg');
    }
  }

  // 9. Check Deer Rules
  if ((hasSpecificSpecies && lowerSpecies.includes('deer')) || input.category === 'Fawns/Bears') {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0 = Jan, 8 = Sept
    const currentDay = today.getDate();
    const isPastSept30 = currentMonth > 8 || (currentMonth === 8 && currentDay > 30);

    if (input.ageStage === 'Adult / Older') {
      isProhibited = true;
      prohibitedTitle = 'Adult Deer (PROHIBITED)';
      const rule = PROHIBITED_SPECIES_RULES.find(r => r.id === 'adult-deer');
      if (rule) policyWarnings.push(rule);
      addOfficialReferral('osp-dispatch');
      addOfficialReferral('odfw-roseburg');
    } else if (isPastSept30) {
      isProhibited = true;
      prohibitedTitle = 'Fawn Past Sept 30 Cutoff (PROHIBITED)';
      const rule = PROHIBITED_SPECIES_RULES.find(r => r.id === 'fawn-cutoff');
      if (rule) policyWarnings.push(rule);
      addOfficialReferral('odfw-roseburg');
      addOfficialReferral('osp-dispatch');
    }
  }

  // 10. Match Local UWR Rehabbers (if not prohibited & inside watershed)
  const recommendedRehabbers: { rehabber: Rehabber; isOpenNow: boolean; matchReason: string }[] = [];

  if (!isProhibited && !isOutOfRegion) {
    REHABBERS.forEach(rehabber => {
      // Check category match
      const handlesCategory = rehabber.categories.includes(input.category);

      // Check species match ONLY if specificSpecies is provided
      const handlesSpecies =
        hasSpecificSpecies &&
        rehabber.speciesSpecialties.some(s =>
          s.toLowerCase().includes(lowerSpecies) || lowerSpecies.includes(s.toLowerCase())
        );

      if (handlesCategory || handlesSpecies) {
        // Calculate operating hours
        const isOpenNow =
          rehabber.startHour === 0 && rehabber.endHour === 24
            ? true
            : currentHour >= rehabber.startHour && currentHour < rehabber.endHour;

        let matchReason = `Specialist in ${input.category}`;
        if (handlesSpecies) matchReason = `Direct specialist for ${input.specificSpecies}`;
        if (rehabber.location.toLowerCase().includes(input.location.toLowerCase())) {
          matchReason += ` • Local to ${input.location}`;
        }

        recommendedRehabbers.push({ rehabber, isOpenNow, matchReason });
      }
    });

    // Sort: Open now first, then local match
    recommendedRehabbers.sort((a, b) => {
      if (a.isOpenNow && !b.isOpenNow) return -1;
      if (!a.isOpenNow && b.isOpenNow) return 1;
      return 0;
    });
  }

  // 11. Match Critter Carriers
  const recommendedCarriers: { carrier: CritterCarrier; isOpenNow: boolean }[] = [];
  CRITTER_CARRIERS.forEach(carrier => {
    const isLocal = carrier.location.toLowerCase().includes(input.location.toLowerCase());
    if (isLocal || carrier.hours.toLowerCase().includes('anytime')) {
      recommendedCarriers.push({ carrier, isOpenNow: true });
    }
  });

  // 12. Standard Advice Scripts to Read to Caller
  const callerAdviceScripts: string[] = [
    'WARMTH & DARKNESS: Put animal in a dark, quiet, ventilated cardboard box with a towel. Keep away from pets and kids.',
    'DO NOT FEED OR GIVE WATER: Feeding injured or cold wildlife can cause fatal aspiration or metabolic shock.',
    'SAFETY FIRST: Never touch bats, adult raccoons, adult deer, or raptors with bare hands. Use heavy leather gloves or blanket.'
  ];

  return {
    isProhibited,
    isOutOfRegion,
    prohibitedTitle,
    policyWarnings,
    criticalAlerts,
    recommendedRehabbers,
    recommendedCarriers,
    officialReferrals,
    outOfRegionCenter,
    callerAdviceScripts
  };
};
