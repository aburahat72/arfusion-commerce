import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ProductGallery from "../../components/product/ProductGallery";
import ProductInfo from "../../components/product/ProductInfo";
import ProductActions from "../../components/product/ProductActions";

import { getProductById } from "../../services/productService";

function ProductDetails() {
  const { productId } = useParams();

  /* =====================================================
     PRODUCT STATE
  ===================================================== */

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =====================================================
     FETCH REAL PRODUCT
  ===================================================== */

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProductById(productId);

        if (!isMounted) return;

        if (response?.success && response?.product) {
          setProduct(response.product);
        } else {
          setProduct(null);
          setError(response?.message || "Product not found");
        }
      } catch (err) {
        if (!isMounted) return;

        console.error("Product details fetch error:", err);

        setProduct(null);

        setError(
          err?.response?.data?.message ||
            "Unable to load product. Please try again.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (productId) {
      fetchProduct();
    } else {
      setProduct(null);
      setError("Product not found");
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [productId]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-text-secondary">Loading product...</p>
        </div>
      </main>
    );
  }

  /* =====================================================
     PRODUCT NOT FOUND / ERROR
  ===================================================== */

  if (!product) {
    return (
      <main className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-text">
            Product not found
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            {error || "The product you're looking for does not exist."}
          </p>
        </div>
      </main>
    );
  }

  /* =====================================================
     REAL PRODUCT DATA NORMALIZATION

     Backend:
       _id
       category: populated category object
       images: [{ url, publicId }]

     Existing UI:
       category
       categoryLabel
       image
       images: [url]
  ===================================================== */

  const categoryName =
    typeof product.category === "object"
      ? product.category?.name
      : product.category;

  const categoryLabel =
    typeof product.category === "object"
      ? product.category?.name
      : product.categoryLabel || product.category;

  const productImages = Array.isArray(product.images)
    ? product.images
        .map((image) => (typeof image === "string" ? image : image?.url))
        .filter(Boolean)
    : [];

  const normalizedProduct = {
    ...product,

    id: product._id,

    image: productImages[0] || product.image || "",

    images:
      productImages.length > 0
        ? productImages
        : product.image
          ? [product.image]
          : [],

    category: categoryName || "",

    categoryLabel: categoryLabel || "",

    rating: Number(product.rating || 0),

    reviewCount: Number(product.reviewCount || 0),

    soldCount: Number(product.soldCount || 0),

    stock: Number(product.stock || 0),

    price: Number(product.price || 0),
  };

  return (
    <main className="min-h-screen bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-text-secondary">
          <span>Home</span>

          <span className="mx-2">/</span>

          <span>Products</span>

          <span className="mx-2">/</span>

          <span className="font-medium text-text">
            {normalizedProduct.name}
          </span>
        </div>

        {/* Main product */}
        <div className="grid gap-8 rounded-3xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-8 lg:grid-cols-2 lg:p-10">
          {/* Product gallery */}
          <ProductGallery product={normalizedProduct} />

          {/* Product information */}
          <div className="flex flex-col">
            <ProductInfo product={normalizedProduct} />

            <div className="mt-6">
              <ProductActions product={normalizedProduct} />
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
                {normalizedProduct.brand || "—"}
              </p>
            </div>

            {/* SKU */}
            <div className="rounded-2xl bg-surface-container p-4">
              <p className="text-xs text-text-secondary">SKU</p>

              <p className="mt-1 text-sm font-medium text-text">
                {normalizedProduct.sku || "—"}
              </p>
            </div>

            {/* Category */}
            <div className="rounded-2xl bg-surface-container p-4">
              <p className="text-xs text-text-secondary">Category</p>

              <p className="mt-1 text-sm font-medium text-text">
                {normalizedProduct.categoryLabel ||
                  normalizedProduct.category ||
                  "—"}
              </p>
            </div>

            {/* Availability */}
            <div className="rounded-2xl bg-surface-container p-4">
              <p className="text-xs text-text-secondary">Availability</p>

              <p
                className={
                  Number(normalizedProduct.stock) > 0
                    ? "mt-1 text-sm font-medium text-success"
                    : "mt-1 text-sm font-medium text-error"
                }
              >
                {Number(normalizedProduct.stock) > 0
                  ? "In Stock"
                  : "Out of Stock"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ProductDetails;
