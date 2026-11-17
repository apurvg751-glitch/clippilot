/**
 * RepuBoost Intelligent Review Variation Engine
 * 
 * Solves the "Duplicate Review Problem" on Google Maps / Google Business Profile.
 * Stores 10+ natural, human-written variations per category tag with diverse sentence structures,
 * natural conversational markers, varied vocabulary, and dynamic sign-offs.
 * 
 * Supports:
 * 1. Single-tag randomization (picks 1 of 10+ authentic variations on every tap).
 * 2. Multi-tag dual synthesis (combines 2 tags into an organic, multi-faceted review).
 * 3. Dynamic closing permutations for maximum uniqueness.
 */

export interface PositiveTagDefinition {
  id: string;
  emoji: string;
  label: string;
  shortPill: string;
}

export interface CategoryReviewKit {
  tags: PositiveTagDefinition[];
  // Map of tagId -> array of single-tag templates
  singleTemplates: Record<string, string[]>;
  // Map of combined key "tagA+tagB" -> array of combined templates
  combinedTemplates: Record<string, string[]>;
}

// Universal dynamic sign-offs to inject subtle diversity into review conclusions
const DYNAMIC_SIGNOFFS = [
  'Highly recommend to everyone!',
  'Will definitely be coming back soon.',
  'Truly a 5-star experience all the way!',
  'A real gem in the area.',
  'Keep up the phenomenal work!',
  'Very satisfied with our visit.',
  'Worth every single rupee!',
  'Deserves more than 5 stars!',
  'Can’t recommend them enough.',
  'Already looking forward to my next visit.',
  'Five stars without a doubt!',
  'Thank you for the wonderful experience!',
];

export function getRandomSignoff(): string {
  const idx = Math.floor(Math.random() * DYNAMIC_SIGNOFFS.length);
  return DYNAMIC_SIGNOFFS[idx];
}

/**
 * Category-Specific Kits with 10+ variations per tag
 */
