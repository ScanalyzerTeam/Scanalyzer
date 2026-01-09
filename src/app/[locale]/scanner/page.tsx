"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const ScannerPage = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const menuItems = [
    { icon: "📊", label: "Dashboard", href: "/dashboard" },
    { icon: "📷", label: "Scanner", href: "/scanner" },
    { icon: "🏢", label: "Warehouse", href: "/warehouse" },
    { icon: "💬", label: "AI Assistant", href: "/ai-assistant" },
  ];

  const recentScans = [
    { title: "Product 47", meta: "ITEM-8472 • Zone A", time: "10:23 AM" },
    { title: "Product 23", meta: "ITEM-2156 • Zone B", time: "10:21 AM" },
    { title: "Product 81", meta: "ITEM-9834 • Zone A", time: "10:18 AM" },
    { title: "Product 12", meta: "ITEM-5621 • Zone C", time: "10:15 AM" },
    { title: "Product 94", meta: "ITEM-7483 • Zone A", time: "10:12 AM" },
  ];

  const [scanning, setScanning] = useState(false);

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
          <h1 className="mb-2 text-3xl font-bold text-black">Scanner</h1>
          <p className="text-gray-600">Scan and track warehouse items</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Scan Card */}
          <div className="lg:col-span-2">
            <div className="flex h-full flex-col items-center justify-center rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-6 flex h-64 w-full items-center justify-center">
                <div className="flex h-56 w-full max-w-md items-center justify-center rounded-xl border-2 border-gray-200">
                  <svg
                    className="h-20 w-20 text-gray-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 3v4" />
                    <path d="M15 3v4" />
                    <path d="M9 21v-4" />
                    <path d="M15 21v-4" />
                  </svg>
                </div>
              </div>

              <button
                onClick={() => setScanning((s) => !s)}
                className="rounded-lg bg-[#FFC107] px-6 py-3 font-semibold text-black transition hover:bg-[#FFB300]"
              >
                {scanning ? "Stop Scan" : "Start Scan"}
              </button>
            </div>
          </div>

          {/* Recent Scans */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-black">Recent Scans</h3>
                <p className="text-sm text-gray-500">
                  Total scanned: {recentScans.length}
                </p>
              </div>
            </div>

            <div className="divide-y">
              {recentScans.map((scan, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF9E6] text-[#FFC107]">
                      ✓
                    </div>
                    <div>
                      <div className="text-sm font-medium text-black">
                        {scan.title}
                      </div>
                      <div className="text-xs text-gray-500">{scan.meta}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{scan.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScannerPage;
