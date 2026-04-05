export interface Sticker {
  id: string;
  name: string;
  image: string;
  price: number;
  category_id: string;
  featured?: boolean;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  emoji: string;
  color: string;
}

const SB = 'https://zkhhlnikjdwkjtzjsgme.supabase.co/storage/v1/object/public/sticker-images';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'lunar', name: 'Lunar New Year', emoji: '🏮', color: 'from-orange-400 to-red-500', description: 'Celebrate the new year with these festive duck stickers!' },
  { id: 'glass', name: 'Go For Glass Collab', emoji: '🦆', color: 'from-blue-400 to-cyan-500', description: 'Special collab collection with Go For Glass!' },
  { id: 'og', name: 'OG Collection', emoji: '⭐', color: 'from-yellow-400 to-amber-500', description: 'The original Derpy Derps sticker collection.' },
  { id: 'winter', name: 'Winter Collection', emoji: '❄️', color: 'from-sky-300 to-blue-500', description: 'Cozy winter vibes with your favorite derpy ducks.' },
  { id: 'fall2', name: 'Fall Collection Part 2', emoji: '🍁', color: 'from-amber-500 to-orange-600', description: 'More fall fun with part 2 of the fall collection!' },
  { id: 'fall1', name: 'Fall Collection Part 1', emoji: '🍂', color: 'from-orange-400 to-yellow-500', description: 'Autumn leaves and pumpkin spice ducks.' },
];

export const DEFAULT_STICKERS: Sticker[] = [
  // Lunar New Year
  { id: 'kimchi', name: 'Kimchi Duck', image: `${SB}/a379f657-49b1-403b-83c2-f6d9322d714c.jpeg`, price: 3.99, category_id: 'lunar', featured: true },
  { id: 'dumpling', name: 'Dumpling Duck', image: `${SB}/b1352797-da4d-4f8e-b9e5-be8093c2f9f3.jpeg`, price: 3.99, category_id: 'lunar' },
  { id: 'ramen', name: 'Ramen Duck', image: `${SB}/55033240-43f9-4d0d-95d6-69454b528b0e.JPG`, price: 3.99, category_id: 'lunar', featured: true },
  // Go For Glass Collab
  { id: 'deca', name: 'Derpy and Dee Win DECA Glass!', image: `${SB}/0ca0fbbb-2d35-476e-aa8c-94144d28a080.jpeg`, price: 4.99, category_id: 'glass', featured: true },
  { id: 'swim', name: 'Derpy and Dee Go For a Swim', image: `${SB}/72d73e0a-9978-409d-bb63-009940f3080d.jpeg`, price: 4.99, category_id: 'glass' },
  { id: 'help', name: 'Dee, Help Derpy!', image: `${SB}/e68c94a8-f5c4-4934-bb7d-867ee00e685a.jpeg`, price: 4.99, category_id: 'glass' },
  // OG Collection
  { id: 'shark-nobg', name: 'Shark Ducko (No Background)', image: `${SB}/f823ec66-5334-4381-bcbd-c60996a130e0.jpg`, price: 3.49, category_id: 'og', featured: true },
  { id: 'shark', name: 'Shark Ducko', image: `${SB}/181b51c4-1404-47b7-81f1-b73fd1f26b4b.jpg`, price: 3.49, category_id: 'og' },
  { id: 'dino', name: 'Dino Ducko', image: `${SB}/c52228cc-be8b-492e-9d6a-f7579beb6ead.jpg`, price: 3.49, category_id: 'og', featured: true },
  { id: 'boba', name: 'Boba Duck', image: `${SB}/5f6348d5-8285-4fad-a9ca-c9f3edb00e8b.jpg`, price: 3.49, category_id: 'og' },
  { id: 'logo', name: 'Derpy Derps Logo', image: `${SB}/59654b42-a909-4300-908e-8d73e64f4b93.png`, price: 2.99, category_id: 'og' },
  // Winter Collection
  { id: 'sled', name: 'Sledding Duck', image: `${SB}/24e95fd8-40a3-4a04-9620-7b4257097785.jpeg`, price: 3.99, category_id: 'winter', featured: true },
  { id: 'cocoa', name: 'Hot Cocoa Duck', image: `${SB}/802aa483-db8c-47c6-8fb7-164af5d19850.jpeg`, price: 3.99, category_id: 'winter' },
  { id: 'snowman', name: 'Snowman Duck', image: `${SB}/8a40f583-a962-4d82-8ae3-f86bf047c6b0.jpg`, price: 3.99, category_id: 'winter' },
  // Fall Collection Part 2
  { id: 'smores', name: "S'mores Duck", image: `${SB}/348f3333-07e4-4c02-9b29-b25a466c2d08.jpg`, price: 3.99, category_id: 'fall2' },
  { id: 'farmer', name: 'Farmer Duck', image: `${SB}/806b3730-f22f-402b-a180-0f36a31198e8.jpg`, price: 3.99, category_id: 'fall2' },
  // Fall Collection Part 1
  { id: 'pumpkin', name: 'Pumpkin Ducko', image: `${SB}/a92f11a9-a0ee-46bd-8bf2-9ea579404f3d.jpg`, price: 3.99, category_id: 'fall1', featured: true },
  { id: 'caramel', name: 'Caramel Apple Ducko', image: `${SB}/7ec2301b-32e6-4ca6-9e70-044c89a7f252.jpg`, price: 3.99, category_id: 'fall1' },
  { id: 'pie', name: 'Pumpkin Pie Duck', image: `${SB}/ab0478d0-a850-4ac3-9189-d9bc87062f08.jpg`, price: 3.99, category_id: 'fall1' },
  { id: 'leaves', name: 'Leaf Jumping Duck', image: `${SB}/d7af5f74-309b-4f33-8c74-4321beb50564.jpg`, price: 3.99, category_id: 'fall1' },
];

// --- LocalStorage persistence ---
const STICKERS_KEY = 'dd_stickers';
const CATEGORIES_KEY = 'dd_categories';
const ADMIN_KEY = 'dd_admin';

export function getStickers(): Sticker[] {
  try {
    const stored = localStorage.getItem(STICKERS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_STICKERS;
  } catch { return DEFAULT_STICKERS; }
}

export function getCategories(): Category[] {
  try {
    const stored = localStorage.getItem(CATEGORIES_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
  } catch { return DEFAULT_CATEGORIES; }
}

export function saveStickers(stickers: Sticker[]) {
  localStorage.setItem(STICKERS_KEY, JSON.stringify(stickers));
}

export function saveCategories(categories: Category[]) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export function isAdminLoggedIn(): boolean {
  return localStorage.getItem(ADMIN_KEY) === 'true';
}

export function adminLogin(password: string): boolean {
  const valid = password === 'duckoneedsaname';
  if (valid) localStorage.setItem(ADMIN_KEY, 'true');
  return valid;
}

export function adminLogout() {
  localStorage.removeItem(ADMIN_KEY);
}
