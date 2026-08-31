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
  officialReferral?: OfficialContact;
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
  let officialReferral: OfficialContact | undefined = undefined;
  let outOfRegionCenter: ReferralCenter | undefined = undefined;

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
    officialReferral = OFFICIAL_CONTACTS.find(c => c.id === 'f5-wildlife');
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
    officialReferral = OFFICIAL_CONTACTS.find(c => c.id === 'banded-pigeon');
    criticalAlerts.push('BANDED PIGEON: Belongs to private owner. Call Banded Pigeon Hotline at 1-800-755-2778 to locate owner.');
  }

  // 5. Check Special Circumstance: Marine Seal Flag
  if (input.isSealOrMarine) {
    isProhibited = true;
    prohibitedTitle = 'Marine Mammal / Seal (UWR Prohibited)';
    const rule = PROHIBITED_SPECIES_RULES.find(r => r.id === 'seals-marine');
    if (rule) policyWarnings.push(rule);
    officialReferral = OFFICIAL_CONTACTS.find(c => c.id === 'oregon-shores');
    criticalAlerts.push('WARNING: Keep caller at least 30 feet away from seals on beach. Capturing seals without OSP permission incurs severe state fines!');
  }

  // 6. Check Special Circumstance: Domestic / Exotic Flag
  if (input.isDomesticOrExotic) {
    isProhibited = true;
    prohibitedTitle = 'Domestic or Exotic Pet (UWR Prohibited)';
    const rule = PROHIBITED_SPECIES_RULES.find(r => r.id === 'domestic-exotics');
    if (rule) policyWarnings.push(rule);
    officialReferral = OFFICIAL_CONTACTS.find(c => c.id === 'animal-control');
  }

  // 7. Check Non-Native / Prohibited Mammals and Birds
  const lowerSpecies = (input.specificSpecies || '').toLowerCase();
  const isNonNative =
    lowerSpecies.includes('opossum') ||
    lowerSpecies.includes('nutria') ||
    lowerSpecies.includes('fox squirrel') ||
    lowerSpecies.includes('starling') ||
    lowerSpecies.includes('sparrow') ||
    lowerSpecies.includes('collared dove') ||
    lowerSpecies.includes('coyote') ||
    lowerSpecies.includes('cougar');

  if (isNonNative) {
    isProhibited = true;
    prohibitedTitle = 'Non-Native or State Prohibited Species';
    const rule = PROHIBITED_SPECIES_RULES.find(r => r.id === 'non-native-species');
    if (rule) policyWarnings.push(rule);
    officialReferral = OFFICIAL_CONTACTS.find(c => c.id === 'odfw-roseburg');
  }

  // 8. Check Raccoon Restrictions
  if (lowerSpecies.includes('raccoon') || input.category === 'Raccoons') {
    if (input.ageStage === 'Adult / Older') {
      isProhibited = true;
      prohibitedTitle = 'Adult Raccoon (PROHIBITED)';
      const rule = PROHIBITED_SPECIES_RULES.find(r => r.id === 'coyotes-raccoons-cougars');
      if (rule) policyWarnings.push(rule);
      officialReferral = OFFICIAL_CONTACTS.find(c => c.id === 'osp-dispatch');
    } else if (input.isCityRaccoon) {
      const rule = PROHIBITED_SPECIES_RULES.find(r => r.id === 'city-raccoons');
      if (rule) policyWarnings.push(rule);
    }
  }

  // 9. Check Deer Rules
  if (lowerSpecies.includes('deer') || input.category === 'Fawns/Bears') {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0 = Jan, 8 = Sept
    const currentDay = today.getDate();
    const isPastSept30 = currentMonth > 8 || (currentMonth === 8 && currentDay > 30);

    if (input.ageStage === 'Adult / Older' || isPastSept30) {
      isProhibited = true;
      prohibitedTitle = 'Deer Older Than Fawns or Past Sept 30 Cutoff';
      const rule = PROHIBITED_SPECIES_RULES.find(r => r.id === 'older-deer');
      if (rule) policyWarnings.push(rule);
      officialReferral = OFFICIAL_CONTACTS.find(c => c.id === 'osp-dispatch');
    }
  }

  // 10. Match Eligible UWR Rehabbers (if within watershed)
  const eligibleRehabbers = REHABBERS.filter(r =>
    r.categories.includes(input.category) || r.categories.some(c => c.toLowerCase() === input.category.toLowerCase())
  );

  const rankedRehabbers = eligibleRehabbers.map(r => {
    const isOpenNow = r.startHour === 0 && r.endHour === 24 ? true : currentHour >= r.startHour && currentHour < r.endHour;
    let matchReason = `Specializes in ${r.speciesSpecialties.join(', ')}`;
    if (input.location && r.location.toLowerCase().includes(input.location.toLowerCase())) {
      matchReason += ` • Located nearby in ${r.location}`;
    }
    return { rehabber: r, isOpenNow, matchReason };
  }).sort((a, b) => (b.isOpenNow ? 1 : 0) - (a.isOpenNow ? 1 : 0));

  // 11. Match Critter Carriers
  const recommendedCarriers = CRITTER_CARRIERS.map(c => ({ carrier: c, isOpenNow: true }));

  // 12. Caller Advice Scripts
  const callerAdviceScripts = [
    'Place clean, soft cloth at bottom of a paper bag or cardboard box with air holes.',
    'Keep animal in a QUIET, DARK, WARM, and SECURED place away from children and pets.',
    'DO NOT handle, hold, or pet the animal (wild animals view human touch as predator threat).',
    'DO NOT give any food or liquid except water (Hummingbirds allowed 1/4 tsp sugar in 1 tsp water).',
    'MEDIA RESTRICTION: Remind caller NOT to post photos/videos of rescue on news or social media.'
  ];

  return {
    isProhibited,
    isOutOfRegion,
    prohibitedTitle,
    policyWarnings,
    criticalAlerts,
    recommendedRehabbers: rankedRehabbers,
    recommendedCarriers,
    officialReferral,
    outOfRegionCenter,
    callerAdviceScripts
  };
};
