"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation"; // Import router
import { useEffect } from "react";
import LandingPage from "./landingpage/page";

export default function Page() {
  const { status } = useSession();
  const router = useRouter();

  // Use useEffect to handle the redirect safely on the client side
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Show nothing while checking (or a loading spinner)
  if (status === "loading") {
    return <div className="min-h-screen bg-[#1a1d2e]" />; 
  }

  // If not logged in, show the Landing Page
  if (status === "unauthenticated") {
    return <LandingPage />;
  }

  // While redirecting, show a dark background so it doesn't flicker white
  return <div className="min-h-screen bg-[#1a1d2e]" />;
}