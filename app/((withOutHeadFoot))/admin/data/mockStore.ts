"use client";

// Define Data interfaces
export interface Product {
  id: string;
  name: string;
  category: string;
  type: string;
  topPick: boolean;
  exclusive: boolean;
  price: number;
  status: string;
  imgUrl: string;
  descriptions?: string[];
  specifications?: { key: string; value: string }[];
}

export interface Category {
  id: string;
  name: string;
  desc: string;
  imgUrl: string;
  productType?: string;
}

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  status: string;
}

export interface Feedback {
  id: string;
  customer: string;
  email: string;
  rating: number;
  feedback: string;
  date: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  signupDate: string;
  lastLogin: string;
  status: string;
  address: string;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  time: string;
}

export interface NotificationItem {
  id: string;
  message: string;
  read: boolean;
}

const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Fabric", desc: "Curated selection of premium raw linen and cotton fabric rolls.", imgUrl: "/images/home/cat-01.webp", productType: "Shirt" },
  { id: "cat-2", name: "Ready to wear", desc: "Pre-stitched classic and modern lifestyle linen collections.", imgUrl: "/images/home/Top-Pick01.webp", productType: "Shirt" },
  { id: "cat-3", name: "Made to wear", desc: "Sized collections crafted upon selection with detailed sizing.", imgUrl: "/images/home/Top-Pick02.webp", productType: "Shirt" },
  { id: "cat-4", name: "Be Spoke", desc: "Custom designed premium luxury outfits tailored precisely to measure.", imgUrl: "/images/home/Top-Pick03.webp", productType: "Shirt" }
];

const INITIAL_PRODUCTS: Product[] = [
  { id: "p-1", name: "Riviera Classic Shirt — Natural", category: "Ready to wear", type: "Shirt", topPick: true, exclusive: false, status: "Active", price: 2999, imgUrl: "/images/home/Top-Pick01.webp" },
  { id: "p-2", name: "Serein Linen Shirt — Mist Green", category: "Ready to wear", type: "Shirt", topPick: true, exclusive: true, status: "Active", price: 3499, imgUrl: "/images/home/Top-Pick02.webp" },
  { id: "p-3", name: "Classic Linen Trouser — Cream", category: "Ready to wear", type: "Trouser", topPick: false, exclusive: true, status: "Active", price: 2799, imgUrl: "/images/home/Top-Pick03.webp" },
  { id: "p-4", name: "Bespoke Summer Blazer — Indigo", category: "Be Spoke", type: "Blazer", topPick: true, exclusive: true, status: "Active", price: 8999, imgUrl: "/images/home/Top-Pick04.webp" },
  { id: "p-5", name: "Raw Linen Fabric — Off-White", category: "Fabric", type: "Fabric", topPick: false, exclusive: false, status: "Active", price: 899, imgUrl: "/images/home/cat-01.webp" },
  { id: "p-6", name: "Bespoke Royal Suit — Jet Black", category: "Be Spoke", type: "Suit", topPick: true, exclusive: false, status: "Draft", price: 14999, imgUrl: "/images/home/Top-Pick01.webp" }
];

const INITIAL_CONTACT_REQUESTS: ContactRequest[] = [
  { id: "c-1", name: "Aravind Swamy", email: "aravind@gmail.com", phone: "+91 98450 12345", message: "Interested in bulk order of raw linen fabric for boutique design.", date: "2026-06-28", status: "Pending" },
  { id: "c-2", name: "Meera Nair", email: "meera.nair@outlook.com", phone: "+91 99456 78901", message: "Can we schedule a custom fitting session for be spoke bridal outfits next Tuesday?", date: "2026-06-25", status: "Resolved" },
  { id: "c-3", name: "John Doe", email: "johndoe@yahoo.com", phone: "+1 415 889 0122", message: "Do you ship your be spoke blazers to San Francisco? If so, what are shipping options?", date: "2026-06-24", status: "Pending" }
];

const INITIAL_FEEDBACKS: Feedback[] = [
  { id: "f-1", customer: "Vikram Sen", email: "vikram.s@gmail.com", rating: 5, feedback: "The Riviera shirt is exceptionally comfortable and breathable. The gold certification badge is well deserved!", date: "2026-06-27" },
  { id: "f-2", customer: "Priyanka Roy", email: "priyanka.roy@gmail.com", rating: 4, feedback: "Fabric quality of the made to wear trousers is premium. Fast delivery to metros too.", date: "2026-06-26" },
  { id: "f-3", customer: "Suhail Ahmed", email: "suhail.ahmed@yahoo.com", rating: 5, feedback: "Absolutely love the bespoke fitting. The material feels premium luxury.", date: "2026-06-22" }
];

