"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const ProfilePage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    jobTitle: "Warehouse Manager",
    location: "District 5",
  });

  useEffect(() => {
    if (status !== "loading") {
      setIsLoading(false);
      if (status === "unauthenticated") {
        router.push("/");
      } else if (session?.user) {
        setFormData((prev) => ({
          ...prev,
          name: session.user?.name || "",
          email: session.user?.email || "",
        }));
      }
    }
  }, [status, router, session]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const handleSave = () => {
    setIsEditing(false);
    // TODO: Add API call to save profile changes
  };

  const menuItems = [
    { icon: "📊", label: "Dashboard", href: "/dashboard" },
    { icon: "📷", label: "Scanner", href: "/scanner" },
    { icon: "🏢", label: "Warehouse", href: "/warehouse" },
    { icon: "💬", label: "AI Assistant", href: "/ai-assistant" },
    { icon: "👤", label: "Profile", href: "/profile" },
  ];

  if (isLoading || !session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1d2e]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

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
          <h1 className="mb-2 text-3xl font-bold text-black">Profile</h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-black">
                  Personal Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="rounded-lg bg-[#FFC107] px-4 py-2 font-medium text-black transition hover:bg-[#FFB800]"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-600 transition hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="rounded-lg bg-[#FFC107] px-4 py-2 font-medium text-black transition hover:bg-[#FFB800]"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!isEditing}
                    className={`w-full rounded-lg border px-4 py-3 ${
                      isEditing
                        ? "border-gray-300 bg-white focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 focus:outline-none"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                    }`}
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={!isEditing}
                    className={`w-full rounded-lg border px-4 py-3 ${
                      isEditing
                        ? "border-gray-300 bg-white focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 focus:outline-none"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                    }`}
                  />
                </div>

                {/* Job Title Field */}
                <div>
                  <label
                    htmlFor="jobTitle"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Job Title
                  </label>
                  <input
                    id="jobTitle"
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, jobTitle: e.target.value })
                    }
                    disabled={!isEditing}
                    className={`w-full rounded-lg border px-4 py-3 ${
                      isEditing
                        ? "border-gray-300 bg-white focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 focus:outline-none"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                    }`}
                  />
                </div>

                {/* Location Field */}
                <div>
                  <label
                    htmlFor="location"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    disabled={!isEditing}
                    className={`w-full rounded-lg border px-4 py-3 ${
                      isEditing
                        ? "border-gray-300 bg-white focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 focus:outline-none"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Avatar Card */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center">
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                  <svg
                    className="h-12 w-12 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-black">
                  {session.user.name}
                </h3>
                <p className="text-sm text-gray-600">{formData.jobTitle}</p>
              </div>
            </div>

            {/* Account Info Card */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-black">Account Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member since</span>
                  <span className="font-medium text-black">Jan 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
