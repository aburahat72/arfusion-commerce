import {
  ArrowLeft,
  GitCompareArrows,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";

import {
  removeFromCompare,
  clearCompare,
} from "../../store/slices/compareSlice";

import { addProductToCart } from "../../store/slices/cartSlice";

import { formatCurrency } from "../../utils/currency";

function Compare() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const compareItems = useSelector((state) => state.compare.items);

  const cartActionLoading = useSelector(
    (state) => state.cart?.actionLoading ?? false,
  );

  /* =====================================================
     ADD TO CART
  ===================================================== */

  const handleAddToCart = async (product) => {
    const productId = product.id || product._id;

    if (!productId) {
      console.error("Cannot add product to cart: product ID is missing.");

      return;
    }

    if (Number(product.stock ?? 0) <= 0) {
      return;
    }

    if (cartActionLoading) {
      return;
    }

    try {
      await dispatch(
        addProductToCart({
          productId,
          quantity: 1,
        }),
      ).unwrap();

      console.log(`Added "${product.name}" to cart successfully.`);
    } catch (error) {
      console.error("Failed to add product to cart:", error);
    }
  };

  /* =====================================================
     EMPTY COMPARE
  ===================================================== */

  if (compareItems.length === 0) {
    return (
      <main className="min-h-screen bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-outline-variant bg-surface p-10 text-center shadow-sm sm:p-14">
            {/* Icon */}

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container text-primary">
              <GitCompareArrows size={28} />
            </div>

            {/* Heading */}

            <h1 className="mt-5 text-2xl font-semibold text-text">
              Your compare list is empty
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
              Add products to compare their prices, ratings, specifications, and
              other details.
            </p>

            {/* Button */}

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
     COMPARE
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
                {compareItems.length}{" "}
                {compareItems.length === 1 ? "product" : "products"} selected
              </p>
            </div>
          </div>

          {/* Clear compare */}

          <Button
            variant="text"
            size="small"
            onClick={() => dispatch(clearCompare())}
          >
            <Trash2 size={16} />
            Clear Compare
          </Button>
        </div>

        {/* =================================================
            DESKTOP COMPARISON TABLE
        ================================================= */}

        <div className="hidden overflow-x-auto rounded-3xl border border-outline-variant bg-surface shadow-sm lg:block">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="w-48 p-5 text-left text-sm font-semibold text-text">
                  Product
                </th>

                {compareItems.map((item) => {
                  const productId = item.id || item._id;

                  const productImage =
                    item.images?.[0]?.url ||
                    (typeof item.images?.[0] === "string"
                      ? item.images[0]
                      : null) ||
                    item.image ||
                    "";

                  return (
                    <th
                      key={productId}
                      className="min-w-[230px] p-5 align-top text-left"
                    >
                      <div className="relative">
                        {/* Remove */}

                        <IconButton
                          label={`Remove ${item.name} from compare`}
                          size="small"
                          variant="standard"
                          onClick={() => dispatch(removeFromCompare(productId))}
                          className="absolute right-0 top-0"
                        >
                          <Trash2 size={16} />
                        </IconButton>

                        {/* Image */}

                        <button
                          type="button"
                          onClick={() => navigate(`/products/${productId}`)}
                          className="block w-full text-left"
                        >
                          <div className="mb-4 aspect-square overflow-hidden rounded-2xl bg-surface-container">
                            {productImage ? (
                              <img
                                src={productImage}
                                alt={item.name}
                                className="h-full w-full object-cover transition duration-300 hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-sm text-text-secondary">
                                No image available
                              </div>
                            )}
                          </div>

                          <h2 className="pr-8 text-base font-semibold text-text hover:text-primary">
                            {item.name}
                          </h2>
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {/* Category */}

              <tr className="border-b border-outline-variant">
                <td className="p-5 text-sm font-medium text-text-secondary">
                  Category
                </td>

                {compareItems.map((item) => (
                  <td
                    key={item.id || item._id}
                    className="p-5 text-sm text-text"
                  >
                    {item.categoryLabel ||
                      item.category?.name ||
                      item.category ||
                      "—"}
                  </td>
                ))}
              </tr>

              {/* Brand */}

              <tr className="border-b border-outline-variant">
                <td className="p-5 text-sm font-medium text-text-secondary">
                  Brand
                </td>

                {compareItems.map((item) => (
                  <td
                    key={item.id || item._id}
                    className="p-5 text-sm text-text"
                  >
                    {item.brand || "—"}
                  </td>
                ))}
              </tr>

              {/* Price */}

              <tr className="border-b border-outline-variant">
                <td className="p-5 text-sm font-medium text-text-secondary">
                  Price
                </td>

                {compareItems.map((item) => (
                  <td key={item.id || item._id} className="p-5">
                    <p className="text-lg font-bold text-text">
                      {formatCurrency(item.price)}
                    </p>

                    {item.oldPrice && (
                      <p className="text-xs text-text-secondary line-through">
                        {formatCurrency(item.oldPrice)}
                      </p>
                    )}
                  </td>
                ))}
              </tr>

              {/* Discount */}

              <tr className="border-b border-outline-variant">
                <td className="p-5 text-sm font-medium text-text-secondary">
                  Discount
                </td>

                {compareItems.map((item) => (
                  <td
                    key={item.id || item._id}
                    className="p-5 text-sm font-medium text-primary"
                  >
                    {item.discount || "—"}
                  </td>
                ))}
              </tr>

              {/* Rating */}

              <tr className="border-b border-outline-variant">
                <td className="p-5 text-sm font-medium text-text-secondary">
                  Rating
                </td>

                {compareItems.map((item) => (
                  <td
                    key={item.id || item._id}
                    className="p-5 text-sm text-text"
                  >
                    {item.rating ?? 0}

                    {item.reviewCount !== undefined &&
                      item.reviewCount !== null && (
                        <span className="ml-1 text-text-secondary">
                          ({item.reviewCount})
                        </span>
                      )}
                  </td>
                ))}
              </tr>

              {/* Stock */}

              <tr className="border-b border-outline-variant">
                <td className="p-5 text-sm font-medium text-text-secondary">
                  Stock
                </td>

                {compareItems.map((item) => {
                  const stock = Number(item.stock ?? 0);

                  return (
                    <td key={item.id || item._id} className="p-5 text-sm">
                      {stock > 0 ? (
                        <span className="font-medium text-success">
                          {stock} available
                        </span>
                      ) : (
                        <span className="font-medium text-error">
                          Out of stock
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* SKU */}

              <tr className="border-b border-outline-variant">
                <td className="p-5 text-sm font-medium text-text-secondary">
                  SKU
                </td>

                {compareItems.map((item) => (
                  <td
                    key={item.id || item._id}
                    className="p-5 text-sm text-text"
                  >
                    {item.sku || "—"}
                  </td>
                ))}
              </tr>

              {/* Description */}

              <tr className="border-b border-outline-variant">
                <td className="p-5 align-top text-sm font-medium text-text-secondary">
                  Description
                </td>

                {compareItems.map((item) => (
                  <td
                    key={item.id || item._id}
                    className="p-5 align-top text-sm leading-6 text-text-secondary"
                  >
                    {item.description || "No description available."}
                  </td>
                ))}
              </tr>

              {/* Cart */}

              <tr>
                <td className="p-5 text-sm font-medium text-text-secondary">
                  Action
                </td>

                {compareItems.map((item) => {
                  const productId = item.id || item._id;

                  const isOutOfStock = Number(item.stock ?? 0) <= 0;

                  return (
                    <td key={productId} className="p-5">
                      <Button
                        size="medium"
                        className="w-full"
                        disabled={isOutOfStock || cartActionLoading}
                        onClick={() => handleAddToCart(item)}
                      >
                        <ShoppingCart size={17} />

                        {isOutOfStock
                          ? "Out of Stock"
                          : cartActionLoading
                            ? "Adding..."
                            : "Add to Cart"}
                      </Button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* =================================================
            MOBILE / TABLET PRODUCT CARDS
        ================================================= */}

        <div className="grid gap-5 sm:grid-cols-2 lg:hidden">
          {compareItems.map((item) => {
            const productId = item.id || item._id;

            const stock = Number(item.stock ?? 0);

            const isOutOfStock = stock <= 0;

            const productImage =
              item.images?.[0]?.url ||
              (typeof item.images?.[0] === "string" ? item.images[0] : null) ||
              item.image ||
              "";

            return (
              <article
                key={productId}
                className="overflow-hidden rounded-3xl border border-outline-variant bg-surface shadow-sm"
              >
                {/* Image */}

                <div className="relative aspect-square overflow-hidden bg-surface-container">
                  <button
                    type="button"
                    onClick={() => navigate(`/products/${productId}`)}
                    className="h-full w-full"
                  >
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-text-secondary">
                        No image available
                      </div>
                    )}
                  </button>

                  {/* Remove */}

                  <IconButton
                    label={`Remove ${item.name} from compare`}
                    size="medium"
                    variant="standard"
                    onClick={() => dispatch(removeFromCompare(productId))}
                    className="absolute right-3 top-3 bg-surface/90 backdrop-blur"
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </div>

                {/* Content */}

                <div className="p-5">
                  <p className="text-xs font-medium text-primary">
                    {item.categoryLabel ||
                      item.category?.name ||
                      item.category ||
                      "Product"}
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate(`/products/${productId}`)}
                    className="mt-1 block text-left"
                  >
                    <h2 className="text-lg font-semibold text-text">
                      {item.name}
                    </h2>
                  </button>

                  {/* Price */}

                  <div className="mt-3">
                    <p className="text-lg font-bold text-text">
                      {formatCurrency(item.price)}
                    </p>

                    {item.oldPrice && (
                      <p className="text-xs text-text-secondary line-through">
                        {formatCurrency(item.oldPrice)}
                      </p>
                    )}
                  </div>

                  {/* Details */}

                  <div className="mt-4 space-y-2 rounded-2xl bg-surface-container p-4">
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-text-secondary">Brand</span>

                      <span className="font-medium text-text">
                        {item.brand || "—"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-text-secondary">Rating</span>

                      <span className="font-medium text-text">
                        ★ {item.rating ?? 0}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-text-secondary">Stock</span>

                      <span
                        className={
                          isOutOfStock
                            ? "font-medium text-error"
                            : "font-medium text-success"
                        }
                      >
                        {isOutOfStock ? "Out of stock" : `${stock} available`}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-text-secondary">SKU</span>

                      <span className="font-medium text-text">
                        {item.sku || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Add to cart */}

                  <Button
                    size="medium"
                    className="mt-4 w-full"
                    disabled={isOutOfStock || cartActionLoading}
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart size={17} />

                    {isOutOfStock
                      ? "Out of Stock"
                      : cartActionLoading
                        ? "Adding..."
                        : "Add to Cart"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        {/* =================================================
            BACK TO PRODUCTS
        ================================================= */}

        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="outlined" onClick={() => navigate("/products")}>
            <ArrowLeft size={17} />
            Continue Shopping
          </Button>
        </div>
      </div>
    </main>
  );
}

export default Compare;
