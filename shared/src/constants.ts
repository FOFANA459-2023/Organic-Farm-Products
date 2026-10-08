export const DISTRICTS = [
  "Berea",
  "Butha-Buthe",
  "Leribe",
  "Mafeteng",
  "Maseru",
  "Mohale's Hoek",
  "Mokhotlong",
  "Qacha's Nek",
  "Quthing",
  "Thaba-Tseka",
] as const;
export type District = (typeof DISTRICTS)[number];

export const CUSTOMER_TYPES = [
  "individual",
  "restaurant",
  "hotel",
  "retailer",
  "wholesaler",
  "institution",
  "other",
] as const;
export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  individual: "Individual / family",
  restaurant: "Restaurant",
  hotel: "Hotel / guesthouse",
  retailer: "Supermarket / retailer",
  wholesaler: "Wholesaler",
  institution: "School / institution",
  other: "Other business",
};

export const AVAILABILITY = ["available", "coming_soon", "seasonal", "out_of_stock"] as const;
export type Availability = (typeof AVAILABILITY)[number];

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  available: "Available",
  coming_soon: "Coming soon",
  seasonal: "Seasonal",
  out_of_stock: "Out of stock",
};

export const ORDER_STATUSES = ["new", "confirmed", "ready", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ENQUIRY_TYPES = ["wholesale", "notify", "contact"] as const;
export type EnquiryType = (typeof ENQUIRY_TYPES)[number];

export const ENQUIRY_STATUSES = ["new", "handled"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const FULFILMENT = ["delivery", "pickup"] as const;
export type Fulfilment = (typeof FULFILMENT)[number];

export const CURRENCY = "LSL";
export const MAX_CART_QTY = 999;
