"use client";

import { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
// import { useAuth } from "../../../components/AuthProvider";

export default function LogoutPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const logout = async () => {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      refreshUser();
      router.push("/");
    };
    logout();
  }, [router, refreshUser]);

  return <div>Logging out...</div>;
}
