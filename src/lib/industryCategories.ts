// Industry-Specific Category Configurations for RepuBoost
// Enables dynamic feedback tags on /r/[slug] and tailored AI apology messages on the Complaints Desk
// Safe & Professional: Never promises unauthorized freebies or financial giveaways without store owner approval.

export interface IndustryCategoryConfig {
  id: string;
  categoryLabel: string;
  tags: string[];
  placeholder: string;
  apologyOffer: string;
  industryTerm: string;
}

export const INDUSTRY_CATEGORIES: Record<string, IndustryCategoryConfig> = {
  auto: {
    id: 'auto',
    categoryLabel: 'Automotive & Detailing',
    tags: [
      'Work Quality',
      'Paint & Polish Finish',
      'Delivery Delay',
      'Pricing Transparency',
      'Staff Courtesy',
      'Customer Lounge',
    ],
    placeholder: 'Tell us what went wrong (finishing quality, delivery delay, scratches, pricing)...',
    apologyOffer: 'personally make this right and ensure your vehicle receives our highest standard of care on your next visit',
    industryTerm: 'vehicle care & detailing standards',
  },
  food: {
    id: 'food',
    categoryLabel: 'Sweet Shop, Restaurant & Cafe',
    tags: [
      'Food Taste',
      'Freshness',
      'Service Speed',
      'Packaging & Takeout',
      'Staff Courtesy',
      'Hygiene & Cleanliness',
    ],
    placeholder: 'Tell us what went wrong (taste, freshness, wait time, order accuracy)...',
    apologyOffer: 'personally welcome you back and ensure a flawless 5-star experience on your next visit',
    industryTerm: 'freshness & culinary quality',
  },
  salon: {
    id: 'salon',
    categoryLabel: 'Salon, Spa & Grooming',
    tags: [
      'Service Quality',
      'Stylist Skill',
      'Wait Time',
      'Hygiene & Sanitization',
      'Staff Courtesy',
      'Pricing & Billing',
    ],
    placeholder: 'Tell us what went wrong (haircut, styling, service delay, comfort)...',
    apologyOffer: 'personally oversee your appointment to guarantee our highest standard of personal care',
    industryTerm: 'styling & personal care standards',
  },
  healthcare: {
    id: 'healthcare',
    categoryLabel: 'Healthcare & Dental Clinic',
    tags: [
      'Doctor Consultation',
      'Wait Time',
      'Treatment Quality',
      'Hygiene & Sanitization',
      'Staff Courtesy',
      'Billing Clarity',
    ],
    placeholder: 'Tell us what went wrong (wait time, consultation, diagnosis, staff courtesy)...',
    apologyOffer: 'personally review your concerns and ensure a seamless, priority experience on your next appointment',
    industryTerm: 'patient care & clinical hygiene',
  },
  fitness: {
    id: 'fitness',
    categoryLabel: 'Gym & Fitness Center',
    tags: [
      'Equipment Quality',
      'Trainer Attention',
      'Crowd & Spacing',
      'Locker & Shower Hygiene',
      'Air Conditioning',
      'Staff Courtesy',
    ],
    placeholder: 'Tell us what went wrong (equipment condition, trainer guidance, cleanliness)...',
    apologyOffer: 'personally address this and ensure your training sessions meet our highest facility standards',
    industryTerm: 'facility maintenance & training guidance',
  },
  retail: {
    id: 'retail',
    categoryLabel: 'Retail, Fashion & Shopping',
    tags: [
      'Product Quality',
      'Billing & Checkout Speed',
      'Staff Assistance',
      'Pricing & Discounts',
      'Return / Exchange',
      'Store Ambience',
    ],
    placeholder: 'Tell us what went wrong (product quality, billing delay, staff support)...',
    apologyOffer: 'personally assist you and ensure a smooth, premium shopping experience on your next visit',
    industryTerm: 'customer service & merchandise quality',
  },
  general: {
    id: 'general',
    categoryLabel: 'Local Business & Professional Services',
    tags: [
      'Service Quality',
      'Turnaround Time',
      'Staff Courtesy',
      'Pricing & Value',
      'Communication',
      'Overall Experience',
    ],
    placeholder: 'Tell us what went wrong so management can resolve this for you...',
    apologyOffer: 'personally resolve this for you and ensure a seamless 5-star experience on your next visit',
    industryTerm: 'customer satisfaction & service standards',
  },
};

/**
 * Automatically detects the appropriate industry category config based on client category string
 */
export function getCategoryConfig(rawCategory?: string): IndustryCategoryConfig {
  if (!rawCategory) return INDUSTRY_CATEGORIES.general;

  const cat = rawCategory.toLowerCase();

  // Automotive / Car Wash / Detailing
  if (
    cat.includes('detail') ||
    cat.includes('car') ||
    cat.includes('auto') ||
    cat.includes('vehic') ||
    cat.includes('wash') ||
    cat.includes('garage') ||
    cat.includes('motor') ||
    cat.includes('bike') ||
    cat.includes('repair') ||
    cat.includes('tyre') ||
    cat.includes('tire')
  ) {
    return INDUSTRY_CATEGORIES.auto;
  }

  // Food / Dining / Sweets / Bakery / Cafe
  if (
    cat.includes('sweet') ||
    cat.includes('food') ||
    cat.includes('restaurant') ||
    cat.includes('cafe') ||
    cat.includes('bakery') ||
    cat.includes('snack') ||
    cat.includes('mithai') ||
    cat.includes('dining') ||
    cat.includes('pizza') ||
    cat.includes('burger') ||
    cat.includes('tea') ||
    cat.includes('coffee') ||
    cat.includes('dhaba') ||
    cat.includes('bar') ||
    cat.includes('kitchen')
  ) {
    return INDUSTRY_CATEGORIES.food;
  }

  // Salon / Beauty / Spa / Grooming
  if (
    cat.includes('salon') ||
    cat.includes('spa') ||
    cat.includes('hair') ||
    cat.includes('beauty') ||
    cat.includes('parlour') ||
    cat.includes('parlor') ||
    cat.includes('groom') ||
    cat.includes('barber') ||
    cat.includes('skin') ||
    cat.includes('nail') ||
    cat.includes('makeup')
  ) {
    return INDUSTRY_CATEGORIES.salon;
  }

  // Healthcare / Dental / Clinic
  if (
    cat.includes('clinic') ||
    cat.includes('dent') ||
    cat.includes('health') ||
    cat.includes('doc') ||
    cat.includes('medic') ||
    cat.includes('hospital') ||
    cat.includes('pharma') ||
    cat.includes('physio') ||
    cat.includes('eye') ||
    cat.includes('care')
  ) {
    return INDUSTRY_CATEGORIES.healthcare;
  }

  // Gym / Fitness
  if (
    cat.includes('gym') ||
    cat.includes('fit') ||
    cat.includes('yoga') ||
    cat.includes('train') ||
    cat.includes('workout') ||
    cat.includes('crossfit') ||
    cat.includes('sport')
  ) {
    return INDUSTRY_CATEGORIES.fitness;
  }

  // Retail / Shopping
  if (
    cat.includes('retail') ||
    cat.includes('shop') ||
    cat.includes('store') ||
    cat.includes('cloth') ||
    cat.includes('jewel') ||
    cat.includes('fashion') ||
    cat.includes('mart') ||
    cat.includes('grocer') ||
    cat.includes('market') ||
    cat.includes('electr') ||
    cat.includes('shoe')
  ) {
    return INDUSTRY_CATEGORIES.retail;
  }

  return INDUSTRY_CATEGORIES.general;
}
