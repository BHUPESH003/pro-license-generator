"use client";
import { usePathname } from "next/navigation";
import MarketingLayout from "./marketingLayout";

export default function AppLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard")) {
    return <>{children}</>;
  }
  return <MarketingLayout>{children}</MarketingLayout>;
}
