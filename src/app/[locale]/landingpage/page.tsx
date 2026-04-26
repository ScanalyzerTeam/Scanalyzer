"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

const LandingPage = () => {
  const t = useTranslations("home");

  const featureCards = [
    {
      title: "Fast setup",
      description:
        "Start scanning inventory in minutes without long configuration.",
    },
    {
      title: "Accurate results",
      description: "AI helps reduce manual errors and improves stock accuracy.",
    },
    {
      title: "Visual intelligence",
      description: "See your warehouse data clearly with smart visual reports.",
    },
    {
      title: "Mobile-ready",
      description: "Use scanning and inventory tools on the go.",
    },
  ];

  const workflowSteps = [
    {
      label: "Scan",
      value: "Capture items with photo and barcode scan",
      color: "bg-[#38bdf8]",
    },
    {
      label: "Organize",
      value: "Group items into shelves and warehouses",
      color: "bg-[#fbbf24]",
    },
    {
      label: "Analyze",
      value: "Track stock levels and optimize operations",
      color: "bg-[#a855f7]",
    },
  ];

  const features = [
    {
      title: "Smart Inventory",
      description:
        "AI-powered tracking for your items, shelves, and warehouses.",
    },
    {
      title: "Photo Scanner",
      description: "Capture items quickly and keep records instantly.",
    },
    {
      title: "Analytics",
      description:
        "Use dashboards and alerts for proactive warehouse management.",
    },
  ];

  const delayClasses = [
    "animation-delay-100",
    "animation-delay-200",
    "animation-delay-300",
  ];

  return (
    <div className="min-h-screen bg-[#0b1121] text-white">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0b1121]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFC107] text-black shadow-lg shadow-[#FFC107]/20">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold">Scanalyzer</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/signin"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-white/25 hover:bg-white/10"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[#FFC107] px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-[#FFC107]/20 transition hover:bg-[#FFB300]"
              >
                {t("getStartedButton")}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden pt-28 pb-24">
        <div className="pointer-events-none absolute top-0 -right-24 h-72 w-72 rounded-full bg-[#FFC107]/20 blur-3xl" />
        <div className="pointer-events-none absolute top-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#7c3aed]/20 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 shadow-2xl shadow-[#000000]/20">
                <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-[#FFC107]" />
                Intelligent warehouse management, built for speed.
              </div>

              <div className="space-y-6">
                <h1 className="max-w-3xl text-5xl leading-tight font-semibold tracking-tight text-white sm:text-6xl">
                  Reimagine warehouse control with AI-powered scanning.
                </h1>
                <p className="max-w-2xl text-lg text-gray-300 sm:text-xl">
                  {t("subtitle")}
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-full bg-[#FFC107] px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-[#FFC107]/20 transition hover:bg-[#FFB300]"
                  >
                    {t("getStartedButton")}
                  </Link>
                  <Link
                    href="/signin"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm text-white transition hover:border-white/25 hover:bg-white/10"
                  >
                    Sign in
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-white/5 p-5 shadow-xl shadow-[#000000]/20 transition duration-500 hover:-translate-y-1 hover:shadow-2xl">
                  <p className="text-sm text-gray-400">Fast item scanning</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    2x faster
                  </p>
                </div>
                <div className="rounded-3xl bg-white/5 p-5 shadow-xl shadow-[#000000]/20 transition duration-500 hover:-translate-y-1 hover:shadow-2xl">
                  <p className="text-sm text-gray-400">Smart stock alerts</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    Real time
                  </p>
                </div>
                <div className="rounded-3xl bg-white/5 p-5 shadow-xl shadow-[#000000]/20 transition duration-500 hover:-translate-y-1 hover:shadow-2xl">
                  <p className="text-sm text-gray-400">Warehouse analytics</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    Clear insights
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827]/95 shadow-[0_40px_120px_rgba(20,23,49,0.65)]">
                <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#FFC107] via-[#7c3aed] to-[#22d3ee]" />
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm tracking-[0.32em] text-[#94a3b8] uppercase">
                        Warehouse dashboard
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold text-white">
                        Inventory overview
                      </h2>
                    </div>
                    <div className="rounded-2xl bg-white/5 px-4 py-2 text-xs tracking-[0.28em] text-[#a5b4fc] uppercase">
                      Live
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4">
                    <div className="rounded-3xl bg-[#0f172a]/80 p-5">
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Items scanned</span>
                        <span className="text-white">1,246</span>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-4/5 rounded-full bg-[#FFC107]" />
                      </div>
                    </div>

                    <div className="rounded-3xl bg-[#111827]/90 p-5">
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Pending restock</span>
                        <span className="text-white">34</span>
                      </div>
                      <div className="mt-4 grid gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-[#22d3ee]" />
                          <span className="text-sm text-gray-300">
                            Packaging
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-[#a855f7]" />
                          <span className="text-sm text-gray-300">
                            Electronics
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-[#22d3ee]/10 blur-3xl" />
              </div>
              <div className="mt-10 hidden overflow-hidden rounded-[2rem] border border-white/10 shadow-xl shadow-[#000000]/20 lg:block">
                <Image
                  src="/chuttersnap.jpg"
                  alt="Warehouse overview"
                  width={560}
                  height={280}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0f172a] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <p className="text-sm tracking-[0.32em] text-[#94a3b8] uppercase">
              Why Scanalyzer
            </p>
            <h2 className="text-4xl font-semibold text-white">
              A smarter workflow for every warehouse.
            </h2>
            <p className="max-w-xl text-gray-300">
              Built to help teams move faster, prevent stockouts, and keep every
              shelf optimized with fewer clicks. Bring your warehouse processes
              into one polished dashboard.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {featureCards.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 transition duration-500 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <h3 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-gray-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-[#000000]/40">
            <div className="grid gap-6">
              {workflowSteps.map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl bg-[#0f172a]/80 p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold tracking-[0.28em] text-gray-400 uppercase">
                      {item.label}
                    </span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                    />
                  </div>
                  <p className="mt-4 text-gray-300">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#111827] px-4 py-20 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-[#7c3aed]/10 blur-3xl" />
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm tracking-[0.32em] text-[#94a3b8] uppercase">
            Features
          </p>
          <h2 className="mt-3 text-4xl font-semibold text-white">
            Everything your warehouse needs in one place
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`rounded-3xl border border-white/10 bg-[#0f172a]/90 p-7 transition duration-500 hover:-translate-y-1 hover:shadow-2xl ${delayClasses[index]}`}
              >
                <div className="mb-4 h-12 w-12 rounded-2xl bg-white/5" />
                <h3 className="text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#FFC107] via-[#fcd34d] to-[#f59e0b] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/20 bg-black/10 p-12 text-center shadow-2xl shadow-[#000000]/30">
          <h2 className="text-3xl font-semibold text-black">
            Ready to modernize your warehouse?
          </h2>
          <p className="mt-4 text-base text-black/80">
            Join Scanalyzer and start managing inventory with speed, clarity,
            and AI support.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-black px-8 py-3 text-sm font-semibold text-[#FFC107] transition hover:bg-neutral-900"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