const INITIAL_USERS: UserAccount[] = [
  { id: "u-1", name: "Rahul Sharma", email: "rahul.sharma@gmail.com", phone: "+91 98765 43210", signupDate: "2026-05-15", lastLogin: "2026-06-29 14:32", status: "Active", address: "123 Cross Cut Road Apt 4B, Blue Sky Towers, Coimbatore, Tamil Nadu, 641012" },
  { id: "u-2", name: "Ananya Iyer", email: "ananya.iyer@gmail.com", phone: "+91 99887 76655", signupDate: "2026-06-01", lastLogin: "2026-06-28 09:15", status: "Active", address: "89 Gandhi Road, Adyar, Chennai, Tamil Nadu, 600020" },
  { id: "u-3", name: "Michael Vance", email: "michael.v@gmail.com", phone: "+1 650 302 4492", signupDate: "2026-06-18", lastLogin: "2026-06-29 20:05", status: "Active", address: "555 Golden Gate Avenue, San Francisco, California, 94102" },
  { id: "u-4", name: "G-User (Google Account)", email: "vlglobaltester@gmail.com", phone: "G-9944944255", signupDate: "2026-06-29", lastLogin: "2026-06-29 23:01", status: "Active", address: "No address registered." }
];

const INITIAL_ACTIVITIES: Activity[] = [
  { id: "a-1", user: "Admin", action: "Added product 'Riviera Classic Shirt'", time: "2 hours ago" },
  { id: "a-2", user: "Rahul Sharma", action: "Updated shipping address", time: "5 hours ago" },
  { id: "a-3", user: "Ananya Iyer", action: "Logged in via Google Login", time: "1 day ago" },
  { id: "a-4", user: "Admin", action: "Resolved contact request #c-2", time: "2 days ago" }
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: "n-1", message: "New contact request submitted by Aravind Swamy.", read: false },
  { id: "n-2", message: "New user feedback received from Vikram Sen.", read: false },
  { id: "n-3", message: "Google Auth configured successfully in frontend.", read: true }
];

// Helper to safe-read from localStorage
export const getStorageData = <T>(key: string, initialData: T): T => {
  if (typeof window === "undefined") return initialData;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialData;
  } catch (error) {
    console.error("Error reading localStorage key", key, error);
    return initialData;
  }
};

// Helper to safe-write to localStorage
export const setStorageData = <T>(key: string, data: T): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error writing localStorage key", key, error);
  }
};

// Database store wrappers
export const getProducts = () => getStorageData<Product[]>("vl_admin_products", INITIAL_PRODUCTS);
export const setProducts = (p: Product[]) => setStorageData<Product[]>("vl_admin_products", p);

export const getCategories = () => getStorageData<Category[]>("vl_admin_categories", INITIAL_CATEGORIES);
export const setCategories = (c: Category[]) => setStorageData<Category[]>("vl_admin_categories", c);

export const getContactRequests = () => getStorageData<ContactRequest[]>("vl_admin_contacts", INITIAL_CONTACT_REQUESTS);
export const setContactRequests = (c: ContactRequest[]) => setStorageData<ContactRequest[]>("vl_admin_contacts", c);

export const getFeedbacks = () => getStorageData<Feedback[]>("vl_admin_feedbacks", INITIAL_FEEDBACKS);
export const setFeedbacks = (f: Feedback[]) => setStorageData<Feedback[]>("vl_admin_feedbacks", f);

export const getUsers = () => getStorageData<UserAccount[]>("vl_admin_users", INITIAL_USERS);
export const setUsers = (u: UserAccount[]) => setStorageData<UserAccount[]>("vl_admin_users", u);

export const getActivities = () => getStorageData<Activity[]>("vl_admin_activities", INITIAL_ACTIVITIES);
export const setActivities = (a: Activity[]) => setStorageData<Activity[]>("vl_admin_activities", a);

export const getNotifications = () => getStorageData<NotificationItem[]>("vl_admin_notifications", INITIAL_NOTIFICATIONS);
export const setNotifications = (n: NotificationItem[]) => setStorageData<NotificationItem[]>("vl_admin_notifications", n);

const INITIAL_PRODUCT_TYPES = ["Shirt", "Towel"];
export const getProductTypes = () => getStorageData<string[]>("vl_admin_product_types", INITIAL_PRODUCT_TYPES);
export const setProductTypes = (t: string[]) => setStorageData<string[]>("vl_admin_product_types", t);
