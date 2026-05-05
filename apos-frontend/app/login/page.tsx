"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [name, setName] = useState("");

  const handleLogin = () => {
    localStorage.setItem("user", JSON.stringify({ name }));
    router.push("/dashboard");
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-white/60 backdrop-blur p-8 rounded-xl">
        <h1 className="text-xl mb-4">Login</h1>
        <input
          className="border p-2 w-full mb-4"
          placeholder="Enter name"
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}