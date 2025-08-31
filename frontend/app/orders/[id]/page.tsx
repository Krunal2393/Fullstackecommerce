"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}`,
          { withCredentials: true }
        );
        setOrder(response.data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  if (loading) return <p>Loading...</p>;
  if (error || !order) return <p>Failed to load order.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Order #{order.id}</h1>
      <p className="mb-2">Status: {order.status}</p>
      <p className="mb-2">Total: ${order.total.toFixed(2)}</p>

      <h2 className="text-xl font-semibold mt-4 mb-2">Items:</h2>
      <ul className="divide-y">
        {order.items.map((item: any) => (
          <li key={item.id} className="flex justify-between py-2">
            <span>
              {item.product.name} × {item.quantity}
            </span>
            <span>${(item.product.price * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
