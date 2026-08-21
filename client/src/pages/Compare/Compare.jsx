import {
  ArrowLeft,
  GitCompareArrows,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";

import {
  clearCompare,
  removeFromCompare,
} from "../../store/slices/compareSlice";

import { addToCart } from "../../store/slices/cartSlice";

function Compare() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const compareItems = useSelector((state) => state.compare.items);

  /* =====================================================
     ADD TO CART
  ===================================================== */

  const handleAddToCart = (product) => {
    if (Number(product.stock) <= 0) {
      return;
    }

    dispatch(
      addToCart({
        id: product.id || product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      }),
    );
  };

  /* =====================================================
     EMPTY STATE
  ===================================================== */

  if (compareItems.length === 0) {
    return (
      <main className="min-h-screen bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-outline-variant bg-surface p-10 text-center shadow-sm sm:p-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container text-primary">
              <GitCompareArrows size={30} />
            </div>

            <h1 className="mt-5 text-2xl font-semibold text-text">
              No products to compare
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
              Add products to compare their prices, ratings, specifications, and
              other details.
            </p>

            <div className="mt-6 flex justify-center">
              <Button size="large" onClick={() => navigate("/products")}>
                <ShoppingCart size={18} />
                Browse Products
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =====================================================
     COMPARE PAGE
  ===================================================== */

  return (
    <main className="min-h-screen bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className="mb-6 text-sm text-text-secondary">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="transition hover:text-primary"
          >
            Home
          </button>

          <span className="mx-2">/</span>

          <span className="font-medium text-text">Compare</span>
        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-container text-primary">
              <GitCompareArrows size={21} />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-text">
                Compare Products
              </h1>

              <p className="mt-1 text-sm text-text-secondary">
                Compare {compareItems.length}{" "}
                {compareItems.length === 1 ? "product" : "products"}
              </p>
            </div>
          </div>

          {/* Clear all */}

          <Button
            variant="text"
            size="small"
            onClick={() => dispatch(clearCompare())}
          >
            <Trash2 size={16} />
            Clear comparison
          </Button>
        </div>

        {/* =================================================
            MOBILE NOTE
        ================================================= */}

        <div className="mb-5 rounded-2xl bg-primary-container p-4 lg:hidden">
          <p className="text-sm font-medium text-text">
            Swipe horizontally to compare
          </p>

          <p className="mt-1 text-xs text-text-secondary">
            You can compare up to 4 products at once.
          </p>
        </div>

        {/* =================================================
            COMPARISON TABLE
        ================================================= */}

        <div className="overflow-x-auto rounded-3xl border border-outline-variant bg-surface shadow-sm">
          <div
            className="min-w-[760px]"
            style={{
              display: "grid",
              gridTemplateColumns: `180px repeat(${compareItems.length}, minmax(220px, 1fr))`,
            }}
          >
            {/* =================================================
                PRODUCT ROW
            ================================================= */}

            <div className="border-b border-r border-outline-variant bg-surface-container p-5">
              <p className="text-sm font-semibold text-text">Product</p>
            </div>

            {compareItems.map((product) => {
              const productId = product.id || product._id;

              return (
                <div
                  key={productId}
                  className="relative border-b border-outline-variant p-5"
                >
                  {/* Remove */}

                  <IconButton
                    label={`Remove ${product.name} from comparison`}
                    size="small"
                    variant="standard"
                    onClick={() => dispatch(removeFromCompare(productId))}
                    className="absolute right-3 top-3"
                  >
                    <X size={16} />
                  </IconButton>

                  {/* Image */}

                  <button
                    type="button"
                    onClick={() => navigate(`/products/${productId}`)}
                    className="block w-full"
                  >
                    <div className="mx-auto aspect-square max-w-44 overflow-hidden rounded-2xl bg-surface-container">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                      />
                    </div>
                  </button>

                  {/* Name */}

                  <button
                    type="button"
                    onClick={() => navigate(`/products/${productId}`)}
                    className="mt-4 block w-full text-left"
                  >
                    <h2 className="line-clamp-2 text-sm font-semibold text-text hover:text-primary">
                      {product.name}
                    </h2>
                  </button>
                </div>
              );
            })}

            {/* =================================================
                PRICE
            ================================================= */}

            <CompareLabel label="Price" />

            {compareItems.map((product) => (
              <div
                key={`price-${product.id || product._id}`}
                className="border-b border-outline-variant p-5"
              >
                <p className="text-lg font-bold text-text">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </p>

                {product.oldPrice && product.oldPrice > product.price && (
                  <p className="mt-1 text-xs text-text-secondary line-through">
                    ₹{Number(product.oldPrice).toLocaleString("en-IN")}
                  </p>
                )}
              </div>
            ))}

            {/* =================================================
                DISCOUNT
            ================================================= */}

            <CompareLabel label="Discount" />

            {compareItems.map((product) => (
              <div
                key={`discount-${product.id || product._id}`}
                className="border-b border-outline-variant p-5"
              >
                {product.discount ? (
                  <span className="inline-flex rounded-full bg-primary-container px-3 py-1 text-xs font-semibold text-primary">
                    {product.discount}
                  </span>
                ) : (
                  <span className="text-sm text-text-secondary">
                    No discount
                  </span>
                )}
              </div>
            ))}

            {/* =================================================
                RATING
            ================================================= */}

            <CompareLabel label="Rating" />

            {compareItems.map((product) => (
              <div
                key={`rating-${product.id || product._id}`}
                className="border-b border-outline-variant p-5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text">
                    ★ {product.rating || "—"}
                  </span>

                  {product.reviewCount && (
                    <span className="text-xs text-text-secondary">
                      ({product.reviewCount})
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* =================================================
                BRAND
            ================================================= */}

            <CompareLabel label="Brand" />

            {compareItems.map((product) => (
              <CompareValue
                key={`brand-${product.id || product._id}`}
                value={product.brand}
              />
            ))}

            {/* =================================================
                CATEGORY
            ================================================= */}

            <CompareLabel label="Category" />

            {compareItems.map((product) => (
              <CompareValue
                key={`category-${product.id || product._id}`}
                value={product.categoryLabel || product.category}
              />
            ))}

            {/* =================================================
                SKU
            ================================================= */}

            <CompareLabel label="SKU" />

            {compareItems.map((product) => (
              <CompareValue
                key={`sku-${product.id || product._id}`}
                value={product.sku}
              />
            ))}

            {/* =================================================
                STOCK
            ================================================= */}

            <CompareLabel label="Availability" />

            {compareItems.map((product) => {
              const inStock = Number(product.stock) > 0;

              return (
                <div
                  key={`stock-${product.id || product._id}`}
                  className="border-b border-outline-variant p-5"
                >
                  <span
                    className={
                      inStock
                        ? "text-sm font-medium text-success"
                        : "text-sm font-medium text-error"
                    }
                  >
                    {inStock ? `${product.stock} available` : "Out of stock"}
                  </span>
                </div>
              );
            })}

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <CompareLabel label="Description" />

            {compareItems.map((product) => (
              <div
                key={`description-${product.id || product._id}`}
                className="border-b border-outline-variant p-5"
              >
                <p className="text-sm leading-6 text-text-secondary">
                  {product.description || "No description available."}
                </p>
              </div>
            ))}

            {/* =================================================
                ACTION
            ================================================= */}

            <CompareLabel label="Action" />

            {compareItems.map((product) => {
              const productId = product.id || product._id;

              const isOutOfStock = Number(product.stock) <= 0;

              return (
                <div key={`action-${productId}`} className="p-5">
                  <Button
                    size="medium"
                    className="w-full"
                    disabled={isOutOfStock}
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart size={17} />

                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* =================================================
            FOOTER ACTION
        ================================================= */}

        <div className="mt-8">
          <Button variant="outlined" onClick={() => navigate("/products")}>
            <ArrowLeft size={17} />
            Continue Shopping
          </Button>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   COMPARISON LABEL
========================================================= */

function CompareLabel({ label }) {
  return (
    <div className="border-b border-r border-outline-variant bg-surface-container p-5">
      <p className="text-sm font-semibold text-text">{label}</p>
    </div>
  );
}

/* =========================================================
   COMPARISON VALUE
========================================================= */

function CompareValue({ value }) {
  return (
    <div className="border-b border-outline-variant p-5">
      <p className="text-sm text-text">{value || "—"}</p>
    </div>
  );
}

export default Compare;
