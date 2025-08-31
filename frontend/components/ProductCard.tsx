"use client";

import Link from "next/link";
import { useCart } from "../hooks/CartContext";

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white shadow rounded p-4 flex flex-col">
      <Link href={`/products/${product.id}`}>
        <img
          src={product.imageUrl || "/placeholder.png"}
          alt={product.name}
          className="w-full h-48 object-cover rounded mb-2"
        />
        <h2 className="font-bold text-lg">{product.name}</h2>
        <p className="text-gray-700">${product.price}</p>
      </Link>

      <button
        onClick={() => addToCart(product)}
        className="mt-auto bg-blue-500 text-white py-1 rounded hover:bg-blue-600"
      >
        Add to Cart
      </button>
    </div>
  );
}
