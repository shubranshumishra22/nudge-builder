import type { StoreConfig, BusinessType } from './schema'

function makeConfig(overrides: Partial<StoreConfig> & { business_type: BusinessType }): StoreConfig {
  const defaults: StoreConfig = {
    business_name: '',
    business_type: 'generic',
    tagline: 'Welcome to our store',
    description: 'We offer quality products and services.',
    theme: {
      primary_color: '#4F46E5',
      accent_color: '#F59E0B',
      font_style: 'modern',
    },
    sections: ['hero', 'products', 'about', 'contact'],
    suggested_products: [],
    seo: {
      title: 'My Store — Shop Online',
      description: 'Discover quality products at great prices.',
    },
  }
  return { ...defaults, ...overrides } as StoreConfig
}

export function getDefaultConfig(businessType: BusinessType): StoreConfig {
  const configs: Record<BusinessType, StoreConfig> = {
    cafe: makeConfig({
      business_type: 'cafe',
      tagline: 'Brewed to perfection, served with love',
      description: 'A cozy neighbourhood cafe serving fresh coffee, teas, and light bites in a warm, inviting atmosphere.',
      theme: {
        primary_color: '#8B4513',
        accent_color: '#D2B48C',
        font_style: 'classic',
      },
      sections: ['hero', 'products', 'about', 'contact', 'testimonials'],
      suggested_products: [
        { name: 'Filter Coffee', price: 40, description: 'Classic South Indian filter coffee brewed fresh', category: 'beverages' },
        { name: 'Cold Brew', price: 120, description: 'Slow-steeped 12-hour cold brew with smooth finish', category: 'beverages' },
        { name: 'Croissant', price: 80, description: 'Buttery, flaky croissant baked fresh every morning', category: 'bakery' },
      ],
      seo: { title: 'Cafe — Fresh Coffee & Bites', description: 'Visit our cafe for freshly brewed coffee, teas, and baked goods in a cosy setting.' },
    }),
    bakery: makeConfig({
      business_type: 'bakery',
      tagline: 'Freshly baked happiness every day',
      description: 'Artisanal bakery offering handcrafted breads, pastries, cakes, and custom bakes made with love.',
      theme: {
        primary_color: '#D2691E',
        accent_color: '#FFF8DC',
        font_style: 'playful',
      },
      sections: ['hero', 'products', 'about', 'testimonials', 'contact', 'faq'],
      suggested_products: [
        { name: 'Sourdough Loaf', price: 180, description: 'Slow-fermented sourdough with a crisp crust', category: 'breads' },
        { name: 'Chocolate Croissant', price: 95, description: 'Flaky croissant filled with rich dark chocolate', category: 'pastries' },
        { name: 'Eggless Birthday Cake', price: 650, description: 'Custom eggless cake, serves 8–10 people', category: 'cakes' },
      ],
      seo: { title: 'Bakery — Fresh Breads & Pastries', description: 'Artisanal bakery with handcrafted breads, pastries, and custom cakes. Freshly baked daily.' },
    }),
    clothing: makeConfig({
      business_type: 'clothing',
      tagline: 'Style that speaks',
      description: 'Contemporary fashion brand offering curated clothing for men and women. Trendy designs, premium fabrics.',
      theme: {
        primary_color: '#1a1a2e',
        accent_color: '#E2E8F0',
        font_style: 'modern',
      },
      sections: ['hero', 'products', 'about', 'testimonials', 'contact'],
      suggested_products: [
        { name: 'Linen Shirt', price: 899, description: 'Breathable pure linen shirt perfect for summer', category: 'men' },
        { name: 'Kurta Set', price: 1299, description: 'Cotton kurta with matching pyjama set', category: 'women' },
      ],
      seo: { title: 'Clothing Store — Trendy Fashion', description: 'Discover the latest fashion trends. Premium quality clothing for men and women at affordable prices.' },
    }),
    fitness: makeConfig({
      business_type: 'fitness',
      tagline: 'Transform your body, transform your life',
      description: 'Modern fitness studio offering group classes, personal training, and wellness programs for all fitness levels.',
      theme: {
        primary_color: '#059669',
        accent_color: '#FCD34D',
        font_style: 'minimal',
      },
      sections: ['hero', 'about', 'products', 'testimonials', 'contact'],
      suggested_products: [
        { name: 'Monthly Membership', price: 1499, description: 'Unlimited access to all group classes for a month', category: 'memberships' },
        { name: 'Personal Training Session', price: 599, description: 'One-on-one session with a certified trainer', category: 'training' },
        { name: 'Protein Shake', price: 199, description: 'Post-workout whey protein shake with banana', category: 'nutrition' },
      ],
      seo: { title: 'Fitness Studio — Get Fit', description: 'Join our fitness studio for group classes, personal training, and wellness programs. Transform your health today.' },
    }),
    handmade: makeConfig({
      business_type: 'handmade',
      tagline: 'Crafted with care, made for you',
      description: 'Handcrafted products made by local artisans. Each piece tells a story of tradition, skill, and love.',
      theme: {
        primary_color: '#B45309',
        accent_color: '#FEF3C7',
        font_style: 'playful',
      },
      sections: ['hero', 'products', 'about', 'testimonials', 'faq', 'contact'],
      suggested_products: [
        { name: 'Handwoven Tote Bag', price: 599, description: 'Eco-friendly cotton tote handwoven by local artisans', category: 'accessories' },
        { name: 'Scented Soy Candle', price: 349, description: 'Hand-poured soy candle with essential oils, burns 40+ hours', category: 'home' },
      ],
      seo: { title: 'Handmade — Artisan Crafts', description: 'Discover unique handcrafted products made by local artisans. Each piece is made with love and tradition.' },
    }),
    restaurant: makeConfig({
      business_type: 'restaurant',
      tagline: 'Authentic flavours, unforgettable moments',
      description: 'Family-run restaurant serving authentic regional cuisine made from traditional recipes and fresh ingredients.',
      theme: {
        primary_color: '#991B1B',
        accent_color: '#FEF2F2',
        font_style: 'classic',
      },
      sections: ['hero', 'products', 'about', 'testimonials', 'contact'],
      suggested_products: [
        { name: 'Butter Chicken Meal', price: 350, description: 'Creamy butter chicken with naan and rice', category: 'mains' },
        { name: 'Biryani (Chicken)', price: 280, description: 'Fragrant layered biryani with tender chicken', category: 'mains' },
        { name: 'Gulab Jamun (4 pcs)', price: 80, description: 'Soft milk dumplings soaked in rose syrup', category: 'desserts' },
      ],
      seo: { title: 'Restaurant — Authentic Cuisine', description: 'Experience authentic regional cuisine made from traditional recipes. Dine in or order online.' },
    }),
    beauty: makeConfig({
      business_type: 'beauty',
      tagline: 'Look good, feel beautiful',
      description: 'Premium beauty salon and spa offering haircare, skincare, makeup, and bridal services in a relaxing environment.',
      theme: {
        primary_color: '#BE185D',
        accent_color: '#FDF2F8',
        font_style: 'modern',
      },
      sections: ['hero', 'about', 'products', 'testimonials', 'contact'],
      suggested_products: [
        { name: 'Haircut & Blowdry', price: 499, description: 'Precision haircut with professional blowdry finish', category: 'hair' },
        { name: 'Facial (Gold)', price: 899, description: 'Luxurious gold-infused facial for glowing skin', category: 'skincare' },
        { name: 'Bridal Makeup', price: 4999, description: 'Complete bridal makeup package with trial session', category: 'makeup' },
      ],
      seo: { title: 'Beauty Salon — Hair & Skincare', description: 'Premium beauty salon offering haircare, skincare, makeup, and bridal services. Book your appointment today.' },
    }),
    generic: makeConfig({
      business_type: 'generic',
      tagline: 'Quality products for everyday needs',
      description: 'Your one-stop shop for quality products at affordable prices. We carefully curate every item we sell.',
      theme: {
        primary_color: '#4F46E5',
        accent_color: '#F59E0B',
        font_style: 'modern',
      },
      sections: ['hero', 'products', 'about', 'contact'],
      suggested_products: [
        { name: 'Featured Product', price: 499, description: 'Our most popular product, loved by customers', category: 'featured' },
        { name: 'Value Combo', price: 799, description: 'Curated combo offering the best value for money', category: 'combos' },
      ],
      seo: { title: 'My Store — Shop Online', description: 'Discover quality products at great prices. Fast delivery across India.' },
    }),
  }

  return configs[businessType]
}
