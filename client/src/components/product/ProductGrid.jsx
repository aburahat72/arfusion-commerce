import ProductCard from "./ProductCard";

function ProductGrid({ products = [] }) {
  /* =====================================================
     NO PRODUCTS
  ===================================================== */

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-outline-variant bg-surface p-10 text-center">
        <h3 className="text-lg font-semibold text-text">No products found</h3>

        <p className="mt-2 text-sm text-text-secondary">
          Try changing your filters or search criteria.
        </p>
      </div>
    );
  }

  /* =====================================================
     REAL PRODUCT GRID
  ===================================================== */

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product._id || product.id || product.name}
          product={product}
        />
      ))}
    </div>
  );
}

export default ProductGrid;
