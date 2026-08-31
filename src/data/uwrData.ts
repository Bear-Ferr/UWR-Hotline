export interface Rehabber {
  id: string;
  name: string;
  categories: string[];
  speciesSpecialties: string[];
  location: string;
  primaryPhone: string;     // Cell Phone
  landlinePhone?: string;    // Landline (L)
  hours: string;
  startHour: number; // 24-hour format
  endHour: number;   // 24-hour format
  role: string;
  notes?: string;
}

export interface CritterCarrier {
  id: string;
  name: string;
  location: string;
  phone: string;
  hours: string;
  notes?: string;
}

export interface OfficialContact {
  id: string;
  name: string;
  phone: string;
  info: string;
  category: 'Domestic/Exotic' | 'Government/Legal' | 'Marine/Coast' | 'Utility/Avian' | 'Disease/Health';
}

export interface ReferralCenter {
  id: string;
  facilityName: string;
  phone: string;
  city: string;
  approvedCounties: string;
  countyTags: string[]; // Normalized county names for matching
  odfwOfficePhone: string;
}

export interface Volunteer {
  name: string;
  phone: string;
  role?: string;
}

export interface PolicyRule {
  id: string;
  title: string;
  description: string;
  actionRequired: string;
  referralContact?: string;
  referralPhone?: string;
}

export const HOTLINE_COORDINATOR = {
  name: 'Syndi Michael',
  location: 'Roseburg',
  phone: '503-358-2348',
  hours: '8am - 8pm'
};

export const KEY_HELP_CONTACTS = {
  legalFinancialBookkeeping: ['Peggy', 'Brenda', 'Jeannie'],
  songbirdID: ['Brenda', 'Kathy', 'Syndi'],
  raptorID: ['Peggy', 'Joe']
};

export const REHABBERS: Rehabber[] = [
  {
    id: 'barbara-whittaker',
    name: 'Barbara Whittaker',
    categories: ['Passerine', 'Precocials', 'Mammals'],
    speciesSpecialties: ['Any passerine babies', 'Precocial babies', 'Small mammals', 'Bats'],
    location: 'Green / Roseburg',
    primaryPhone: '360-451-9414',
    hours: 'Anytime',
    startHour: 0,
    endHour: 24,
    role: 'Sub / Brenda & Rehabilitator'
  },
  {
    id: 'kathy-smith',
    name: 'Kathy Smith',
    categories: ['Passerine'],
    speciesSpecialties: ['Some passerine babies'],
    location: 'Winston',
    primaryPhone: '541-430-0412',
    landlinePhone: '541-679-4412',
    hours: '7am - 5pm',
    startHour: 7,
    endHour: 17,
    role: 'Sub / Brenda'
  },
  {
    id: 'joe-reicherts',
    name: 'Joe Reicherts',
    categories: ['Passerine', 'Raptors'],
    speciesSpecialties: ['Crows', 'Ravens', 'All Raptors', 'Falcons', 'Hawks', 'Owls'],
    location: 'Melrose',
    primaryPhone: '612-275-7533',
    hours: '8am - 8pm',
    startHour: 8,
    endHour: 20,
    role: 'Rehabilitator'
  },
  {
    id: 'brenda-weber',
    name: 'Brenda Weber',
    categories: ['Passerine', 'Herons', 'Raptors', 'Seabirds', 'Herptiles'],
    speciesSpecialties: ['Passerines (Assist/Adults)', 'Herons (Adults/Babies)', 'Raptor Assist', 'All Seabirds', 'All Herptiles (lizards, turtles, snakes)'],
    location: 'Garden Valley / Roseburg',
    primaryPhone: '541-680-3318',
    landlinePhone: '541-672-1659',
    hours: '7am - 8pm',
    startHour: 7,
    endHour: 20,
    role: 'Rehabilitator'
  },
  {
    id: 'rachael-daniels',
    name: 'Rachael Daniels',
    categories: ['Passerine'],
    speciesSpecialties: ['Passerine babies'],
    location: 'Roseburg',
    primaryPhone: '510-406-8688',
    hours: '7am - 8pm',
    startHour: 7,
    endHour: 20,
    role: 'Passerine Babies Specialist'
  },
  {
    id: 'chelsea-humphrey',
    name: 'Chelsea Humphrey',
    categories: ['Precocials', 'Mammals'],
    speciesSpecialties: ['Precocial babies', 'Small baby mammals'],
    location: 'North Roseburg',
    primaryPhone: '541-954-3357',
    hours: 'Anytime',
    startHour: 0,
    endHour: 24,
    role: 'Sub / Peggy'
  },
  {
    id: 'tessa-horton',
    name: 'Tessa Horton',
    categories: ['Precocials', 'Mammals', 'Raccoons'],
    speciesSpecialties: ['Precocial babies', 'All mammals', 'Raccoon babies (Special permit)'],
    location: 'Yoncalla / Oakland',
    primaryPhone: '541-554-4078',
    hours: 'Anytime',
    startHour: 0,
    endHour: 24,
    role: 'Rehabilitator & Sub / Peggy'
  },
  {
    id: 'peggy-cheatham',
    name: 'Peggy Cheatham',
    categories: ['Raptors', 'Seabirds', 'Fawns/Bears'],
    speciesSpecialties: ['All Raptors + EAGLES (Special Permit)', 'Seabirds Assist', 'Fawns (restricted)'],
    location: 'Umpqua / Sutherlin',
    primaryPhone: '541-391-2432',
    hours: '6am - 8pm',
    startHour: 6,
    endHour: 20,
    role: 'Rehabilitator'
  },
  {
    id: 'lynn-young',
    name: 'Lynn Young',
    categories: ['Mammals', 'Fawns/Bears', 'Raccoons'],
    speciesSpecialties: ['Large Mammals (Bobcat, Fox, Beaver)', 'Fawns & Bear cubs', 'Raccoon babies (Special permit)'],
    location: 'Myrtle Creek',
    primaryPhone: '541-391-9463',
    landlinePhone: '541-863-5606',
    hours: '8am - 7pm',
    startHour: 8,
    endHour: 19,
    role: 'Rehabilitator'
  },
  {
    id: 'helen-clack',
    name: 'Helen Clack',
    categories: ['Mammals', 'Raccoons'],
    speciesSpecialties: ['Small baby mammals', 'Raccoon assist'],
    location: 'Myrtle Creek',
    primaryPhone: '541-671-0175',
    landlinePhone: '541-860-5178',
    hours: '7am - 9pm',
    startHour: 7,
    endHour: 21,
    role: 'Sub / Lynn'
  },
  {
    id: 'rhiannon-lafaerique',
    name: 'Rhiannon LaFaerique',
    categories: ['Fawns/Bears', 'Herptiles'],
    speciesSpecialties: ['Fawns (Restricted)', 'Turtles'],
    location: 'Melrose / Lookingglass',
    primaryPhone: '541-643-3020',
    landlinePhone: '541-679-6838',
    hours: '8am - 11pm',
    startHour: 8,
    endHour: 23,
    role: 'Sub / Brenda'
  }
];

