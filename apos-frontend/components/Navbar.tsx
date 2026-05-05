"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <nav className="w-full flex justify-between items-center px-6 py-4 border-b bg-white">
      
      {/* 🔥 LOGO */}
      <Link href="/" className="text-xl font-bold">
        APOS
      </Link>

      {/* 🔗 LINKS */}
      <div className="flex gap-4">
        {user ? (
          <Link href="/dashboard" className="font-medium">
            Dashboard
          </Link>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/signup" className="bg-black text-white px-4 py-1 rounded">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}