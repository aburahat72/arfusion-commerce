import { ArrowRight, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

function TopProducts({ products = [] }) {
  const navigate = useNavigate();

  return (
    <section className="min-w-0 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-text sm:text-lg">
          Top products
        </h2>
        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary transition hover:underline"
        >
          View all
          <ArrowRight size={14} />
        </button>
      </div>
      <p className="mt-1 text-xs text-text-secondary">
        Ranked by units sold in this period
      </p>

      <div className="mt-4 space-y-1">
        {products.length ? (
          products.map((product, index) => (
            <button
              key={product.productId}
              type="button"
              onClick={() => navigate(`/admin/products/${product.productId}`)}
              className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-surface-container"
            >
              <span className="w-4 shrink-0 text-center text-xs font-semibold text-text-secondary">
                {index + 1}
              </span>
              <ProductImage src={product.image} name={product.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-text">
                  {product.name}
                </p>
                <p className="mt-0.5 text-[11px] text-text-secondary">
                  {formatNumber(product.quantitySold)} sold
                </p>
              </div>
              <p className="shrink-0 text-xs font-semibold text-text">
                {formatCurrency(product.revenue)}
              </p>
            </button>
          ))
        ) : (
          <p className="py-8 text-center text-sm text-text-secondary">
            No paid product sales in this period.
          </p>
        )}
      </div>
    </section>
  );
}

function ProductImage({ src, name }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container">
      {src ? (
        <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <Package size={17} className="text-text-secondary" aria-label={name} />
      )}
    </div>
  );
}

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default TopProducts;