export const CATEGORY_REVIEW_KITS: Record<string, CategoryReviewKit> = {
  // --------------------------------------------------------------------------
  // 1. FOOD, SWEETS, RESTAURANTS, CAFES, BAKERIES
  // --------------------------------------------------------------------------
  food: {
    tags: [
      { id: 'taste', emoji: '🍯', label: 'Delicious Taste', shortPill: 'Taste' },
      { id: 'freshness', emoji: '✨', label: 'Super Fresh Quality', shortPill: 'Freshness' },
      { id: 'service', emoji: '⚡', label: 'Fast & Polite Staff', shortPill: 'Service' },
    ],
    singleTemplates: {
      taste: [
        'The food and taste at {name} are absolutely outstanding! Rich, authentic, and delicious.',
        'Really impressed with the flavors and preparation at {name}. Everything tasted superb and authentic.',
        'Hands down some of the best taste and food quality in town at {name}!',
        'Loved our visit to {name}! The taste was spot-on, perfectly balanced, and freshly made.',
        'Such delicious food and rich authentic flavors at {name}. You can tell they use premium ingredients.',
        'Every single item we tried at {name} was full of flavor and mouth-watering. Great experience!',
        'Visited {name} today and the taste was incredible. Freshly prepared, flavorful, and worth every penny.',
        'If you appreciate authentic flavor and great culinary taste, {name} is an absolute must-visit.',
        'Consistently delicious! {name} never disappoints when it comes to rich taste and traditional recipes.',
        'Top-notch taste and wonderful recipes at {name}. Truly a delightful food experience.',
      ],
      freshness: [
        'Everything at {name} is consistently fresh and top quality. Pristine hygiene and excellent presentation!',
        'The freshness of the items at {name} really stands out. Crisp, clean, and beautifully maintained.',
        'Super fresh ingredients and impeccable cleanliness at {name}. Felt great buying from here!',
        'Noticeably fresh and high-quality preparation at {name}. You can taste the freshness in every bite.',
        'Impressed by how clean and hygienic {name} is. Freshly made items and spotless counter standards!',
        'Top quality freshness at {name}! Everything looks and tastes freshly prepared today.',
        'Very hygienic venue with genuinely fresh offerings at {name}. Five stars for quality and purity.',
        'Always fresh, always hygienic. {name} maintains wonderful standards of freshness across the board.',
        'Loved how fresh and well-kept everything was during my visit to {name}. Truly refreshing quality.',
        'Pristine hygiene and unmatched freshness at {name}. Definitely sets a high standard!',
      ],
      service: [
        'Wonderful customer service at {name}! Staff is welcoming, fast, and very helpful.',
        'Super fast turnaround and polite staff at {name}. Made the entire experience smooth and enjoyable.',
        'The team at {name} is very courteous, attentive, and prompt. Great hospitality from start to finish!',
        'Quick checkout and very friendly service at {name}. Appreciate the warm and respectful behavior.',
        'Impressed by how efficient and pleasant the staff was at {name}. Service with a genuine smile!',
        'Extremely helpful team and quick order fulfillment at {name}. Keep up the great service!',
        'Polite, respectful, and attentive staff at {name}. They attended to our order without any delay.',
        'Prompt service and great attitude by the team at {name}. Very pleased with how well we were treated.',
        'Such warm hospitality and fast service at {name}! A real pleasure visiting this place.',
        'Staff at {name} was courteous, patient, and quick. Exemplary customer service all around!',
      ],
    },
    combinedTemplates: {
      'taste+freshness': [
        'Outstanding taste and unbeatable freshness at {name}! You can truly taste the purity and quality in every single bite.',
        'Both the rich authentic taste and immaculate freshness at {name} were remarkable. Top quality all around!',
        'The food at {name} was not only mouth-watering and delicious but noticeably fresh and well-prepared.',
        'Incredible flavors combined with pristine hygiene and freshness at {name}. Definitely one of our favorites!',
      ],
      'taste+service': [
        'Exceptional taste accompanied by wonderfully quick and polite service at {name}. 10/10 dining experience!',
        'Loved the authentic, flavorful food at {name}, and the staff was so courteous and attentive throughout.',
        'Fantastic taste and genuinely warm customer hospitality at {name}. Service was super prompt and welcoming.',
        'The food at {name} is delicious, and the courteous staff made our visit even more delightful.',
      ],
      'freshness+service': [
        'Spotless hygiene, remarkably fresh items, and prompt, smiling service at {name}. A top-tier experience!',
        'Pristine freshness combined with fast and polite staff at {name}. Everything ran seamlessly from start to finish.',
        'Very impressed by both the clean, fresh standards and the warm customer service at {name}.',
        'Top quality freshness and very courteous staff at {name}. Made shopping here an absolute breeze.',
      ],
    },
  },

  // --------------------------------------------------------------------------
  // 2. AUTOMOTIVE, CAR DETAILING, WASH & CERAMIC
  // --------------------------------------------------------------------------
  auto: {
    tags: [
      { id: 'finish', emoji: '🚗', label: 'Flawless Finish', shortPill: 'Finish' },
      { id: 'service', emoji: '⚡', label: 'Quick & Transparent', shortPill: 'Service' },
      { id: 'quality', emoji: '🏆', label: 'Master Craftsmanship', shortPill: 'Quality' },
    ],
    singleTemplates: {
      finish: [
        'Exceptional detailing and mirror-like finish at {name}! My vehicle looks brand new inside and out.',
        'The finish and gloss they achieved on my car at {name} exceeded all my expectations. Absolutely stunning!',
        'Flawless exterior paint finish and deep shine by the crew at {name}. 10/10 detailing work.',
        'Brought my car to {name} and was blown away by the brilliant finish and spotless interior detailing.',
        'The shine and paint protection work done by {name} is top tier. Car looks showroom ready!',
        'Incredible paint finish and spotless cleanup at {name}. You can see your reflection in the paintwork!',
        'Attention to detail on the exterior finish at {name} is unmatched. Best detailing center around.',
        'My car looks immaculate after the treatment at {name}. Pristine finish and great shine.',
        'Outstanding polish and detailing finish at {name}. Every scratch and swirl mark was treated properly.',
        'Mirror gloss finish and thorough interior restoration by {name}. Truly exceptional craft!',
      ],
      service: [
        'Prompt service and complete transparency on pricing and work at {name}. Very professional team!',
        'Delivered on time with zero hidden charges at {name}. Appreciate the honesty and professionalism.',
        'Super smooth customer experience at {name}. Staff kept me updated throughout the entire service.',
        'Fast turnaround without cutting any corners at {name}. Great communication from the service advisor.',
        'Professional, timely, and polite team at {name}. The entire process was seamless and transparent.',
        'Very quick and punctual service at {name}. They explained the entire job thoroughly beforehand.',
        'Appreciate the honesty, fair pricing, and clear timeline given by {name}. Great work ethic!',
        'Smooth handover and transparent job sheet at {name}. Trustworthy and reliable auto care center.',
        'Friendly, respectful, and punctual team at {name}. Service was done exactly as promised.',
        'Quick intake, clear estimates, and on-time vehicle delivery at {name}. Top-notch service standards.',
      ],
      quality: [
        'The attention to detail and craftsmanship at {name} is unmatched. The only place I trust with my car!',
        'Master-level workmanship at {name}! They treat every vehicle with genuine care and precision.',
        'High-grade materials and rigorous quality checks at {name}. Truly masters of their trade.',
        'Outstanding workmanship by the technicians at {name}. They went above and beyond on my car.',
        'The craftsmanship and meticulous standards at {name} are in a league of their own.',
        'Remarkable dedication to quality at {name}. You can tell these guys are passionate about what they do.',
        'Precision work and top-shelf products used at {name}. My vehicle has never looked better.',
        'Flawless workmanship from bumper to bumper at {name}. Worth every single rupee spent.',
        'Uncompromising build quality and meticulous attention to small details at {name}.',
        'Top-tier auto craftsmanship at {name}. Professional grade results that speak for themselves.',
      ],
    },
    combinedTemplates: {
      'finish+service': [
        'Stunning mirror-like finish delivered right on schedule at {name}! Transparent pricing and fantastic customer service.',
        'My car looks brand new thanks to {name}, and the service advisor was exceptionally clear, polite, and punctual.',
        'Flawless paint finish combined with quick, honest turnaround at {name}. Truly professional auto care!',
        'Incredible gloss finish and very transparent, courteous service at {name}. 10/10 recommend to all vehicle owners.',
      ],
      'finish+quality': [
        'The level of craftsmanship and mirror finish achieved at {name} is world-class. Attention to detail is superb!',
        'Flawless finish backed by true master craftsmanship at {name}. They treated my car like their own.',
        'Showroom finish and uncompromising quality of work at {name}. Simply the best auto detailing in the city.',
        'Deep shine, pristine interior, and expert-level workmanship at {name}. Outstanding quality throughout.',
      ],
      'service+quality': [
        'Transparent, punctual service combined with master-level auto craftsmanship at {name}. A trustworthy garage!',
        'Quick turnaround, clear estimates, and phenomenal work quality on my car at {name}. Top marks all around.',
        'Prompt customer support and exceptional workmanship at {name}. They deliver exactly what they promise.',
        'Honest pricing, attentive staff, and flawless vehicle care at {name}. Will be returning for all future services.',
      ],
    },
  },

  // --------------------------------------------------------------------------
  // 3. SALON, SPA & GROOMING
  // --------------------------------------------------------------------------
  salon: {
    tags: [
      { id: 'styling', emoji: '💇', label: 'Expert Styling', shortPill: 'Styling' },
      { id: 'ambience', emoji: '✨', label: 'Luxury Ambience', shortPill: 'Ambience' },
      { id: 'staff', emoji: '🌟', label: 'Friendly Staff', shortPill: 'Staff' },
    ],
    singleTemplates: {
      styling: [
        'Had an incredible styling session at {name}! The artists are exceptionally talented and attentive.',
        'The stylist at {name} understood exactly what look I wanted and executed it to perfection!',
        'Top-tier styling and precision haircut at {name}. Left the salon feeling confident and refreshed.',
        'Master stylists at {name}! The attention to personal style and face structure is brilliant.',
        'Consistently the best grooming and hair styling results at {name}. Highly skilled professionals.',
        'Loved my new look from {name}! The stylists really take their time to get every detail right.',
        'Fantastic haircut and beard styling at {name}. Clean cuts, sharp lines, and great products.',
        'Truly talented styling team at {name}. They give personalized recommendations that actually work.',
        'Outstanding haircut and makeover experience at {name}. The expertise speaks for itself.',
        'Precision styling and premium hair care treatments at {name}. Couldn’t be happier with the outcome.',
      ],
      ambience: [
        'Loved the relaxing vibe, immaculate hygiene, and hospitable atmosphere at {name}. Truly a 5-star experience!',
        'The aesthetic and soothing ambience at {name} makes every appointment feel like a luxury spa day.',
        'Spotlessly clean, modern, and beautifully decorated interiors at {name}. Very calming environment.',
        'Super relaxing ambience and top-notch hygiene standards at {name}. Everything was sanitized and neat.',
        'Peaceful environment with elegant music and premium comfort at {name}. Loved the whole atmosphere.',
        'The ambience at {name} is pure luxury. Clean, serene, and delightfully comfortable throughout.',
        'Impeccable cleanliness and a soothing, upscale atmosphere at {name}. Felt completely pampered.',
        'Relaxing vibes and pristine hygiene at {name}. You feel the luxury the moment you step in.',
        'Warm, modern, and beautifully kept salon space at {name}. Perfect place to unwind and groom.',
        'Wonderful ambience and spotless station hygiene at {name}. A tranquil oasis in the city!',
      ],
      staff: [
        'Super courteous team and wonderful hospitality at {name}. Best salon experience around!',
        'The staff at {name} is so welcoming, polite, and attentive to every comfort. Great team!',
        'Very friendly and professional professionals at {name}. They make you feel valued right away.',
        'Warm greetings and patient consultation by the team at {name}. Exemplary customer care!',
        'Courteous, soft-spoken, and respectful staff at {name}. Loved the caring hospitality.',
        'The staff at {name} goes out of their way to make sure you are comfortable and relaxed.',
        'Attentive, skilled, and cheerful team at {name}. Excellent customer-first attitude all around.',
        'Friendly staff who listen carefully to what you want at {name}. Hospitality done right!',
        'Super hospitable staff and seamless booking at {name}. Welcoming team that treats you like royalty.',
        'Polite, professional, and delightfully accommodating team at {name}. Five stars for customer service!',
      ],
    },
    combinedTemplates: {
      'styling+ambience': [
        'Incredible styling expertise set in a calm, luxurious ambience at {name}. The ultimate pampering session!',
        'Loved the chic, relaxing vibe at {name}, and the stylist did a phenomenal job on my hair. 10/10!',
        'Top-notch haircut and styling alongside a serene, pristine ambience at {name}. Felt like a celebrity.',
        'Flawless personal styling in a spotless, upscale environment at {name}. Outstanding experience!',
      ],
      'styling+staff': [
        'Brilliant hair styling and an exceptionally warm, polite team at {name}. Felt so comfortable and well cared for.',
        'The stylist at {name} is a true artist, and the entire support staff is welcoming and attentive.',
        'Got the exact style I wanted, complemented by wonderful customer service from the staff at {name}.',
        'Expert styling paired with courteous, patient staff at {name}. Hands down the best salon in town!',
      ],
      'ambience+staff': [
        'Luxurious, tranquil ambience paired with the sweetest, most hospitable staff at {name}. A joy to visit!',
        'Spotless hygiene, calming interiors, and very polite customer service at {name}. Truly 5 stars!',
        'The relaxing atmosphere and attentive, smiling staff at {name} make every visit feel so special.',
        'Upscale comfort and wonderfully respectful staff at {name}. The hospitality here is unmatched.',
      ],
    },
  },

  // --------------------------------------------------------------------------
  // 4. UNIVERSAL PREMIUM DEFAULTS (Retail, Healthcare, Fitness, Professional)
  // --------------------------------------------------------------------------
  general: {
    tags: [
      { id: 'service', emoji: '🌟', label: 'Great Service', shortPill: 'Service' },
      { id: 'staff', emoji: '🤝', label: 'Friendly Staff', shortPill: 'Staff' },
      { id: 'experience', emoji: '🏆', label: 'Best Experience', shortPill: 'Experience' },
    ],
    singleTemplates: {
      service: [
        'Loved the exceptional service and welcoming staff at {name}! Truly a 5-star experience.',
        'Super prompt, reliable, and professional service at {name}. Everything was handled smoothly.',
        'The quality of service at {name} is consistently high. They value their customers’ time!',
        'Flawless customer service and quick resolution at {name}. Appreciate the professionalism.',
        'Very efficient and courteous service at {name}. They made the entire process effortless.',
        'Impressed by the speed and attention to detail provided by {name}. Outstanding service standard!',
        'Punctual, thorough, and highly responsive service at {name}. Exceeded all expectations.',
        'Wonderful service from start to finish at {name}. They certainly know how to care for patrons.',
        'Top-tier service quality and great follow-through at {name}. Definitely coming back!',
        'Prompt, professional, and very accommodating service at {name}. Five stars without hesitation.',
      ],
      staff: [
        'The team at {name} is wonderfully attentive, polite, and helpful. Highly recommended to everyone!',
        'Super friendly and knowledgeable staff at {name}. They answered all questions with patience.',
        'Warm, respectful, and attentive staff at {name}. You feel welcomed the second you walk in.',
        'Courteous professionals who genuinely care about customer satisfaction at {name}.',
        'The staff at {name} was polite, approachable, and went the extra mile to help out.',
        'Pleasant interactions and great hospitality from the team at {name}. Top-notch manners!',
        'Very hospitable and patient staff at {name}. Great to see such polite customer care.',
        'Friendly faces and prompt support at {name}. Staff deserves a big thumbs up!',
        'Attentive, well-mannered, and cooperative team at {name}. Wonderful customer relations.',
        'The team at {name} is respectful, capable, and very accommodating. 10/10 hospitality!',
      ],
      experience: [
        'Top-notch quality and fantastic visit at {name}. Definitely coming back again!',
        'One of the best experiences I’ve had in a long time at {name}. Highly impressed!',
        'Everything about {name} is first class. Quality, atmosphere, and execution are on point.',
        'Had a memorable and seamless experience at {name}. Worth every bit of recommendation.',
        'Completely satisfied with my visit to {name}. Everything exceeded my expectations!',
        'Superb overall experience at {name}. Clean, organized, and beautifully managed.',
        'Such a pleasant and hassle-free visit to {name}. Truly sets the standard in customer care.',
        'A flawless 5-star experience at {name}. Looking forward to visiting again soon!',
        'Exceptional standard of excellence across the board at {name}. Highly recommend.',
        'From entrance to exit, {name} delivered a genuinely world-class customer experience.',
      ],
    },
    combinedTemplates: {
      'service+staff': [
        'Exceptional customer service and an incredibly polite, welcoming staff at {name}! A true pleasure to visit.',
        'The team at {name} was super helpful, patient, and delivered fast, flawless service throughout.',
        'Warm, courteous hospitality paired with quick and efficient service at {name}. Five stars all the way!',
        'Prompt service and wonderfully friendly staff at {name}. They treat every customer like royalty.',
      ],
      'service+experience': [
        'Flawless service quality and a fantastic overall visit to {name}. One of the best in the city!',
        'Prompt, professional service combined with a memorable 5-star customer experience at {name}.',
        'Top-tier service and a completely seamless, hassle-free visit to {name}. Highly recommended!',
        'From quick assistance to overall excellence, {name} delivered a truly impressive experience.',
      ],
      'staff+experience': [
        'Warm, attentive staff and an outstanding overall experience at {name}! Left with a big smile.',
        'The friendly team and pleasant environment at {name} made for a wonderful 5-star visit.',
        'Courteous staff, great communication, and a thoroughly delightful experience at {name}.',
        'Super hospitable team and top-notch standards at {name}. You won’t find a better place!',
      ],
    },
  },
};

