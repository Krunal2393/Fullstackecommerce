---

### **backend/README.md**

```markdown
# E-Commerce Backend

Node.js + Express + TypeScript backend for the fullstack e-commerce app.

## Features
- Product, category, and cart management
- User authentication & JWT-based sessions
- Order creation and admin order management
- Email notifications via Mailtrap (development)
- Redis for cart/session storage

## Setup
1. Install dependencies:
```bash
npm install

---

### **backend/README.md**

````markdown
# E-Commerce Backend

Node.js + Express + TypeScript backend for the fullstack e-commerce app.

## Features

- Product, category, and cart management
- User authentication & JWT-based sessions
- Order creation and admin order management
- Email notifications via Mailtrap (development)
- Redis for cart/session storage

## Setup

1. Install dependencies:

```bash
npm install


DATABASE_URL="mysql://root:root@localhost:3306/ecommerce"
JWT_SECRET="supersecretkey"
PORT=5000
REDIS_URL="redis://localhost:6379"
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=YOUR_MAILTRAP_USER
MAIL_PASS=YOUR_MAILTRAP_PASS
MAIL_FROM="no-reply@demo.com"


npx prisma migrate dev --name init

npm run dev
```
````
