import Header from "../components/Header";
import "../app/global.css";
import { AuthProvider } from "../hooks/useAuth";
import { CartProvider } from "../hooks/CartContext";
import { Toaster } from "react-hot-toast";
// import { AuthProvider } from "../hooks/useAuth";
// import { AuthProvider } from "../hooks/useAuth";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main>{children}</main>
          </CartProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#333",
                color: "#fff",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
