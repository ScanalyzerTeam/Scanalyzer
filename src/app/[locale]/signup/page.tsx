"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      // Create user
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      // Auto sign in after successful signup
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but login failed. Please try signing in.");
        setLoading(false);
        return;
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1d2e] p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border-4 border-[#2a2d3e] bg-white shadow-2xl">
        <div className="grid md:grid-cols-2">
          {/* Left Side - Branding */}
          <div className="flex flex-col items-center justify-center bg-[#FFC107] p-12 md:p-16">
            <div className="text-center">
              {/* Icon */}
              <div className="mx-auto mb-6 flex h-36 w-36 items-center justify-center rounded-3xl bg-black">
                <svg
                  className="h-20 w-20 text-[#FFC107]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>

              {/* Title */}
              <h1 className="mb-3 text-2xl font-semibold text-black">
                AI Warehouse
              </h1>

              {/* Subtitle */}
              <p className="text-base text-black/80">
                Manage your warehouse intelligently
              </p>
            </div>
          </div>

          {/* Right Side - Sign Up Form */}
          <div className="flex flex-col justify-center bg-[#f5f5f5] p-12 md:p-16">
            <div className="mx-auto w-full max-w-sm">
              {/* Header */}
              <div className="mb-8">
                <h2 className="mb-2 text-3xl font-bold text-black">
                  Create Account
                </h2>
                <p className="text-sm text-gray-600">
                  Sign up for a new account
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-black"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-400 transition focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 focus:outline-none"
                    required
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-black"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-400 transition focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 focus:outline-none"
                    required
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-black"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-400 transition focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 focus:outline-none"
                    required
                  />
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-black"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-400 transition focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 focus:outline-none"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#FFC107] px-4 py-3 font-semibold text-black transition hover:bg-[#FFB300] focus:ring-2 focus:ring-[#FFC107] focus:ring-offset-2 focus:outline-none"
                >
                  Sign Up
                </button>
              </form>

              {/* Sign In Link */}
              <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/"
                  className="font-medium text-[#FFC107] transition hover:text-[#FFB300]"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
