/**
 * Curated Unsplash images (auto=format for WebP where supported).
 * License: https://unsplash.com/license
 */
const q = (w) => `auto=format&fit=crop&w=${w}&q=80`;

export const SITE_IMAGES = {
  hero: `https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?${q(1400)}`,
  featureMeals: `https://images.unsplash.com/photo-1490645935967-10de6ba17061?${q(800)}`,
  featureNutrition: `https://images.unsplash.com/photo-1493770348161-369560ae357d?${q(800)}`,
  featureProgress: `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?${q(800)}`,
  authLogin: `https://images.unsplash.com/photo-1512621776951-a57141f2eefd?${q(900)}`,
  authRegister: `https://images.unsplash.com/photo-1490818387583-1baba5e63850?${q(900)}`,
  dashboardBanner: `https://images.unsplash.com/photo-1498837167922-cddd18eae914?${q(1200)}`,
  mealsHeader: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?${q(1200)}`,
  progressHeader: `https://images.unsplash.com/photo-1547592166-23ef457205c8?${q(1200)}`,
  cta: `https://images.unsplash.com/photo-1504674900247-0877df9cc836?${q(1400)}`,
};
