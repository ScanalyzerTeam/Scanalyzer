"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const WarehousePage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedZone, setSelectedZone] = useState("A");

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

  const zones = [
    { name: "Zone A", items: 342, capacity: 85, color: "bg-[#FFC107]" },
    { name: "Zone B", items: 218, capacity: 54, color: "bg-gray-200" },
    { name: "Zone C", items: 156, capacity: 39, color: "bg-gray-200" },
    { name: "Zone D", items: 412, capacity: 73, color: "bg-gray-200" },
    { name: "Zone E", items: 298, capacity: 61, color: "bg-gray-200" },
    { name: "Zone F", items: 521, capacity: 92, color: "bg-gray-200" },
  ];

  const selectedZoneData = zones.find((z) => z.name === `Zone ${selectedZone}`);

  return (
    <div className="flex min-h-screen bg-[#1a1d2e]">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-white p-6">
        {/* Logo */}
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

        {/* Navigation */}
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

        {/* Logout */}
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-black">
            Virtual Warehouse
          </h1>
          <p className="text-gray-600">
            Interactive 3D floor plan and zone management
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Zones Grid */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              {/* Toolbar */}
              <div className="mb-6 flex items-center gap-4">
                <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  Zoom In
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                  Zoom Out
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                  3D View
                </button>
              </div>

              {/* Zones */}
              <div className="grid grid-cols-3 gap-4">
                {zones.map((zone) => (
                  <button
                    key={zone.name}
                    onClick={() => setSelectedZone(zone.name.split(" ")[1])}
                    className={`rounded-xl p-6 text-left transition hover:shadow-md ${
                      zone.name === `Zone ${selectedZone}`
                        ? zone.color
                        : "bg-gray-100"
                    }`}
                  >
                    <div className="mb-2 text-lg font-bold text-black">
                      {zone.name}
                    </div>
                    <div className="mb-1 text-2xl font-bold text-black">
                      {zone.items} items
                    </div>
                    <div className="text-sm text-black/70">
                      {zone.capacity}% capacity
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Zone Details */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-black">
              Zone {selectedZone} - Selected
            </h3>

            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Capacity</span>
                  <span className="text-sm font-semibold text-black">
                    {selectedZoneData?.capacity}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-[#FFC107]"
                    style={{ width: `${selectedZoneData?.capacity}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-sm text-gray-600">Total Items</span>
                <span className="text-lg font-bold text-black">
                  {selectedZoneData?.items}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Category</span>
                <span className="text-sm font-medium text-black">
                  Electronics
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="text-sm font-medium text-green-600">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-4">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm font-medium text-black">
                  2 min ago
                </span>
              </div>

              <button className="w-full rounded-lg bg-[#FFC107] px-4 py-3 font-semibold text-black transition hover:bg-[#FFB300]">
                View Details
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WarehousePage;
