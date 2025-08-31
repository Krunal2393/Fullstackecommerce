"use client";

import Link from "next/link";
import { useCart } from "../../hooks/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();

  const handleIncrement = (id: number) => {
    const item = cart.find((i) => i.id === id);
    if (item) updateQuantity(id, item.quantity + 1);
  };

  const handleDecrement = (id: number) => {
    const item = cart.find((i) => i.id === id);
    if (item) {
      if (item.quantity > 1) {
        updateQuantity(id, item.quantity - 1);
      } else {
        removeFromCart(id);
      }
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-white shadow rounded p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Cart</h1>
        <p>Your cart is empty.</p>
        <Link href="/" className="text-blue-500 underline">
          Go to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {cart.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center mb-4 border-b pb-2"
        >
          <div>
            <h2 className="font-semibold">{item.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => handleDecrement(item.id)}
                className="px-2 bg-gray-200 rounded"
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button
                onClick={() => handleIncrement(item.id)}
                className="px-2 bg-gray-200 rounded"
              >
                +
              </button>
            </div>
          </div>
          <span>${item.price * item.quantity}</span>
          <button
            onClick={() => removeFromCart(item.id)}
            className="text-red-500 hover:underline"
          >
            Remove
          </button>
        </div>
      ))}

      <p className="font-bold mt-4">Total: ${total}</p>

      <Link
        href="/checkout"
        className="block mt-4 bg-blue-500 text-white text-center py-2 rounded"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}