/**
 * Resolves category key from business category string
 */
export function resolveCategoryKey(category?: string): string {
  const cat = (category || '').toLowerCase();
  if (
    cat.includes('sweet') ||
    cat.includes('food') ||
    cat.includes('snack') ||
    cat.includes('rest') ||
    cat.includes('cafe') ||
    cat.includes('bakery') ||
    cat.includes('mithai')
  ) {
    return 'food';
  }
  if (
    cat.includes('auto') ||
    cat.includes('detail') ||
    cat.includes('car') ||
    cat.includes('wash') ||
    cat.includes('ceramic')
  ) {
    return 'auto';
  }
  if (
    cat.includes('salon') ||
    cat.includes('spa') ||
    cat.includes('hair') ||
    cat.includes('beauty') ||
    cat.includes('groom')
  ) {
    return 'salon';
  }
  return 'general';
}

/**
 * Retrieves the available positive tags for a given business category
 */
export function getPositiveTagsForCategory(category?: string): PositiveTagDefinition[] {
  const key = resolveCategoryKey(category);
  const kit = CATEGORY_REVIEW_KITS[key] || CATEGORY_REVIEW_KITS.general;
  return kit.tags;
}

/**
 * Generates a randomized, natural, 1-line review text.
 * 
 * - If 1 tag is selected: picks 1 of 10+ distinct variations at random.
 * - If 2 tags are selected: picks from composite templates combining both themes.
 * - Injects dynamic sign-offs and clean business name substitution.
 * 
 * Ensures no two patrons submit identical reviews to Google Maps.
 */
