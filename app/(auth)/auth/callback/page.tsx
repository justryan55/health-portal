"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/supabase-client";
import spinnerBlack from "@/public/spinner-black.svg";
import Image from "next/image";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (session) {
        router.push("/dashboard");
      } else {
        console.error("OAuth callback failed", error);
        router.push("/auth/login");
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <Image src={spinnerBlack} alt="loading-spinner" />
    </div>
  );
}
