"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const LandingPage = () => {
  const t = useTranslations("home");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1d2e] via-[#2a2d3e] to-[#1a1d2e] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#1a1d2e]/80 backdrop-blur-md border-b border-[#2a2d3e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-[#FFC107] flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">Scanalyzer</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/signup"
                className="bg-[#FFC107] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#FFB300] transition"
              >
                {t("getStartedButton")}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="mb-6 text-4xl font-bold text-white sm:text-6xl lg:text-7xl">
            Scanalyzer
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-300 sm:text-2xl">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* About / Info Section */}
      <section className="bg-[#2a2d3e] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">About Our Project</h2>
          <p className="text-gray-300 mb-4">
            We are a dedicated project team building an AI-powered warehouse
            system designed to make managing your inventory simple and
            intelligent. With Scanalyzer, you can create, view, and organize
            your warehouse efficiently.
          </p>
          <p className="text-gray-300 mb-4">
            Our system also features an advanced photo scanner that allows you
            to quickly capture and catalog items, making tracking your stock
            faster than ever.
          </p>
          <p className="text-gray-300">
            Whether you are a small business or a large warehouse, our platform
            helps you streamline operations, improve accuracy, and save time
            while giving you full visibility over your inventory.
          </p>
        </div>
      </section>

      {/* Features / Highlight Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-[#1a1d2e] rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Smart Inventory</h3>
            <p className="text-gray-300">
              AI-powered tracking and management for all your warehouse items.
            </p>
          </div>
          <div className="p-6 bg-[#1a1d2e] rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Photo Scanner</h3>
            <p className="text-gray-300">
              Quickly capture, catalog, and track items using our built-in
              photo scanner.
            </p>
          </div>
          <div className="p-6 bg-[#1a1d2e] rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-gray-300">
              Visualize and analyze your warehouse data to make smarter
              decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-[#FFC107] py-20 px-4 sm:px-6 lg:px-8 text-center rounded-t-3xl">
        <h2 className="text-3xl font-bold mb-6 text-black">Ready? Let&apos;s Start!</h2>
        <p className="text-black mb-6">
          Sign up now and take control of your warehouse with our AI-powered system.
        </p>
        <Link
          href="/signup"
          className="bg-black text-[#FFC107] px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
        >
          Get Started
        </Link>
      </section>
    </div>
  );
};

export default LandingPage;