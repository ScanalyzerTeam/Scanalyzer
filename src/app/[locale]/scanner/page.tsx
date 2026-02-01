"use client";

import { Camera, CheckCircle, Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { AnalyzingSpinner } from "@/components/scanner/AnalyzingSpinner";
import { PhotoCapture } from "@/components/scanner/PhotoCapture";
import {
  type SuggestedItem,
  SuggestionsList,
} from "@/components/scanner/SuggestionsList";
import { WarehouseShelfSelector } from "@/components/scanner/WarehouseShelfSelector";
import { Button } from "@/components/ui/button";

type ScanState = "capture" | "analyzing" | "review" | "creating" | "done";

const ScannerPage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("scanner");

  const [state, setState] = useState<ScanState>("capture");
  const [imageUrl, setImageUrl] = useState("");
  const [items, setItems] = useState<SuggestedItem[]>([]);
  const [error, setError] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [shelfId, setShelfId] = useState("");
  const [createResult, setCreateResult] = useState({ created: 0, total: 0 });

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const menuItems = [
    { icon: "📊", label: "Dashboard", href: "/dashboard" },
    { icon: "📷", label: "Scanner", href: "/scanner" },
    { icon: "🏢", label: "Warehouse", href: "/warehouse" },
    { icon: "💬", label: "AI Assistant", href: "/ai-assistant" },
    { icon: "👤", label: "Profile", href: "/profile" },
  ];

  const handleCapture = async (dataUrl: string) => {
    setImageUrl(dataUrl);
    setError("");
    setState("analyzing");

    try {
      const res = await fetch("/api/scan/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      const data = await res.json();
      const suggestions: SuggestedItem[] = data.items.map(
        (item: {
          name: string;
          description: string;
          quantity: number;
          isContainer: boolean;
        }) => ({
          ...item,
          included: true,
        }),
      );
      setItems(suggestions);
      setState("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setState("capture");
    }
  };

  const handleCreate = async () => {
    const included = items.filter((i) => i.included);
    if (!shelfId || included.length === 0) return;

    setState("creating");

    const results = await Promise.allSettled(
      included.map((item) =>
        fetch("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shelfId,
            name: item.name,
            description: item.description,
            isContainer: item.isContainer,
            quantity: item.quantity,
          }),
        }),
      ),
    );

    const created = results.filter(
      (r) => r.status === "fulfilled" && (r.value as Response).ok,
    ).length;
    setCreateResult({ created, total: included.length });
    setState("done");
  };

  const resetScan = () => {
    setState("capture");
    setImageUrl("");
    setItems([]);
    setError("");
    setWarehouseId("");
    setShelfId("");
  };

  const includedCount = items.filter((i) => i.included).length;
  const canCreate = shelfId && includedCount > 0;

  return (
    <div className="flex min-h-screen bg-[#1a1d2e]">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-white p-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFC107]">
            <svg
              className="h-7 w-7 text-black"
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
          <span className="font-semibold text-black">AI Warehouse</span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname?.includes(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#FFF9E6] text-black"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#f5f5f5] p-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-black">{t("title")}</h1>
          <p className="text-gray-600">{t("subtitle")}</p>
        </div>

        <div className="mx-auto max-w-3xl">
          {/* CAPTURE STATE */}
          {state === "capture" && (
            <div className="rounded-xl bg-white p-8 shadow-sm">
              <PhotoCapture onCapture={handleCapture} />
              {error && (
                <div className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* ANALYZING STATE */}
          {state === "analyzing" && (
            <div className="rounded-xl bg-white p-8 shadow-sm">
              <AnalyzingSpinner imageUrl={imageUrl} />
            </div>
          )}

          {/* REVIEW STATE */}
          {state === "review" && (
            <div className="space-y-6">
              {/* Image thumbnail */}
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Scanned"
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-black">
                      {t("itemsDetected", { count: items.length })}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t("reviewDescription")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warehouse / Shelf selector */}
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-black">
                  {t("destination")}
                </h3>
                <WarehouseShelfSelector
                  warehouseId={warehouseId}
                  shelfId={shelfId}
                  onWarehouseChange={setWarehouseId}
                  onShelfChange={setShelfId}
                />
              </div>

              {/* Items list */}
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-black">
                  {t("suggestedItems")}
                </h3>
                <SuggestionsList items={items} onChange={setItems} />
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={resetScan}
                  className="text-black"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t("scanAgain")}
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!canCreate}
                  className="bg-[#FFC107] text-black hover:bg-[#FFB300] disabled:opacity-50"
                >
                  {t("createItems")} ({includedCount})
                </Button>
              </div>
            </div>
          )}

          {/* CREATING STATE */}
          {state === "creating" && (
            <div className="rounded-xl bg-white p-8 shadow-sm">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#FFC107]" />
                <p className="text-sm font-medium text-gray-600">
                  {t("creatingItems")}
                </p>
              </div>
            </div>
          )}

          {/* DONE STATE */}
          {state === "done" && (
            <div className="rounded-xl bg-white p-8 shadow-sm">
              <div className="flex flex-col items-center gap-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <h3 className="text-lg font-semibold text-black">
                  {t("createdResult", {
                    created: createResult.created,
                    total: createResult.total,
                  })}
                </h3>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={resetScan}
                    className="text-black"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {t("scanMore")}
                  </Button>
                  <Link href="/warehouse">
                    <Button className="bg-[#FFC107] text-black hover:bg-[#FFB300]">
                      {t("viewWarehouse")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ScannerPage;
