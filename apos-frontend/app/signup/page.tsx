"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");

  const handleSignup = () => {
    localStorage.setItem("user", JSON.stringify({ name }));
    router.push("/dashboard");
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-white/60 backdrop-blur p-8 rounded-xl">
        <h1 className="text-xl mb-4">Signup</h1>
        <input
          className="border p-2 w-full mb-4"
          placeholder="Enter name"
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={handleSignup}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}