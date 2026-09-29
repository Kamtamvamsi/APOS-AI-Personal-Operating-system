"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    const user = { email };

    localStorage.setItem("user", JSON.stringify(user));

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <div className="flex items-center justify-center px-6 py-20">
        <div className="bg-white p-8 rounded-lg shadow w-full max-w-md">

          <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
            Welcome Back
          </h1>

          <p className="text-gray-600 text-center mb-6">
            Continue optimizing your decisions
          </p>

          <div className="space-y-4">

            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-300 p-3 rounded text-gray-900 placeholder-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full border border-gray-300 p-3 rounded text-gray-900 placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={handleLogin}
              className="w-full bg-black text-white py-3 rounded hover:bg-gray-800"
            >
              Login
            </button>

          </div>

          <p className="text-sm text-center mt-6 text-gray-600">
            Don’t have an account?{" "}
            <span
              className="text-black cursor-pointer font-medium"
              onClick={() => router.push("/signup")}
            >
              Signup
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}