export const CRITTER_CARRIERS: CritterCarrier[] = [
  { id: 'helen-clack-carrier', name: 'Helen Clack', location: 'Myrtle Creek', phone: '541-671-0175', hours: '7am - 9pm' },
  { id: 'bob-day-carrier', name: 'Bob Day', location: 'Sutherlin', phone: '801-889-7263', hours: 'Anytime' },
  { id: 'abby-gillespie-carrier', name: 'Abby Gillespie', location: 'Roseburg', phone: '541-784-5667', hours: 'After 4:30pm + weekends' },
  { id: 'tessa-horton-carrier', name: 'Tessa Horton', location: 'Yoncalla / Oakland', phone: '541-554-4078', hours: 'Anytime' },
  { id: 'rick-kreofsky-carrier', name: 'Rick Kreofsky', location: 'Glide', phone: '541-530-6883', hours: 'Daylight hours' },
  { id: 'greg-westermeyer-carrier', name: 'Greg Westermeyer', location: 'Hucrest', phone: '619-933-8161', hours: 'Anytime' },
  { id: 'barbara-whittaker-carrier', name: 'Barbara Whittaker', location: 'Green / Roseburg', phone: '360-451-9414', hours: 'Anytime' },
  { id: 'rachel-daniels-carrier', name: 'Rachel Daniels', location: 'Garden Valley / Roseburg', phone: '541-406-8688', hours: 'Contact for availability' },
  { id: 'jacklyn-heard-carrier', name: 'Jacklyn Heard', location: 'Hucrest', phone: '541-430-4244', hours: 'Contact for availability' }
];

