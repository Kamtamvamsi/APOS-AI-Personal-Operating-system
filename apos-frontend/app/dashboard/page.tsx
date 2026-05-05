"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <div className="p-6 max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Welcome, {user?.name || "User"}
        </h1>

        {/* 🧠 AI INSIGHT */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-3">AI Insight</h2>
          <p className="text-gray-600">
            You are inconsistent in the evenings. Focus drops after 2 tasks.
          </p>
        </div>

        {/* 🎯 NEXT MOVE */}
        <div className="bg-black text-white p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Your Next Move</h2>
          <p>Complete your highest priority task within the next 60 minutes.</p>
        </div>

      </div>
    </div>
  );
}