"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      router.push("/dashboard");
    }
  }, []);

  return (
    <div className="bg-white text-gray-900">

      <Navbar />

      {/* 🔥 HERO */}
      <section className="text-center px-6 py-24">
        <h1 className="text-5xl font-bold mb-6">
          You don’t need motivation.  
          <br /> You need direction.
        </h1>

        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          APOS analyzes your behavior, goals, and habits — and tells you what to do next.
        </p>

        <div className="flex justify-center gap-4">
          <a href="/signup" className="bg-black text-white px-6 py-3 rounded-lg">
            Start Optimizing
          </a>
          <a href="/login" className="border px-6 py-3 rounded-lg">
            Login
          </a>
        </div>
      </section>

      {/* ⚡ QUESTIONS */}
      <section className="max-w-4xl mx-auto px-6 py-16 space-y-10">
        <div>
          <h2 className="text-xl font-semibold">
            Are you working hard or just staying busy?
          </h2>
          <p className="text-gray-500">Most people confuse activity with progress.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            Do you know your next move?
          </h2>
          <p className="text-gray-500">Clarity beats motivation.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            Why do you lose consistency?
          </h2>
          <p className="text-gray-500">Because your system is broken — not your effort.</p>
        </div>
      </section>

      {/* 🚀 WHAT APOS DOES */}
      <section className="bg-gray-50 py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">
          APOS decides your next move.
        </h2>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
          <p>✔ Tracks goals</p>
          <p>✔ Monitors habits</p>
          <p>✔ Detects patterns</p>
          <p>✔ Suggests actions</p>
        </div>
      </section>

      {/* 📊 HOW IT WORKS */}
      <section className="py-20 text-center px-6">
        <h2 className="text-3xl font-bold mb-6">How it works</h2>

        <p>Input → AI → Output</p>
        <p className="text-gray-500 mt-4">
          Your data → Analysis → Clear next step
        </p>
      </section>

      {/* 🔥 TRUTH */}
      <section className="bg-black text-white py-20 text-center px-6">
        <h2 className="text-3xl font-bold">You have a decision problem.</h2>
        <p className="mt-4 text-gray-400">APOS fixes that.</p>
      </section>

      {/* 🎯 CTA */}
      <section className="py-20 text-center">
        <a href="/signup" className="bg-black text-white px-8 py-3 rounded-lg">
          Get Your Next Move
        </a>
      </section>

      <Footer />
    </div>
  );
}