export const OFFICIAL_CONTACTS: OfficialContact[] = [
  { id: 'animal-control', name: 'Douglas County Animal Control', phone: '541-440-4328', info: 'Domestic & exotic animals', category: 'Domestic/Exotic' },
  { id: 'f5-wildlife', name: 'F5 Wildlife Control (Chuck Fisk)', phone: '541-972-0726', info: 'Nuisance animals & removal', category: 'Government/Legal' },
  { id: 'saving-grace', name: 'Animal Shelter (Saving Grace)', phone: '541-672-3907', info: 'Domestic & exotic pets', category: 'Domestic/Exotic' },
  { id: 'banded-pigeon', name: 'Banded Pigeon Center', phone: '1-800-755-2778', info: 'Report racing/banded pigeons', category: 'Utility/Avian' },
  { id: 'environmental-health', name: 'Douglas County Environmental Health', phone: '541-440-3574', info: 'Report animal bites & rabies risk', category: 'Disease/Health' },
  { id: 'iwrc', name: 'IWRC - Eugene', phone: '866-871-1869', info: 'International rehab assistance', category: 'Government/Legal' },
  { id: 'odfw-coos-bay', name: 'ODFW - Coos Bay (Tony Martinez)', phone: '541-888-5515', info: 'Animals or permission for rehab in Coos County', category: 'Government/Legal' },
  { id: 'odfw-roseburg', name: 'ODFW - Roseburg (Nick Leonetti)', phone: '541-440-3353', info: 'Animal questions, legal issues, non-natives', category: 'Government/Legal' },
  { id: 'oregon-shores', name: 'Oregon Shores Conservation Coalition (Jim Rice)', phone: '541-270-6830', info: 'Stranded seals and marine life', category: 'Marine/Coast' },
  { id: 'osp-dispatch', name: 'Oregon State Police (Dispatch Non-Emergency)', phone: '1-800-442-2068', info: 'Assist on rescue, injured deer, or euthanasia permission (*677 on cell)', category: 'Government/Legal' },
  { id: 'osp-office', name: 'Oregon State Police (Roseburg Office)', phone: '541-440-3334', info: 'Report illegal wildlife activity', category: 'Government/Legal' },
  { id: 'pacific-power', name: 'Pacific Power (Elise Jackson)', phone: '541-408-1549', info: 'Power line / avian hazard issues', category: 'Utility/Avian' },
  { id: 'avian-specialist', name: 'Avian Specialist', phone: '541-492-6760', info: 'Electrocution and nest problems', category: 'Utility/Avian' },
  { id: 'roseburg-police', name: 'Roseburg City Police', phone: '541-529-9616', info: 'Illegal wildlife activity in city limits', category: 'Government/Legal' },
  { id: 'spca', name: 'SPCA', phone: '541-529-9616', info: 'Domestic Cats', category: 'Domestic/Exotic' },
  { id: 'vet-lab', name: 'Oregon Veterinary Lab - Corvallis', phone: '1-866-968-2600', info: 'Report disease issues & die-offs', category: 'Disease/Health' }
];

