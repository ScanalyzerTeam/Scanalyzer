"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Camera,
  CheckCircle2,
  Clock,
  Package,
  ScanLine,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { LangSwitcher } from "@/components/lang-switcher";
import { Link } from "@/i18n/navigation";

const LandingPage = () => {
  const t = useTranslations("home");
  const tLanding = useTranslations("landing");

  const { data: scansToday } = useQuery({
    queryKey: ["scansToday"],
    queryFn: async () => {
      const res = await fetch("/api/scans/today", {
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("Failed to fetch scan count");
      return res.json() as Promise<{ count: number }>;
    },
  });

  const featureCards = [
    {
      icon: <Zap className="h-5 w-5 text-[#FFC107]" />,
      title: tLanding("feature_fast_scanning"),
      description:
        tLanding("feature_fast_scanning_desc") ||
        "Scan items in seconds with AI-powered photo recognition",
    },
    {
      icon: <Package className="h-5 w-5 text-[#22d3ee]" />,
      title: tLanding("feature_smart_inventory"),
      description: tLanding("feature_smart_inventory_desc"),
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-[#a855f7]" />,
      title: tLanding("feature_analytics"),
      description: tLanding("feature_analytics_desc"),
    },
    {
      icon: <Camera className="h-5 w-5 text-[#34d399]" />,
      title: tLanding("feature_photo_scanner"),
      description: tLanding("feature_photo_scanner_desc"),
    },
  ];

  const workflowSteps = [
    {
      label: tLanding("workflow_scan_label") || "Scan",
      value:
        tLanding("workflow_scan_value") ||
        "Capture items with photo and barcode scan",
      color: "bg-[#38bdf8]",
    },
    {
      label: tLanding("workflow_organize_label") || "Organize",
      value:
        tLanding("workflow_organize_value") ||
        "Group items into shelves and warehouses",
      color: "bg-[#fbbf24]",
    },
    {
      label: tLanding("workflow_analyze_label") || "Analyze",
      value:
        tLanding("workflow_analyze_value") ||
        "Track stock levels and optimize operations",
      color: "bg-[#a855f7]",
    },
  ];

  const features = [
    {
      icon: <Package className="h-6 w-6 text-[#FFC107]" />,
      bg: "bg-[#FFC107]/10",
      title: tLanding("feature_smart_inventory"),
      description: tLanding("feature_smart_inventory_desc"),
    },
    {
      icon: <Camera className="h-6 w-6 text-[#22d3ee]" />,
      bg: "bg-[#22d3ee]/10",
      title: tLanding("feature_photo_scanner"),
      description: tLanding("feature_photo_scanner_desc"),
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-[#a855f7]" />,
      bg: "bg-[#a855f7]/10",
      title: tLanding("feature_analytics"),
      description: tLanding("feature_analytics_desc"),
    },
  ];

  // Simulated recent activity — replace with real API data if available
  const recentActivity = [
    {
      label: "Shelf B-4 updated",
      time: "2m ago",
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-[#34d399]" />,
    },
    {
      label: "12 items scanned",
      time: "5m ago",
      icon: <ScanLine className="h-3.5 w-3.5 text-[#22d3ee]" />,
    },
    {
      label: "Warehouse A synced",
      time: "11m ago",
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-[#34d399]" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b1121] text-white">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0b1121]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-[#FFC107] shadow-lg shadow-[#FFC107]/20">
                <Image
                  src="/favicon/app_icon.png"
                  alt="Scanalyzer logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-semibold">
                {tLanding("productName")}
              </span>
            </div>
            <div className="flex flex-nowrap items-center gap-3">
              <LangSwitcher landing />
              <Link
                href="/signin"
                className="flex-shrink-0 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm whitespace-nowrap text-white transition hover:border-white/25 hover:bg-white/10"
              >
                {t("signIn")}
              </Link>
              <Link
                href="/signup"
                className="flex-shrink-0 rounded-full bg-[#FFC107] px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-black shadow-lg shadow-[#FFC107]/20 transition hover:bg-[#FFB300]"
              >
                {t("getStartedButton")}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden pt-28 pb-24">
        <div className="pointer-events-none absolute top-0 -right-24 h-72 w-72 rounded-full bg-[#FFC107]/20 blur-3xl" />
        <div className="pointer-events-none absolute top-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#7c3aed]/20 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 shadow-2xl shadow-[#000000]/20">
                <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-[#FFC107]" />
                {tLanding("bannerText")}
              </div>

              <div className="space-y-6">
                <h1 className="max-w-3xl text-5xl leading-tight font-semibold tracking-tight text-white sm:text-6xl">
                  {tLanding("heroTitle")}
                </h1>
                <p className="max-w-2xl text-lg text-gray-300 sm:text-xl">
                  {t("subtitle")}
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-full bg-[#FFC107] px-6 py-3 text-sm font-semibold whitespace-nowrap text-black shadow-lg shadow-[#FFC107]/20 transition hover:bg-[#FFB300]"
                  >
                    {tLanding("getStarted")}
                  </Link>
                  <Link
                    href="/signin"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm whitespace-nowrap text-white transition hover:border-white/25 hover:bg-white/10"
                  >
                    {t("signIn")}
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    label: tLanding("feature_fast_scanning"),
                    value: tLanding("stat_fast"),
                  },
                  {
                    label: tLanding("feature_stock_alerts"),
                    value: tLanding("stat_real_time"),
                  },
                  {
                    label: tLanding("feature_analytics"),
                    value: tLanding("stat_clear_insights"),
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-3xl bg-white/5 p-5 shadow-xl shadow-[#000000]/20 transition duration-500 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <p className="text-sm text-gray-400">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard card */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827]/95 shadow-[0_40px_120px_rgba(20,23,49,0.65)]">
                <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#FFC107] via-[#7c3aed] to-[#22d3ee]" />
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm tracking-[0.32em] text-[#94a3b8] uppercase">
                        {tLanding("warehouseDashboard")}
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold text-white">
                        {tLanding("inventoryOverview")}
                      </h2>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-2xl bg-white/5 px-3 py-1.5 text-xs tracking-[0.28em] text-[#a5b4fc] uppercase">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#34d399]" />
                      {tLanding("liveLabel")}
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4">
                    {/* Items scanned */}
                    <div className="rounded-3xl bg-[#0f172a]/80 p-5">
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>{tLanding("itemsScanned")}</span>
                        <span className="font-semibold text-white">
                          {scansToday ? scansToday.count.toLocaleString() : "—"}
                        </span>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-[#FFC107] to-[#f59e0b]" />
                      </div>
                    </div>

                    {/* Recent activity — replaces Low stock / Packaging / Electronics */}
                    <div className="rounded-3xl bg-[#111827]/90 p-5">
                      <div className="mb-4 flex items-center justify-between text-sm text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          Recent activity
                        </span>
                      </div>
                      <div className="grid gap-2.5">
                        {recentActivity.map((a) => (
                          <div
                            key={a.label}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              {a.icon}
                              <span className="text-sm text-gray-300">
                                {a.label}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {a.time}
                            </span>
                          </div>
                        ))}
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

      {/* WHY SECTION */}
      <section className="bg-[#0f172a] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <p className="text-sm tracking-[0.32em] text-[#94a3b8] uppercase">
              {tLanding("whyTitle")}
            </p>
            <h2 className="text-4xl font-semibold text-white">
              {tLanding("whySubtitle")}
            </h2>
            <p className="max-w-xl text-gray-300">{tLanding("whyDesc")}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {featureCards.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 transition duration-500 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-300">
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

      {/* FEATURES SECTION */}
      <section className="relative overflow-hidden bg-[#111827] px-4 py-20 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-[#7c3aed]/10 blur-3xl" />
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm tracking-[0.32em] text-[#94a3b8] uppercase">
            {tLanding("featuresLabel")}
          </p>
          <h2 className="mt-3 text-4xl font-semibold text-white">
            {tLanding("featuresSubtitle")}
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-white/10 bg-[#0f172a]/90 p-7 transition duration-500 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${feature.bg}`}
                >
                  {feature.icon}
                </div>
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

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#FFC107] via-[#fcd34d] to-[#f59e0b] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/20 bg-black/10 p-12 text-center shadow-2xl shadow-[#000000]/30">
          <h2 className="text-3xl font-semibold text-black">
            {tLanding("readyTitle")}
          </h2>
          <p className="mt-4 text-base text-black/80">
            {tLanding("readyDesc")}
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-black px-8 py-3 text-sm font-semibold text-[#FFC107] transition hover:bg-neutral-900"
          >
            {tLanding("getStarted")}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
