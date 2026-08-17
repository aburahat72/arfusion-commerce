import { Heart, Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { addToCart } from "../../store/slices/cartSlice";
import { startBuyNow } from "../../store/slices/checkoutSlice";

import Button from "../ui/Button";
import IconButton from "../ui/IconButton";

function ProductActions({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);

  const productId = product.id || product._id;

  const isOutOfStock = product.stock <= 0;

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity((current) => current + 1);
    }
  };

  const decreaseQuantity = () => {
    setQuantity((current) => (current > 1 ? current - 1 : 1));
  };

  // Add to Cart
  const handleAddToCart = () => {
    if (isOutOfStock) {
      return;
    }

    dispatch(
      addToCart({
        id: productId,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
      }),
    );
  };

  // Buy Now
  const handleBuyNow = () => {
    if (isOutOfStock) {
      return;
    }

    // Buy Now uses checkout state.
    // It does NOT modify the normal cart.
    dispatch(
      startBuyNow({
        id: productId,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
      }),
    );

    // Go directly to checkout
    navigate("/checkout");
  };

  return (
    <div className="space-y-4 border-t border-outline-variant pt-6">
      {/* Quantity */}
      <div>
        <p className="mb-2 text-sm font-semibold text-text">Quantity</p>

        <div className="flex w-fit items-center overflow-hidden rounded-xl border border-outline-variant bg-surface">
          {/* Decrease */}
          <IconButton
            label="Decrease quantity"
            variant="standard"
            size="small"
            onClick={decreaseQuantity}
            disabled={isOutOfStock || quantity <= 1}
          >
            <Minus size={17} />
          </IconButton>

          {/* Quantity */}
          <span className="flex h-10 min-w-12 items-center justify-center px-3 text-sm font-semibold text-text">
            {quantity}
          </span>

          {/* Increase */}
          <IconButton
            label="Increase quantity"
            variant="standard"
            size="small"
            onClick={increaseQuantity}
            disabled={isOutOfStock || quantity >= product.stock}
          >
            <Plus size={17} />
          </IconButton>
        </div>

        {!isOutOfStock && product.stock <= 10 && (
          <p className="mt-2 text-xs font-medium text-warning">
            Only {product.stock} left in stock
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        {/* Add to Cart */}
        <Button size="large" disabled={isOutOfStock} onClick={handleAddToCart}>
          <ShoppingCart size={18} />
          Add to Cart
        </Button>

        {/* Buy Now */}
        <Button
          size="large"
          variant="tonal"
          disabled={isOutOfStock}
          onClick={handleBuyNow}
        >
          <Zap size={18} />
          Buy Now
        </Button>

        {/* Wishlist */}
        <IconButton label="Add to wishlist" size="large" variant="outlined">
          <Heart size={20} />
        </IconButton>
      </div>

      {/* Delivery information */}
      <div className="rounded-2xl bg-surface-container p-4">
        <div className="space-y-2 text-sm">
          <p className="font-medium text-text">Free delivery</p>

          <p className="text-text-secondary">
            Estimated delivery within 3–7 business days.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProductActions;