export const REFERRAL_CENTERS: ReferralCenter[] = [
  { id: 'uwr', facilityName: 'Umpqua Wildlife Rescue', phone: '541-440-6895', city: 'Roseburg', approvedCounties: 'Douglas County', countyTags: ['douglas'], odfwOfficePhone: '541-440-3353 (Roseburg)' },
  { id: 'cascades-raptor', facilityName: 'Cascades Raptor Center', phone: '541-485-1320', city: 'Eugene', approvedCounties: 'All Counties (Raptors)', countyTags: ['lane', 'all'], odfwOfficePhone: '541-726-3515 (Springfield)' },
  { id: 'wildlife-images', facilityName: 'Wildlife Images', phone: '541-476-0222', city: 'Grants Pass', approvedCounties: 'So. Douglas, Curry, Jackson, Josephine', countyTags: ['jackson', 'josephine', 'curry', 'douglas'], odfwOfficePhone: '541-826-8774 (Central Point)' },
  { id: 'badger-run', facilityName: 'Badger Run Wildlife Rehab', phone: '541-891-2052', city: 'Klamath Falls', approvedCounties: 'Klamath Watershed', countyTags: ['klamath'], odfwOfficePhone: '541-883-5732 (Klamath)' },
  { id: 'think-wild', facilityName: 'Think Wild', phone: '541-241-8680', city: 'Bend', approvedCounties: 'Deschutes County', countyTags: ['deschutes'], odfwOfficePhone: '541-388-6363 (Bend)' },
  { id: 'native-bird-care', facilityName: 'Native Bird Care', phone: '541-728-8208', city: 'Sisters', approvedCounties: 'Deschutes County', countyTags: ['deschutes'], odfwOfficePhone: '541-388-6363 (Bend)' },
  { id: 'wildside', facilityName: 'Wildside Rehabilitation', phone: '541-610-9962', city: 'Redmond', approvedCounties: 'Deschutes County', countyTags: ['deschutes'], odfwOfficePhone: '541-388-6363 (Bend)' },
  { id: 'sunriver', facilityName: 'Sunriver Nature Center', phone: '541-593-4394', city: 'Sunriver', approvedCounties: 'Deschutes County', countyTags: ['deschutes'], odfwOfficePhone: '541-388-6363 (Bend)' },
  { id: 'blue-mountain', facilityName: 'Blue Mountain Wildlife', phone: '541-278-0215', city: 'Pendleton', approvedCounties: 'Umatilla County', countyTags: ['umatilla', 'union', 'wallowa'], odfwOfficePhone: '541-276-2344 (Pendleton)' },
  { id: 'rowena', facilityName: 'Rowena Wildlife Clinic', phone: '541-490-7921', city: 'The Dalles', approvedCounties: 'Wasco County', countyTags: ['wasco', 'hood river', 'sherman'], odfwOfficePhone: '541-296-4628 (The Dalles)' },
  { id: 'chintimini', facilityName: 'Chintimini Wildlife Center', phone: '541-745-5324', city: 'Corvallis', approvedCounties: 'Lane, Lincoln, Linn, Polk, Benton', countyTags: ['lane', 'lincoln', 'linn', 'polk', 'benton'], odfwOfficePhone: '541-757-4186 (Corvallis)' },
  { id: 'bird-alliance', facilityName: 'Bird Alliance of Oregon', phone: '503-292-0304', city: 'Portland', approvedCounties: 'All Counties (Birds)', countyTags: ['multnomah', 'washington', 'clackamas', 'all'], odfwOfficePhone: '971-673-6000 (Clackamas)' },
  { id: 'north-coast', facilityName: 'Wildlife Center North Coast', phone: '503-338-0331', city: 'Astoria', approvedCounties: 'Clatsop, Columbia, Tillamook', countyTags: ['clatsop', 'columbia', 'tillamook'], odfwOfficePhone: '503-842-2741 (Tillamook)' },
  { id: 'aquarium', facilityName: 'Oregon Coast Aquarium', phone: '541-867-3474', city: 'Newport', approvedCounties: 'Polk, Tillamook, Lincoln', countyTags: ['lincoln', 'polk', 'tillamook'], odfwOfficePhone: '541-867-0300 (Newport)' },
  { id: 'elona-wong', facilityName: 'Elona Wong (Rehabber)', phone: '541-817-4089', city: 'Eugene', approvedCounties: 'Lane County', countyTags: ['lane'], odfwOfficePhone: '541-726-3515 (Springfield)' },
  { id: 'karen-costa', facilityName: 'Karen Costa (Rehabber)', phone: '503-871-6591', city: 'Salem', approvedCounties: 'Linn, Benton, Marion', countyTags: ['marion', 'linn', 'benton'], odfwOfficePhone: '541-757-4186 (Corvallis)' },
  { id: 'kimberly-farasyn', facilityName: 'Kimberly Farasyn (Rehabber)', phone: '541-420-7245', city: 'Terrebonne', approvedCounties: 'Deschutes county', countyTags: ['deschutes'], odfwOfficePhone: '541-388-6363 (Bend)' },
  { id: 'becky-bass', facilityName: 'Becky Bass (Rehabber)', phone: '541-315-0718', city: 'Umpqua', approvedCounties: 'Douglas County', countyTags: ['douglas'], odfwOfficePhone: '541-440-3353 (Roseburg)' }
];

export const OREGON_COUNTIES = [
  'Douglas County (UWR Area)',
  'Lane County (Eugene/Springfield)',
  'Jackson County (Medford/Ashland)',
  'Josephine County (Grants Pass)',
  'Coos County (Coos Bay/North Bend)',
  'Curry County (Gold Beach/Brookings)',
  'Deschutes County (Bend/Redmond)',
  'Klamath County (Klamath Falls)',
  'Linn / Benton County (Corvallis/Albany)',
  'Lincoln County (Newport)',
  'Marion County (Salem)',
  'Multnomah / Clackamas / Washington County (Portland Metro)',
  'Clatsop / Columbia / Tillamook County (North Coast)',
  'Umatilla / Union / Wallowa County (Eastern OR)'
];

