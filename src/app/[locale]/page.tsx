"use client";

import { useSession } from "next-auth/react";
import LandingPage from "./landingpage/page";
// import HomePage if you want to show login separately
// import HomePage from "./login";

export default function Page() {
  const { status } = useSession();

  // Only show landing page for unauthenticated users
  if (status === "unauthenticated" || status === "loading") {
    return <LandingPage />;
  }

  // Optionally, you can render login page while checking auth
  // return <HomePage />;

  return null;
}