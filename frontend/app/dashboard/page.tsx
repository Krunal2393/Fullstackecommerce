"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function DashboardPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    stockQuantity: 0,
    categoryId: 0,
  });
  const [editProductId, setEditProductId] = useState<number | null>(null);

  // Fetch categories
  const fetchCategories = async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
    );
    setCategories(res.data);
  };

  // Fetch products
  const fetchProducts = async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products`
    );
    setProducts(res.data.items || []);
  };

  // Fetch orders (Admin only)
  const fetchOrders = async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/orders/admin/orders`,
      { withCredentials: true }
    );
    setOrders(res.data);
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchOrders();
  }, []);

  // Add or Update Category
  const handleCategorySubmit = async (e: any) => {
    e.preventDefault();
    if (!newCategory.name) return alert("Category name required");

    if (editCategoryId) {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${editCategoryId}`,
        newCategory,
        { withCredentials: true }
      );
      setEditCategoryId(null);
    } else {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
        newCategory,
        { withCredentials: true }
      );
    }
    setNewCategory({ name: "", description: "" });
    fetchCategories();
  };

  const handleEditCategory = (cat: any) => {
    setNewCategory({ name: cat.name, description: cat.description || "" });
    setEditCategoryId(cat.id);
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`,
      { withCredentials: true }
    );
    fetchCategories();
  };

  // Add or Update Product
  const handleProductSubmit = async (e: any) => {
    e.preventDefault();
    if (!newProduct.name || newProduct.categoryId === 0)
      return alert("Name and category required");

    if (editProductId) {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${editProductId}`,
        { ...newProduct, price: newProduct.price.toString() },
        { withCredentials: true }
      );
      setEditProductId(null);
    } else {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
        { ...newProduct, price: newProduct.price.toString() },
        { withCredentials: true }
      );
    }

    setNewProduct({
      name: "",
      description: "",
      price: 0,
      stockQuantity: 0,
      categoryId: 0,
    });
    fetchProducts();
  };

  const handleEditProduct = (prod: any) => {
    setNewProduct({
      name: prod.name,
      description: prod.description || "",
      price: Number(prod.price),
      stockQuantity: prod.stockQuantity,
      categoryId: prod.categoryId,
    });
    setEditProductId(prod.id);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`,
      { withCredentials: true }
    );
    fetchProducts();
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (id: number, status: string) => {
    await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/api/orders/admin/orders/${id}/status`,
      { status },
      { withCredentials: true }
    );
    fetchOrders();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Categories */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Categories</h2>
        <form onSubmit={handleCategorySubmit} className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Name"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
            className="border p-1 rounded"
          />
          <input
            type="text"
            placeholder="Description"
            value={newCategory.description}
            onChange={(e) =>
              setNewCategory({ ...newCategory, description: e.target.value })
            }
            className="border p-1 rounded"
          />
          <button className="bg-blue-500 text-white px-2 rounded">
            {editCategoryId ? "Update" : "Add"}
          </button>
        </form>
        <ul>
          {categories.map((cat) => (
            <li key={cat.id} className="flex justify-between mb-1">
              <span>{cat.name}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditCategory(cat)}
                  className="text-yellow-500"
                >
                  Edit
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Products */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Products</h2>
        <form
          onSubmit={handleProductSubmit}
          className="flex flex-col gap-2 mb-4"
        >
          <input
            type="text"
            placeholder="Name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            className="border p-1 rounded"
          />
          <input
            type="text"
            placeholder="Description"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
            className="border p-1 rounded"
          />
          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: Number(e.target.value) })
            }
            className="border p-1 rounded"
          />
          <input
            type="number"
            placeholder="Stock Quantity"
            value={newProduct.stockQuantity}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                stockQuantity: Number(e.target.value),
              })
            }
            className="border p-1 rounded"
          />
          <select
            value={newProduct.categoryId}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                categoryId: Number(e.target.value),
              })
            }
            className="border p-1 rounded"
          >
            <option value={0}>Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button className="bg-green-500 text-white px-2 rounded">
            {editProductId ? "Update Product" : "Add Product"}
          </button>
        </form>
        <ul>
          {products.map((prod) => (
            <li key={prod.id} className="flex justify-between mb-1">
              <span>
                {prod.name} - ${prod.price} - {prod.category?.name}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditProduct(prod)}
                  className="text-yellow-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProduct(prod.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Orders */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Orders</h2>
        <ul>
          {orders.map((order) => (
            <li key={order.id} className="border p-2 mb-2 rounded">
              <p>
                <strong>Order #{order.id}</strong> - Status:{" "}
                <span className="font-semibold">{order.status}</span>
              </p>
              <ul className="ml-4">
                {order.items.map((item: any) => (
                  <li key={item.id}>
                    {item.product.name} x {item.quantity} - ${item.subtotal}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 mt-2">
                {["Pending", "Shipped", "Delivered", "Processing"].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateOrderStatus(order.id, st)}
                    className={`px-2 py-1 rounded ${
                      order.status === st
                        ? "bg-gray-400 text-white"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
