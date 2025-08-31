"use client";

import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/CartContext";
import { useState } from "react";

export default function Header() {
  const { user, loading } = useAuth();
  const { cart, addToCart, removeFromCart, updateQuantity, total } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

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

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center relative">
      <Link href="/" className="font-bold text-xl">
        E-Commerce
      </Link>

      <nav className="flex gap-4 items-center">
        <Link href="/">Products</Link>
        {!loading && !user && <Link href="/auth/login">Login</Link>}
        {!loading && !user && <Link href="/auth/register">Register</Link>}
        {!loading && user && <Link href="/auth/logout">Logout</Link>}
        {!loading && user && <span>Hello, {user.name || user.email}</span>}
        <Link href="/orders">My Orders</Link>
        {/* Cart Icon */}
        <button
          onClick={() => setCartOpen(!cartOpen)}
          className="relative ml-4"
        >
          🛒
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {cart.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          )}
        </button>

        {/* Cart Dropdown */}
        {cartOpen && (
          <div className="absolute right-4 top-16 bg-white text-black p-4 shadow-lg w-72 z-50">
            {cart.length === 0 && <p>Your cart is empty</p>}
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center mb-2"
              >
                <div>
                  <span className="font-medium">{item.name}</span>
                  <div className="flex items-center gap-1 mt-1">
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
              </div>
            ))}
            {cart.length > 0 && (
              <>
                <p className="font-bold mt-2">Total: ${total}</p>
                <Link
                  href="/cart"
                  className="block mt-2 bg-blue-500 text-white text-center py-1 rounded"
                >
                  Go to Cart
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
