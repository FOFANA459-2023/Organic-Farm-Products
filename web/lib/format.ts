export const telHref = (n: string) => `tel:${n.replace(/[^\d+]/g, "")}`;

/** Settings phone fields may hold text like "To be announced". */
export const isPhoneNumber = (n: string) => n.replace(/\D/g, "").length >= 6;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
