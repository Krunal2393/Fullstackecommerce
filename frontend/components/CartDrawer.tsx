"use client";

import { useCart } from "../hooks/CartContext";

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart();

  return (
    <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Shopping Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between mb-2"
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <p>
                  ${item.price} x {item.quantity}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="w-16 border rounded px-1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.id, Number(e.target.value))
                  }
                />
                <button
                  className="text-red-500"
                  onClick={() => removeFromCart(item.id)}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          <hr className="my-2" />
          <p className="font-bold">Total: ${total.toFixed(2)}</p>
          <button
            className="bg-red-500 text-white w-full py-2 mt-2 rounded"
            onClick={clearCart}
          >
            Clear Cart
          </button>
        </>
      )}
    </div>
  );
}
