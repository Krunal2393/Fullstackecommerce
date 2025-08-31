"use client";

import { useCart } from "../../hooks/CartContext";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/create`,
        {
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        },
        { withCredentials: true } // 🔑 auth protected
      );

      clearCart();
      toast.success("Order placed successfully!");

      router.push(`/`); // Redirect to order details
    } catch (err: any) {
      console.error(err);
      setError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="divide-y mb-4">
            {cart.map((item) => (
              <li key={item.id} className="flex justify-between py-2">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <p className="text-xl font-semibold mb-4">
            Total: ${totalPrice.toFixed(2)}
          </p>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </>
      )}
    </div>
  );
}
