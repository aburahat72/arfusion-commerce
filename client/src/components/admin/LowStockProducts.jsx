import { AlertTriangle, ArrowRight, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

function LowStockProducts({ products = [] }) {
  const navigate = useNavigate();

  return (
    <section className="min-w-0 rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-error/10 text-error">
            <AlertTriangle size={16} />
          </div>
          <h2 className="truncate text-base font-semibold text-text sm:text-lg">
            Low stock
          </h2>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/inventory")}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary transition hover:underline"
        >
          Inventory
          <ArrowRight size={14} />
        </button>
      </div>
      <p className="mt-1 text-xs text-text-secondary">
        Products with 10 or fewer units available
      </p>

      <div className="mt-4 space-y-1">
        {products.length ? (
          products.map((product) => (
            <button
              key={product._id}
              type="button"
              onClick={() => navigate(`/admin/products/${product._id}`)}
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-surface-container"
            >
              <ProductImage
                src={product.images?.[0]?.url}
                name={product.name}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-text">
                  {product.name}
                </p>
                <p className="mt-0.5 text-[11px] text-text-secondary">
                  {product.isActive ? "Active product" : "Inactive product"}
                </p>
              </div>
              <StockBadge stock={product.stock} />
            </button>
          ))
        ) : (
          <p className="py-8 text-center text-sm text-text-secondary">
            No products need restocking.
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

function StockBadge({ stock }) {
  const critical = stock <= 3;
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
        critical ? "bg-error/10 text-error" : "bg-warning/10 text-warning"
      }`}
    >
      {stock} left
    </span>
  );
}

export default LowStockProducts;
