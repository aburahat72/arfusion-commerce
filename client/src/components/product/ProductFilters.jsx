import { SlidersHorizontal, X } from "lucide-react";

import Button from "../ui/Button";
import Select from "../ui/Select";

function ProductFilters({
  category = "",
  setCategory,
  sort = "",
  setSort,
  minPrice = "",
  setMinPrice,
  maxPrice = "",
  setMaxPrice,
  onClear,
}) {
  const categoryOptions = [
    {
      value: "",
      label: "All Categories",
    },
    {
      value: "electronics",
      label: "Electronics",
    },
    {
      value: "fashion",
      label: "Fashion",
    },
    {
      value: "shoes",
      label: "Shoes",
    },
    {
      value: "beauty",
      label: "Beauty",
    },
    {
      value: "furniture",
      label: "Furniture",
    },
    {
      value: "sports",
      label: "Sports",
    },
  ];

  const sortOptions = [
    {
      value: "featured",
      label: "Featured",
    },
    {
      value: "price-low",
      label: "Price: Low to High",
    },
    {
      value: "price-high",
      label: "Price: High to Low",
    },
    {
      value: "rating",
      label: "Highest Rated",
    },
    {
      value: "newest",
      label: "Newest",
    },
  ];

  return (
    <aside className="rounded-2xl border border-outline-variant bg-surface p-5">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={19} className="text-primary" />

          <h2 className="text-base font-semibold text-text">Filters</h2>
        </div>

        <Button variant="text" size="small" onClick={onClear}>
          <X size={15} />
          Clear
        </Button>
      </div>

      {/* Category */}
      <div className="border-t border-outline-variant pt-5">
        <Select
          label="Category"
          name="category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          options={categoryOptions}
        />
      </div>

      {/* Price */}
      <div className="mt-5 border-t border-outline-variant pt-5">
        <h3 className="mb-3 text-sm font-semibold text-text">Price Range</h3>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder="Min"
            className="
              min-h-11
              w-full
              rounded-xl
              border
              border-outline-variant
              bg-surface
              px-3
              text-sm
              text-text
              outline-none
              transition
              focus:border-primary
              focus:ring-2
              focus:ring-primary/20
            "
          />

          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="Max"
            className="
              min-h-11
              w-full
              rounded-xl
              border
              border-outline-variant
              bg-surface
              px-3
              text-sm
              text-text
              outline-none
              transition
              focus:border-primary
              focus:ring-2
              focus:ring-primary/20
            "
          />
        </div>
      </div>

      {/* Sort */}
      <div className="mt-5 border-t border-outline-variant pt-5">
        <Select
          label="Sort By"
          name="sort"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          placeholder="Sort products"
          options={sortOptions}
        />
      </div>
    </aside>
  );
}

export default ProductFilters;
