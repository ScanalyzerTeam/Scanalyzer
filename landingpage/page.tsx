"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

const LandingPage = () => {
  const t = useTranslations("home");
  const tLanding = useTranslations("landing");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1d2e] via-[#2a2d3e] to-[#1a1d2e] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-[#2a2d3e] bg-[#1a1d2e]/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFC107]">
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
              <span className="text-xl font-bold text-white">
                {tLanding("productName")}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/signup"
                className="rounded-lg bg-[#FFC107] px-4 py-2 font-medium text-black transition hover:bg-[#FFB300]"
              >
                {t("getStartedButton")}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-white sm:text-6xl lg:text-7xl">
            Scanalyzer
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-300 sm:text-2xl">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* About / Info Section */}
      <section className="bg-[#2a2d3e] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="mb-6 text-3xl font-bold">{tLanding("aboutTitle")}</h2>
          <p className="mb-4 text-gray-300">{tLanding("aboutPara1")}</p>
          <p className="mb-4 text-gray-300">{tLanding("aboutPara2")}</p>
          <p className="text-gray-300">{tLanding("aboutPara3")}</p>
        </div>
      </section>

      {/* Features / Highlight Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 text-center md:grid-cols-3">
          <div className="rounded-xl bg-[#1a1d2e] p-6 shadow-lg">
            <h3 className="mb-2 text-xl font-semibold">
              {tLanding("feature_smart_inventory")}
            </h3>
            <p className="text-gray-300">
              {tLanding("feature_smart_inventory_desc")}
            </p>
          </div>
          <div className="rounded-xl bg-[#1a1d2e] p-6 shadow-lg">
            <h3 className="mb-2 text-xl font-semibold">
              {tLanding("feature_photo_scanner")}
            </h3>
            <p className="text-gray-300">
              {tLanding("feature_photo_scanner_desc")}
            </p>
          </div>
          <div className="rounded-xl bg-[#1a1d2e] p-6 shadow-lg">
            <h3 className="mb-2 text-xl font-semibold">
              {tLanding("feature_analytics")}
            </h3>
            <p className="text-gray-300">
              {tLanding("feature_analytics_desc")}
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="rounded-t-3xl bg-[#FFC107] px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="mb-6 text-3xl font-bold text-black">
          {tLanding("cta_title")}
        </h2>
        <p className="mb-6 text-black">{tLanding("cta_desc")}</p>
        <Link href="/signup">{tLanding("getStarted")}</Link>
      </section>
    </div>
  );
};

export default LandingPage;
