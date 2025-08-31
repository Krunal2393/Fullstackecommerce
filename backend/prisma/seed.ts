import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  // create admin & user
  const adminPw = await bcrypt.hash("password123", 10);
  const userPw = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "admin@nextgenbusiness.co.in" },
    update: {},
    create: {
      email: "admin@nextgenbusiness.co.in",
      passwordHash: adminPw,
      name: "Admin",
      role: "ADMIN",
      isVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: {
      email: "user@test.com",
      passwordHash: userPw,
      name: "Test User",
      role: "USER",
      isVerified: true,
    },
  });

  // create categories
  const categories = [
    {
      name: "Electronics",
      description: "Gadgets and devices",
      slug: "electronics",
    },
    { name: "Clothing", description: "Apparel", slug: "clothing" },
    { name: "Books", description: "Books and magazines", slug: "books" },
    { name: "Home & Garden", description: "Home goods", slug: "home-garden" },
    { name: "Sports", description: "Sporting goods", slug: "sports" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c as any,
    });
  }

  const cats = await prisma.category.findMany();

  // sample products
  const sampleProducts = [
    {
      name: "Wireless Earbuds",
      category: "electronics",
      price: 39.99,
      stock: 100,
      imageUrl: "https://picsum.photos/200/200?random=1",
    },
    {
      name: "Smartphone X",
      category: "electronics",
      price: 699.99,
      stock: 25,
      imageUrl: "https://picsum.photos/200/200?random=2",
    },
    {
      name: "Bluetooth Speaker",
      category: "electronics",
      price: 129.99,
      stock: 50,
      imageUrl: "https://picsum.photos/200/200?random=3",
    },
    {
      name: "Men's T-Shirt",
      category: "clothing",
      price: 19.99,
      stock: 200,
      imageUrl: "https://picsum.photos/200/200?random=4",
    },
    {
      name: "Women's Jacket",
      category: "clothing",
      price: 99.99,
      stock: 40,
      imageUrl: "https://picsum.photos/200/200?random=5",
    },
    {
      name: "Running Shoes",
      category: "sports",
      price: 79.99,
      stock: 60,
      imageUrl: "https://picsum.photos/200/200?random=6",
    },
    {
      name: "Coffee Maker",
      category: "home-garden",
      price: 49.99,
      stock: 30,
      imageUrl: "https://picsum.photos/200/200?random=7",
    },
    {
      name: "Cookware Set",
      category: "home-garden",
      price: 159.99,
      stock: 20,
      imageUrl: "https://picsum.photos/200/200?random=8",
    },
    {
      name: "Novel: The Great Tale",
      category: "books",
      price: 14.99,
      stock: 120,
      imageUrl: "https://picsum.photos/200/200?random=9",
    },
    {
      name: "Children's Book",
      category: "books",
      price: 9.99,
      stock: 150,
      imageUrl: "https://picsum.photos/200/200?random=10",
    },
    {
      name: "Laptop Pro",
      category: "electronics",
      price: 1199.99,
      stock: 15,
      imageUrl: "https://picsum.photos/200/200?random=11",
    },
    {
      name: "Gaming Mouse",
      category: "electronics",
      price: 49.99,
      stock: 80,
      imageUrl: "https://picsum.photos/200/200?random=12",
    },
    {
      name: "Yoga Mat",
      category: "sports",
      price: 29.99,
      stock: 90,
      imageUrl: "https://picsum.photos/200/200?random=13",
    },
    {
      name: "Men's Jeans",
      category: "clothing",
      price: 39.99,
      stock: 100,
      imageUrl: "https://picsum.photos/200/200?random=14",
    },
    {
      name: "Women's Dress",
      category: "clothing",
      price: 59.99,
      stock: 70,
      imageUrl: "https://picsum.photos/200/200?random=15",
    },
    {
      name: "Desk Lamp",
      category: "home-garden",
      price: 24.99,
      stock: 50,
      imageUrl: "https://picsum.photos/200/200?random=16",
    },
    {
      name: "Blender",
      category: "home-garden",
      price: 69.99,
      stock: 40,
      imageUrl: "https://picsum.photos/200/200?random=17",
    },
    {
      name: "History Book",
      category: "books",
      price: 19.99,
      stock: 60,
      imageUrl: "https://picsum.photos/200/200?random=18",
    },
    {
      name: "Graphic Novel",
      category: "books",
      price: 12.99,
      stock: 80,
      imageUrl: "https://picsum.photos/200/200?random=19",
    },
    {
      name: "Wireless Charger",
      category: "electronics",
      price: 29.99,
      stock: 100,
      imageUrl: "https://picsum.photos/200/200?random=20",
    },
  ];

  const productsData = sampleProducts
    .map((p) => {
      const cat = cats.find((c) => c.slug === p.category);
      if (!cat) return null;
      return {
        name: p.name,
        description: `${p.name} - high quality.`,
        price: p.price as any,
        stockQuantity: p.stock,
        categoryId: cat.id,
        imageUrl: p.imageUrl,
      };
    })
    .filter(Boolean);

  await prisma.product.createMany({
    data: productsData as any,
    skipDuplicates: true,
  });

  // create sample orders
  const user = await prisma.user.findUnique({
    where: { email: "user@test.com" },
  });
  const product = await prisma.product.findFirst();

  if (user && product) {
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: product.price as any,
        shippingAddress: { line1: "123 Main St", city: "Mumbai" },
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: product.id,
        quantity: 1,
        price: product.price as any,
        subtotal: product.price as any,
      },
    });
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
