import { useParams } from "react-router-dom";

import ProductGallery from "../../components/product/ProductGallery";
import ProductInfo from "../../components/product/ProductInfo";
import ProductActions from "../../components/product/ProductActions";

import products from "../../data/products";

function ProductDetails() {
  const { productId } = useParams();

  /*
   * Support both:
   * - Local/static products: id
   * - Future MongoDB products: _id
   */
  const product = products.find(
    (item) => String(item.id || item._id) === String(productId),
  );

  /*
   * Product not found
   */
  if (!product) {
    return (
      <main className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-text">
            Product not found
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            The product you're looking for does not exist.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-text-secondary">
          <span>Home</span>

          <span className="mx-2">/</span>

          <span>Products</span>

          <span className="mx-2">/</span>

          <span className="font-medium text-text">{product.name}</span>
        </div>

        {/* Main product */}
        <div className="grid gap-8 rounded-3xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-8 lg:grid-cols-2 lg:p-10">
          {/* Product gallery */}
          <ProductGallery product={product} />

          {/* Product information */}
          <div className="flex flex-col">
            <ProductInfo product={product} />

            <div className="mt-6">
              <ProductActions product={product} />
            </div>
          </div>
        </div>

        {/* Product details */}
        <section className="mt-8 rounded-3xl border border-outline-variant bg-surface p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-text">Product Details</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="rounded-2xl bg-surface-container p-4">
              <p className="text-xs text-text-secondary">Brand</p>

              <p className="mt-1 text-sm font-medium text-text">
                {product.brand || "—"}
              </p>
            </div>

            {/* SKU */}
            <div className="rounded-2xl bg-surface-container p-4">
              <p className="text-xs text-text-secondary">SKU</p>

              <p className="mt-1 text-sm font-medium text-text">
                {product.sku || "—"}
              </p>
            </div>

            {/* Category */}
            <div className="rounded-2xl bg-surface-container p-4">
              <p className="text-xs text-text-secondary">Category</p>

              <p className="mt-1 text-sm font-medium text-text">
                {product.categoryLabel || product.category || "—"}
              </p>
            </div>

            {/* Availability */}
            <div className="rounded-2xl bg-surface-container p-4">
              <p className="text-xs text-text-secondary">Availability</p>

              <p
                className={
                  Number(product.stock) > 0
                    ? "mt-1 text-sm font-medium text-success"
                    : "mt-1 text-sm font-medium text-error"
                }
              >
                {Number(product.stock) > 0 ? "In Stock" : "Out of Stock"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ProductDetails;