export const VOLUNTEERS: Volunteer[] = [
  { name: 'Syndi Michael', phone: '503-358-2348', role: 'Hotline Coordinator (8am-8pm)' },
  { name: 'Abby Gillespie', phone: '541-784-5667', role: 'Hotline & Carrier' },
  { name: 'Amy', phone: '541-530-7030', role: 'Hotline Volunteer' },
  { name: 'Ashlee', phone: '541-207-8067', role: 'Hotline Volunteer' },
  { name: 'Barbara Whittaker', phone: '360-451-9414', role: 'Hotline & Rehabber' },
  { name: 'Brandon', phone: '541-499-4281', role: 'Hotline Volunteer' },
  { name: 'Jackie Heard', phone: '541-643-4244', role: 'Hotline & Carrier' },
  { name: 'Lynn Young', phone: '541-391-9463', role: 'Hotline & Rehabber' },
  { name: 'Mary', phone: '458-271-9183', role: 'Hotline Volunteer' },
  { name: 'Peggy Cheatham', phone: '541-391-2432', role: 'Hotline & Rehabber' },
  { name: 'Rick Kreofsky', phone: '541-530-6883', role: 'Hotline & Carrier' },
  { name: 'Tessa Horton', phone: '541-554-4078', role: 'Hotline & Rehabber' },
  { name: 'Traci', phone: '541-404-0819', role: 'Hotline Volunteer' },
  { name: 'Valli', phone: '541-378-5915', role: 'Hotline Volunteer' }
];

export const PROHIBITED_SPECIES_RULES: PolicyRule[] = [
  {
    id: 'non-native-species',
    title: 'Non-Native Mammals & Birds (PROHIBITED)',
    description: 'State regulations prohibit UWR from rehabbing non-native species: Opossums, Nutria, Fox Squirrels, Starlings, House Sparrows, and Eurasian Collared Doves. Rehabbers risk losing their state license if accepted.',
    actionRequired: 'Direct caller to ODFW Roseburg Office (541-440-3353). Do not accept or transport.',
    referralContact: 'ODFW Roseburg',
    referralPhone: '541-440-3353'
  },
  {
    id: 'coyotes-raccoons-cougars',
    title: 'Coyotes, Adult Raccoons & Cougars (PROHIBITED)',
    description: 'Adult raccoons, coyotes, and cougars cannot legally be accepted by UWR volunteers. State rules dictate euthanasia if brought in.',
    actionRequired: 'Refer caller directly to ODFW or Oregon State Police non-emergency (1-800-442-2068). Do not accept.',
    referralContact: 'Oregon State Police Dispatch',
    referralPhone: '1-800-442-2068'
  },
  {
    id: 'city-raccoons',
    title: 'Baby Raccoons Inside City Limits (RESTRICTED)',
    description: 'Baby raccoons originating within city limits require special licensed raccoon rehabbers (Lynn Young or Tessa Horton) or direct ODFW handling.',
    actionRequired: 'Give call directly to Lynn Young or Tessa Horton. If unavailable, instruct caller to contact ODFW.',
    referralContact: 'Lynn Young / Tessa Horton / ODFW',
    referralPhone: '541-391-9463'
  },
  {
    id: 'older-deer',
    title: 'Deer Older Than Fawns (PROHIBITED AFTER SEPT 30)',
    description: 'UWR is ONLY permitted to accept fawns ("young of the year"). The seasonal deadline is September 30. Older deer or deer unable to stand up cannot be rehabbed.',
    actionRequired: 'Call State Police for euthanasia permission or officer dispatch. NEVER instruct caller how to euthanize animals. Deer moving on their own can be left in place.',
    referralContact: 'Oregon State Police',
    referralPhone: '1-800-442-2068'
  },
  {
    id: 'seals-marine',
    title: 'Seals & Sea Mammals (PROHIBITED)',
    description: 'UWR has NO permit to rehab marine mammals. Capturing seals without OSP permission carries high state fines.',
    actionRequired: 'Instruct caller to stay at least 30 feet away. Call Oregon Shores Conservation Coalition (541-270-6830) or State Police.',
    referralContact: 'Oregon Shores (Jim Rice)',
    referralPhone: '541-270-6830'
  },
  {
    id: 'domestic-exotics',
    title: 'Domestic & Exotic Animals (PROHIBITED)',
    description: 'Domestic pets (cats, dogs, livestock, domestic ducks/geese, peacocks, rock pigeons) and pet store exotics are not covered under wildlife permits.',
    actionRequired: 'Refer to Saving Grace Shelter (541-672-3907), Animal Control (541-440-4328), or SPCA.',
    referralContact: 'Douglas County Animal Control',
    referralPhone: '541-440-4328'
  },
  {
    id: 'live-trapped',
    title: 'Healthy Live-Trapped Animals (PROHIBITED)',
    description: 'UWR does NOT relocate healthy animals caught in live traps by homeowners. Oregon law explicitly prohibits relocating raccoons.',
    actionRequired: 'Refer caller to a licensed private animal relocator (e.g. F5 Wildlife Control 541-972-0726). If the trapped animal is injured, process as an injured rescue call.',
    referralContact: 'F5 Wildlife Control (Chuck Fisk)',
    referralPhone: '541-972-0726'
  }
];
