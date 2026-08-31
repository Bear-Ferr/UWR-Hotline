export interface WildlifeSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  category: string; // Passerine, Raptor, Seabird, Heron, Precocial, Mammal, Herptile
  appearance: {
    size: string;
    colors: string[];
    keyFeatures: string[];
    beakOrMouth: string;
  };
  habitat: string;
  commonInUmpqua: boolean;
  isProhibited?: boolean;
  imageUrl: string;
  description: string;
  babyVsAdultNotes: string;
  specialHandlingNotes: string;
  dispatchCategory: string;
}

export const WILDLIFE_SPECIES_CATALOG: WildlifeSpecies[] = [
  // --- PASSERINES & SONGBIRDS ---
  {
    id: 'crow-raven',
    commonName: 'American Crow / Common Raven',
    scientificName: 'Corvus brachyrhynchos / corax',
    category: 'Passerine',
    appearance: {
      size: 'Medium to Large (17-26 inches)',
      colors: ['All glossy black'],
      keyFeatures: ['All black plumage, bill, and feet', 'Ravens have wedge-shaped tail and throat hackles'],
      beakOrMouth: 'Heavy sharp black beak'
    },
    habitat: 'Agricultural valleys, Roseburg city edges, highway corridors',
    commonInUmpqua: true,
    imageUrl: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=800&q=80',
    description: 'Highly intelligent black corvids common across the Umpqua watershed.',
    babyVsAdultNotes: 'Baby crows have pink mouth linings and blue-grey eyes.',
    specialHandlingNotes: 'Contact Joe Reicherts (Melrose 612-275-7533) specializing in crows & ravens.',
    dispatchCategory: 'Passerine'
  },
  {
    id: 'robin',
    commonName: 'American Robin',
    scientificName: 'Turdus migratorius',
    category: 'Passerine',
    appearance: {
      size: 'Small (9-11 inches)',
      colors: ['Red/Orange breast', 'Dark grey/brown back', 'White eye ring'],
      keyFeatures: ['Bright reddish-orange breast', 'Yellow bill', 'Hopping movement'],
      beakOrMouth: 'Straight yellow bill'
    },
    habitat: 'Lawns, suburban yards, forests, parks throughout Douglas County',
    commonInUmpqua: true,
    imageUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=800&q=80',
    description: 'Very common songbird in the Umpqua watershed. Fledglings jump out of nests before flying and hop on the ground while parents feed them.',
    babyVsAdultNotes: 'Fledglings have speckled breast feathers with tail feathers under 2 inches. If feathered and hopping, LEAVE ALONE unless cats are present or tail is damaged.',
    specialHandlingNotes: 'If nestling (naked or unfeathered), needs immediate warm box. Fledglings leave in bush or tree safe from cats.',
    dispatchCategory: 'Passerine'
  },
  {
    id: 'stellers-jay',
    commonName: 'Steller\'s Jay',
    scientificName: 'Cyanocitta stelleri',
    category: 'Passerine',
    appearance: {
      size: 'Medium (12-13 inches)',
      colors: ['Deep blue wings and tail', 'Charcoal black head and crest'],
      keyFeatures: ['Prominent black feather crest', 'Deep blue body', 'Loud harsh call'],
      beakOrMouth: 'Stout black bill'
    },
    habitat: 'Coniferous forests, foothills, and wooded suburban neighborhoods',
    commonInUmpqua: true,
    imageUrl: 'https://images.unsplash.com/photo-1628178120612-421f1d1f0579?auto=format&fit=crop&w=800&q=80',
    description: 'Native Oregon crest-headed jay common in Douglas County conifer forests.',
    babyVsAdultNotes: 'Fledglings have shorter crests and softer grey-blue feathers.',
    specialHandlingNotes: 'Keep in lined paper bag or box in dark quiet place. Refer to Barbara Whittaker or Brenda Weber.',
    dispatchCategory: 'Passerine'
  },
  {
    id: 'anna-hummingbird',
    commonName: 'Anna\'s Hummingbird',
    scientificName: 'Calypte anna',
    category: 'Passerine',
    appearance: {
      size: 'Tiny (3.9 inches)',
      colors: ['Iridescent magenta pink crown/throat (males)', 'Bronze-green back'],
      keyFeatures: ['Needle-like long bill', 'Rapid wing beats', 'Hovering flight'],
      beakOrMouth: 'Long thin needle bill'
    },
    habitat: 'Feeder stations, flower gardens in Roseburg, Winston, Myrtle Creek',
    commonInUmpqua: true,
    imageUrl: 'https://images.unsplash.com/photo-1520808663317-647b476a81b9?auto=format&fit=crop&w=800&q=80',
    description: 'Year-round hummingbird in Western Oregon. High metabolic rate makes starvation rapid if trapped indoors or injured.',
    babyVsAdultNotes: 'Very fragile. Babies nest in tiny lichen cups.',
    specialHandlingNotes: 'HUMMINGBIRD FOOD EXCEPTION: Mix 1/4 tsp white sugar in 1 tsp warm water and allow bird to dip beak tip to prevent fatal hypoglycemia.',
    dispatchCategory: 'Passerine'
  },
  {
    id: 'starling',
    commonName: 'European Starling (PROHIBITED NON-NATIVE)',
    scientificName: 'Sturnus vulgaris',
    category: 'Passerine',
    appearance: {
      size: 'Small (8 inches)',
      colors: ['Glossy black with iridescent green/purple sheen', 'White speckles in winter', 'Yellow beak in spring'],
      keyFeatures: ['Short tail', 'Yellow bill in breeding season', 'Iridescent speckled plumage'],
      beakOrMouth: 'Pointed yellow or dark bill'
    },
    habitat: 'Suburban lawns, farmlands, urban buildings',
    commonInUmpqua: true,
    isProhibited: true,
    imageUrl: 'https://images.unsplash.com/photo-1605092676920-8ac5ae40c7c8?auto=format&fit=crop&w=800&q=80',
    description: 'PROHIBITED SPECIES: Non-native bird introduced from Europe. State regulations forbid UWR from rehabilitating starlings.',
    babyVsAdultNotes: 'Juveniles are drab brown without iridescence.',
    specialHandlingNotes: 'DO NOT ACCEPT. Refer caller to ODFW Roseburg (541-440-3353).',
    dispatchCategory: 'Passerine'
  },
  {
    id: 'house-sparrow',
    commonName: 'House Sparrow (PROHIBITED NON-NATIVE)',
    scientificName: 'Passer domesticus',
    category: 'Passerine',
    appearance: {
      size: 'Small (5.5 - 6.3 inches)',
      colors: ['Black bib (males)', 'Chestnut nape', 'Grey crown', 'Dull brown (females)'],
      keyFeatures: ['Conical seed-eating bill', 'Black throat patch on males'],
      beakOrMouth: 'Stout conical seed beak'
    },
    habitat: 'City buildings, farm structures around Roseburg',
    commonInUmpqua: true,
    isProhibited: true,
    imageUrl: 'https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&w=800&q=80',
    description: 'PROHIBITED SPECIES: Non-native species. State license prohibits acceptance.',
    babyVsAdultNotes: 'Yellow mouth flanges in nestlings.',
    specialHandlingNotes: 'DO NOT ACCEPT. Direct caller to ODFW Roseburg Office.',
    dispatchCategory: 'Passerine'
  },

  // --- RAPTORS ---
  {
    id: 'red-tailed-hawk',
    commonName: 'Red-Tailed Hawk',
    scientificName: 'Buteo jamaicensis',
    category: 'Raptor',
    appearance: {
      size: 'Large (18-26 inches, wingspan 4ft+)',
      colors: ['Cinnamon-red tail (adults)', 'Brown back', 'Streaked belly band'],
      keyFeatures: ['Broad rounded wings', 'Short broad red tail', 'Sharp hooked beak & heavy talons'],
      beakOrMouth: 'Hooked raptor beak'
    },
    habitat: 'Open country, highway corridors, clearings around Roseburg & Interstate 5',
    commonInUmpqua: true,
    imageUrl: 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?auto=format&fit=crop&w=800&q=80',
    description: 'The most common large hawk in Douglas County. Frequently found near roadsides injured by vehicles.',
    babyVsAdultNotes: 'Juveniles lack the red tail (brown barred tail instead). Sharp claws and beak present even in young birds.',
    specialHandlingNotes: 'CAUTION: Sharp talons and strong grip! Heavy leather gloves and blanket required for capture. Contact Joe Reicherts or Peggy Cheatham immediately.',
    dispatchCategory: 'Raptors'
  },
  {
    id: 'barn-owl',
    commonName: 'Barn Owl',
    scientificName: 'Tyto alba',
    category: 'Raptor',
    appearance: {
      size: 'Medium (13-16 inches)',
      colors: ['Heart-shaped white face', 'Golden-tan upperparts', 'Pure white chest'],
      keyFeatures: ['Distinct heart face rimmed with brown', 'Dark round eyes', 'Silent flight'],
      beakOrMouth: 'Hooked bill tucked in facial disc'
    },
    habitat: 'Barns, silos, hollow trees around Camas Valley, Lookingglass, and Melrose',
    commonInUmpqua: true,
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    description: 'Nocturnal rodent hunter common in agricultural areas of Douglas County.',
    babyVsAdultNotes: 'Nests in barn lofts. Chicks hiss loudly like steam when cornered.',
    specialHandlingNotes: 'Use towel to drape over owl before lifting into box. Refer to Joe Reicherts or Peggy Cheatham.',
    dispatchCategory: 'Raptors'
  },
  {
    id: 'great-horned-owl',
    commonName: 'Great Horned Owl',
    scientificName: 'Bubo virginianus',
    category: 'Raptor',
    appearance: {
      size: 'Large (18-25 inches)',
      colors: ['Mottled brown and grey plumage', 'White throat bib'],
      keyFeatures: ['Prominent feather ear tufts ("horns")', 'Yellow eyes', 'Feathered talons'],
      beakOrMouth: 'Heavy hooked raptor beak'
    },
    habitat: 'Wooded hills, forests, river bottoms near Glide and Myrtle Creek',
    commonInUmpqua: true,
    imageUrl: 'https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?auto=format&fit=crop&w=800&q=80',
    description: 'Powerful nocturnal predator capable of catching skunks and large rodents.',
    babyVsAdultNotes: 'Downy fluffy nestlings stay near nests in spring.',
    specialHandlingNotes: 'EXTREME CAUTION: Talons carry immense crushing strength. Contact Peggy Cheatham (541-391-2432) or Joe Reicherts.',
    dispatchCategory: 'Raptors'
  },
  {
    id: 'bald-eagle',
    commonName: 'Bald Eagle (SPECIAL PERMIT REQUIRED)',
    scientificName: 'Haliaeetus leucocephalus',
    category: 'Raptor',
    appearance: {
      size: 'Huge (30-40 inches, wingspan 6-7ft)',
      colors: ['White head and tail (adults)', 'Dark brown body', 'Yellow beak and feet'],
      keyFeatures: ['Distinctive snow-white head and tail', 'Massive yellow bill', 'Enormous wingspan'],
      beakOrMouth: 'Massive hooked yellow beak'
    },
    habitat: 'North & South Umpqua Rivers, lakes, reservoir shores',
    commonInUmpqua: true,
    imageUrl: 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?auto=format&fit=crop&w=800&q=80',
    description: 'Eagles require special state/federal permits. Peggy Cheatham holds UWR Eagle permit.',
    babyVsAdultNotes: 'Juveniles are mottled brown without white head until 4-5 years old.',
    specialHandlingNotes: 'SPECIAL PERMIT: Contact Peggy Cheatham directly (541-391-2432).',
    dispatchCategory: 'Raptors'
  },

  // --- WATERBIRDS & PRECOCIALS ---
  {
    id: 'great-blue-heron',
    commonName: 'Great Blue Heron',
    scientificName: 'Ardea herodias',
    category: 'Heron',
    appearance: {
      size: 'Very Large (3.2 - 4.5 ft tall, wingspan 6ft)',
      colors: ['Blue-grey body', 'Black crest plume', 'Yellow bill'],
      keyFeatures: ['Long slender legs', 'Long S-curved neck', 'Dagger-like yellow bill'],
      beakOrMouth: 'Long sharp spearing yellow beak'
    },
    habitat: 'Umpqua River banks, wetlands, ponds, and pastures near Roseburg and Glide',
    commonInUmpqua: true,
    imageUrl: 'https://images.unsplash.com/photo-1549608276-5786777e6587?auto=format&fit=crop&w=800&q=80',
    description: 'Tall wading bird found along the South and North Umpqua Rivers. Spearing beak poses direct eye risk to rescuers.',
    babyVsAdultNotes: 'Juveniles have greyish heads without white crowns.',
    specialHandlingNotes: 'DANGER TO EYES: Herons strike directly for eyes when threatened! Wear safety glasses/goggles during rescue. Contact Brenda Weber.',
    dispatchCategory: 'Herons'
  },
  {
    id: 'mallard-duckling',
    commonName: 'Mallard Duckling',
    scientificName: 'Anas platyrhynchos',
    category: 'Precocial',
    appearance: {
      size: 'Tiny (3-5 inches)',
      colors: ['Yellow and brown downy fur', 'Dark stripe through eye'],
      keyFeatures: ['Webbed feet', 'Soft spatulate bill', 'Fluffy down feathers'],
      beakOrMouth: 'Flat duck bill'
    },
    habitat: 'Streams, drainage ditches, lawns near water throughout Umpqua region',
    commonInUmpqua: true,
    imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=800&q=80',
    description: 'Precocial waterbird baby found separated from mother duck in spring/summer.',
    babyVsAdultNotes: 'Crucial: Ducklings CANNOT preen waterproof oil onto down. They MUST NOT BE GIVEN WATER TO SWIM OR DROWN IN.',
    specialHandlingNotes: 'KEEP DRY AND WARM! Never place in water or sink. Provide warm dry towel in box. Contact Chelsea Humphrey or Barbara Whittaker.',
    dispatchCategory: 'Precocials'
  },
  {
    id: 'california-quail',
    commonName: 'California Quail',
    scientificName: 'Callipepla californica',
    category: 'Precocial',
    appearance: {
      size: 'Small (9-10 inches)',
      colors: ['Grey and brown plumage', 'Scaled belly pattern', 'Black face (males)'],
      keyFeatures: ['Forward-curving teardrop head plume (topknot)', 'Fast running movement'],
      beakOrMouth: 'Short curved bill'
    },
    habitat: 'Brushy agricultural edges, valley scrub around Winston and Sutherlin',
    commonInUmpqua: true,
    imageUrl: 'https://images.unsplash.com/photo-1588698246830-74e2d3128b9d?auto=format&fit=crop&w=800&q=80',
    description: 'State bird of California, abundant ground-nesting gamebird in Douglas County.',
    babyVsAdultNotes: 'Precocial tiny downy chicks run immediately after hatching.',
    specialHandlingNotes: 'Contact Chelsea Humphrey, Barbara Whittaker, or Tessa Horton.',
    dispatchCategory: 'Precocials'
  },

  // --- MAMMALS ---
  {
    id: 'black-tailed-deer-fawn',
    commonName: 'Columbian Black-Tailed Deer Fawn',
    scientificName: 'Odocoileus hemionus columbianus',
    category: 'Fawns/Bears',
    appearance: {
      size: 'Small fawn (10-20 lbs)',
      colors: ['Reddish-brown fur with distinct white spots'],
      keyFeatures: ['White spots on coat', 'Large ears', 'Black tail tip'],
      beakOrMouth: 'Muzzle/snout'
    },
    habitat: 'Fields, brushy edges, yards in Glide, Roseburg, Sutherlin, Yoncalla',
    commonInUmpqua: true,
    imageUrl: 'https://images.unsplash.com/photo-1543946207-39bd91e70ca7?auto=format&fit=crop&w=800&q=80',
    description: 'Mothers leave fawns curled up alone for hours while foraging. This is NORMAL behavior and not abandonment.',
    babyVsAdultNotes: 'Fawns accepted ONLY until Sept 30. Older deer CANNOT be accepted by UWR rules.',
    specialHandlingNotes: 'Do NOT touch or move unless confirmed injured or mother dead. Refer callers directly to Lynn Young, Peggy Cheatham, or Rhiannon LaFaerique.',
    dispatchCategory: 'Fawns/Bears'
  },
  {
    id: 'raccoon-baby',
    commonName: 'Baby Raccoon (RESTRICTED PERMIT)',
    scientificName: 'Procyon lotor',
    category: 'Raccoons',
    appearance: {
      size: 'Small (1-5 lbs)',
      colors: ['Greyish fur', 'Black facial mask', 'Ringed tail'],
      keyFeatures: ['Distinct black eye mask', 'Ringed bushy tail', 'Dexterous front paws'],
      beakOrMouth: 'Pointed snout'
    },
    habitat: 'Attics, woods, river banks',
    commonInUmpqua: true,
    imageUrl: 'https://images.unsplash.com/photo-1567270678610-873523f2f840?auto=format&fit=crop&w=800&q=80',
    description: 'Requires special state raccoon rehabilitation permits. Adult raccoons are PROHIBITED and cannot be accepted by UWR.',
    babyVsAdultNotes: 'City limit raccoons require Lynn Young or Tessa Horton or ODFW. Relocating live-trapped raccoons is illegal in Oregon.',
    specialHandlingNotes: 'Contact Lynn Young (541-391-9463) or Tessa Horton (541-554-4078).',
    dispatchCategory: 'Raccoons'
  },
  {
    id: 'bobcat',
    commonName: 'Bobcat',
    scientificName: 'Lynx rufus',
    category: 'Mammal',
    appearance: {
      size: 'Medium (15-30 lbs)',
      colors: ['Tan to reddish brown coat with dark spots', 'White belly'],
      keyFeatures: ['Short "bobbed" tail with black tip', 'Tufted ears', 'Facial ruffs'],
      beakOrMouth: 'Cat muzzle with sharp canine teeth'
    },
    habitat: 'Forested hills, brushy canyons around Glide, Tiller, Camas Valley',
    commonInUmpqua: true,
    imageUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80',
    description: 'Native wild felid in Douglas County.',
    babyVsAdultNotes: 'Kittens have blue eyes and heavy spotting.',
    specialHandlingNotes: 'Contact Lynn Young (Myrtle Creek 541-391-9463) specializing in bobcats, foxes, and beavers.',
    dispatchCategory: 'Mammals'
  },
  {
    id: 'beaver',
    commonName: 'American Beaver',
    scientificName: 'Castor canadensis',
    category: 'Mammal',
    appearance: {
      size: 'Large rodent (35-60 lbs)',
      colors: ['Dark rich brown waterproof fur'],
      keyFeatures: ['Flat paddle-like tail', 'Large orange chisel front teeth', 'Webbed hind feet'],
      beakOrMouth: 'Large orange rodent incisors'
    },
    habitat: 'North & South Umpqua tributaries, creeks, ponds',
    commonInUmpqua: true,
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
    description: 'State mammal of Oregon. Large aquatic rodent.',
    babyVsAdultNotes: 'Kits vocalize with high whines.',
    specialHandlingNotes: 'Contact Lynn Young (Myrtle Creek 541-391-9463).',
    dispatchCategory: 'Mammals'
  },
  {
    id: 'opossum',
    commonName: 'Virginia Opossum (PROHIBITED NON-NATIVE)',
    scientificName: 'Didelphis virginiana',
    category: 'Mammal (Prohibited)',
    appearance: {
      size: 'Medium cat-sized (15-20 inches)',
      colors: ['Greyish-white coarse fur', 'Pink nose', 'Black ears with white tips'],
      keyFeatures: ['Hairless prehensile tail', '50 sharp teeth in long pointed snout', 'Playing dead response'],
      beakOrMouth: 'Long pink snout with 50 teeth'
    },
    habitat: 'Suburban neighborhoods, garages, chicken coops',
    commonInUmpqua: true,
    isProhibited: true,
    imageUrl: 'https://images.unsplash.com/photo-1612862862126-865765df2e95?auto=format&fit=crop&w=800&q=80',
    description: 'PROHIBITED SPECIES: Non-native mammal in Oregon. UWR is forbidden from rehabbing opossums.',
    babyVsAdultNotes: 'Babies ride on mother\'s back.',
    specialHandlingNotes: 'DO NOT ACCEPT. Advise caller to contact ODFW Roseburg (541-440-3353).',
    dispatchCategory: 'Mammals'
  },
  {
    id: 'nutria',
    commonName: 'Nutria (PROHIBITED NON-NATIVE)',
    scientificName: 'Myocastor coypus',
    category: 'Mammal (Prohibited)',
    appearance: {
      size: 'Large rodent (15-20 lbs)',
      colors: ['Coarse dark brown fur', 'White whiskers'],
      keyFeatures: ['Round hairless rat-like tail', 'Large bright orange front teeth', 'White muzzle'],
      beakOrMouth: 'Bright orange front incisors'
    },
    habitat: 'Riverbanks, farm ponds, irrigation ditches',
    commonInUmpqua: true,
    isProhibited: true,
    imageUrl: 'https://images.unsplash.com/photo-1504006833117-8886a355efbf?auto=format&fit=crop&w=800&q=80',
    description: 'PROHIBITED SPECIES: Invasive South American rodent.',
    babyVsAdultNotes: 'Nipple lines on sides of females allowing babies to nurse while swimming.',
    specialHandlingNotes: 'DO NOT ACCEPT. Direct caller to ODFW Roseburg.',
    dispatchCategory: 'Mammals'
  },

  // --- HERPTILES ---
  {
    id: 'western-pond-turtle',
    commonName: 'Western Pond Turtle',
    scientificName: 'Actinemys marmorata',
    category: 'Herptile',
    appearance: {
      size: 'Medium (6-8 inches shell)',
      colors: ['Dark brown or olive carapace with fine black spots/lines', 'Yellowish belly'],
      keyFeatures: ['Low unkeeled shell', 'Yellow spots on head and limbs', 'Webbed claws'],
      beakOrMouth: 'Hard horned beak'
    },
    habitat: 'Slow moving streams, ponds, basking logs in Umpqua river basin',
    commonInUmpqua: true,
    imageUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80',
    description: 'Oregon native turtle species of concern. Frequently hit by cars crossing roads in spring/summer to lay eggs.',
    babyVsAdultNotes: 'Hatchlings are tiny (quarter-sized) with long tails.',
    specialHandlingNotes: 'Contact Rhiannon LaFaerique (Melrose/Lookingglass) or Brenda Weber (North Garden Valley).',
    dispatchCategory: 'Herptiles'
  },
  {
    id: 'garter-snake',
    commonName: 'Common Garter Snake',
    scientificName: 'Thamnophis sirtalis',
    category: 'Herptile',
    appearance: {
      size: 'Small to Medium (18-36 inches)',
      colors: ['Dark body with 3 bright yellow or red/blue longitudinal stripes'],
      keyFeatures: ['Longitudinal stripes along back and sides', 'Slender body', 'Harmless to humans'],
      beakOrMouth: 'Small mouth'
    },
    habitat: 'Fields, gardens, stream margins throughout Douglas County',
    commonInUmpqua: true,
    imageUrl: 'https://images.unsplash.com/photo-1531386151447-fd76ad50012f?auto=format&fit=crop&w=800&q=80',
    description: 'Harmless native reptile common in Western Oregon.',
    babyVsAdultNotes: 'Live-born tiny babies in late summer.',
    specialHandlingNotes: 'Contact Brenda Weber (541-680-3318) for all herptiles.',
    dispatchCategory: 'Herptiles'
  }
];
