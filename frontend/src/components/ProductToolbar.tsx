import type { SortOption } from "../types/filters";
import { ALL_CATEGORIES, SORT_OPTIONS } from "../types/filters";
import "./ProductToolbar.css";

interface ProductToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  sortOption: SortOption;
  onSortChange: (value: SortOption) => void;
  categories: string[];
}

export default function ProductToolbar({
  searchQuery,
  onSearchChange,
  category,
  onCategoryChange,
  sortOption,
  onSortChange,
  categories,
}: ProductToolbarProps) {
  return (
    <div className="product-toolbar">
      <div className="product-toolbar__group product-toolbar__group--search">
        <label htmlFor="product-search">Search</label>
        <input
          id="product-search"
          type="search"
          placeholder="Search by product name..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="product-toolbar__group">
        <label htmlFor="product-category">Category</label>
        <select
          id="product-category"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          <option value={ALL_CATEGORIES}>All Categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="product-toolbar__group">
        <label htmlFor="product-sort">Sort By</label>
        <select
          id="product-sort"
          value={sortOption}
          onChange={(event) => onSortChange(event.target.value as SortOption)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
