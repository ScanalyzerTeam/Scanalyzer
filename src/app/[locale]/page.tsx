"use client";

import { useSession } from "next-auth/react";
import LandingPage from "./landingpage/page";
// import HomePage if you want to show login separately
// import HomePage from "./login";

export default function Page() {
  const { status } = useSession();

<<<<<<< HEAD
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
=======
  // Only show landing page for unauthenticated users
  if (status === "unauthenticated" || status === "loading") {
    return <LandingPage />;
  }

  // Optionally, you can render login page while checking auth
  // return <HomePage />;

  return null;
}
>>>>>>> ccd7804f01ac38d82c35a79b83d911f5ce9f2e1a
