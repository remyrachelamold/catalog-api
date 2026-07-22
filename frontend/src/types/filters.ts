export type SortOption =
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name-asc", label: "Name: A → Z" },
  { value: "name-desc", label: "Name: Z → A" },
];

export const ALL_CATEGORIES = "all";
