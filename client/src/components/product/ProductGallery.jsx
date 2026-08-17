import { useState } from "react";

function ProductGallery({ product }) {
  const images = product.images?.length ? product.images : [product.image];

  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="grid gap-4 lg:grid-cols-[88px_1fr]">
      {/* Thumbnail list */}
      <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setSelectedImage(index)}
            className={`
              shrink-0 overflow-hidden rounded-xl border
              bg-surface-container
              transition
              ${
                selectedImage === index
                  ? "border-2 border-primary"
                  : "border-outline-variant hover:border-primary/40"
              }
            `}
            aria-label={`View product image ${index + 1}`}
          >
            <img
              src={image}
              alt={`${product.name} thumbnail ${index + 1}`}
              className="h-20 w-20 object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="order-1 flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-outline-variant bg-surface-container lg:order-2">
        <img
          src={images[selectedImage]}
          alt={product.name}
          className="max-h-[560px] w-full object-contain transition duration-300"
        />
      </div>
    </div>
  );
}

export default ProductGallery;
