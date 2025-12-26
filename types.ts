
export enum AspectRatio {
  SQUARE = "1:1",
  PORTRAIT_4_5 = "3:4", // Mapping 4:5 to 3:4 as 4:5 isn't supported by Flash Image
  PANORAMA_8_3 = "16:9", // Mapping 8:3 to 16:9 
  LANDSCAPE_3_2 = "4:3", // Mapping 3:2 to 4:3
  MOBILE_9_16 = "9:16",
  LANDSCAPE_16_9 = "16:9"
}

export enum ProductCategory {
  FOOD = "Food",
  SNACKS = "Snacks/Confectionery",
  DRINKS = "Beverages",
  SHAMPOO = "Shampoo",
  BODY_WASH = "Body Wash",
  PERSONAL_CARE = "Personal Care",
  GIFT_COMBO = "Gift Combo"
}

export enum PhotoStyleCategory {
  STUDIO = "Studio / E-commerce",
  CREATIVE = "Creative Concept",
  LIFESTYLE = "Lifestyle",
  FLAT_LAY = "Flat Lay",
  MACRO = "Macro Detail"
}

export interface PhotoStyleOption {
  id: string;
  label: string;
  description: string;
  category: PhotoStyleCategory;
}

// New Types for Banner Mode
export enum AppMode {
  PHOTO = "PHOTO",
  BANNER = "BANNER"
}

export interface BannerStyleOption {
  id: string;
  label: string;
  description: string;
}

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
}

export interface AppState {
  mode: AppMode; // New: Track current mode
  productDescription: string;
  aspectRatio: AspectRatio;
  productCategory: ProductCategory;
  selectedStyleId: string; // Used for Photo Mode
  selectedBannerStyleId: string; // New: Used for Banner Mode
  inputImages: UploadedImage[];
  selectedImageId: string | null;
}

export interface GeneratedImage {
  id: string;
  url: string;
  promptUsed: string;
}
