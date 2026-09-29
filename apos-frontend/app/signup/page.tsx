// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Navbar from "@/components/Navbar";

// export default function Signup() {
//   const router = useRouter();

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSignup = () => {
//     if (!name || !email || !password) {
//       alert("Please fill all fields");
//       return;
//     }

//     // 🔥 Fake signup (Phase 1)
//     const user = { name, email };

//     localStorage.setItem("user", JSON.stringify(user));

//     router.push("/dashboard");
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">

//       <Navbar />

//       <div className="flex items-center justify-center px-6 py-20">
//         <div className="bg-white p-8 rounded-lg shadow w-full max-w-md">

//           <h1 className="text-2xl font-bold mb-6 text-center">
//             Create Your System
//           </h1>

//           <p className="text-gray-500 text-center mb-6">
//             Start making better decisions today
//           </p>

//           <div className="space-y-4">

//             <input
//               type="text"
//               placeholder="Full Name"
//               className="w-full border p-3 rounded"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />

//             <input
//               type="email"
//               placeholder="Email"
//               className="w-full border p-3 rounded"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />

//             <input
//               type="password"
//               placeholder="Password"
//               className="w-full border p-3 rounded"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />

//             <button
//               onClick={handleSignup}
//               className="w-full bg-black text-white py-3 rounded"
//             >
//               Get Started
//             </button>

//           </div>

//           <p className="text-sm text-center mt-6 text-gray-500">
//             Already have an account?{" "}
//             <span
//               className="text-black cursor-pointer"
//               onClick={() => router.push("/login")}
//             >
//               Login
//             </span>
//           </p>

//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function Signup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = () => {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    const user = { name, email };

    localStorage.setItem("user", JSON.stringify(user));

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <div className="flex items-center justify-center px-6 py-20">
        <div className="bg-white p-8 rounded-lg shadow w-full max-w-md">

          <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
            Create Your System
          </h1>

          <p className="text-gray-600 text-center mb-6">
            Start making better decisions today
          </p>

          <div className="space-y-4">

            <input
              type="text"
              placeholder="Full Name"
              className="w-full border border-gray-300 p-3 rounded text-gray-900 placeholder-gray-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

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
              onClick={handleSignup}
              className="w-full bg-black text-white py-3 rounded hover:bg-gray-800"
            >
              Get Started
            </button>

          </div>

          <p className="text-sm text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <span
              className="text-black cursor-pointer font-medium"
              onClick={() => router.push("/login")}
            >
              Login
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}