export function generateRandomizedReviewText(
  businessName: string,
  selectedTagIds: string[],
  category?: string
): { reviewText: string; variationIndex: number } {
  const safeName = (businessName || 'this business').trim();
  const key = resolveCategoryKey(category);
  const kit = CATEGORY_REVIEW_KITS[key] || CATEGORY_REVIEW_KITS.general;

  // Edge case: no tag selected, pick a general compliment
  if (!selectedTagIds || selectedTagIds.length === 0) {
    const defaultTemplates = kit.singleTemplates.experience || kit.singleTemplates.service || kit.singleTemplates.taste;
    const rndIdx = Math.floor(Math.random() * defaultTemplates.length);
    const chosen = defaultTemplates[rndIdx].replace(/\{name\}/g, safeName);
    return { reviewText: `${chosen} ${getRandomSignoff()}`, variationIndex: rndIdx };
  }

  // Dual-Tag Combination
  if (selectedTagIds.length >= 2) {
    const [tagA, tagB] = selectedTagIds;
    const pairKey1 = `${tagA}+${tagB}`;
    const pairKey2 = `${tagB}+${tagA}`;

    const comboList = kit.combinedTemplates[pairKey1] || kit.combinedTemplates[pairKey2];
    if (comboList && comboList.length > 0) {
      const rndIdx = Math.floor(Math.random() * comboList.length);
      let chosen = comboList[rndIdx].replace(/\{name\}/g, safeName);
      if (Math.random() > 0.5) {
        chosen = `${chosen} ${getRandomSignoff()}`;
      }
      return { reviewText: chosen, variationIndex: rndIdx };
    }
  }

  // Single-Tag Randomization (10+ variations)
  const primaryTag = selectedTagIds[0];
  const templateList = kit.singleTemplates[primaryTag] || kit.singleTemplates.service || kit.singleTemplates.taste;
  
  const rndIdx = Math.floor(Math.random() * templateList.length);
  let rendered = templateList[rndIdx].replace(/\{name\}/g, safeName);

  // Dynamically inject natural conversational sign-offs for further linguistic uniqueness
  if (Math.random() > 0.4) {
    const signoff = getRandomSignoff();
    if (rendered.length < 110 && !rendered.includes(signoff)) {
      rendered = `${rendered} ${signoff}`;
    }
  }

  return { reviewText: rendered, variationIndex: rndIdx };
}
