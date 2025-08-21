"use client";
import { usePathname } from "next/navigation";
import MarketingLayout from "./marketingLayout";

export default function AppLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Dashboard and admin routes use their own layouts
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return <MarketingLayout>{children}</MarketingLayout>;
}
