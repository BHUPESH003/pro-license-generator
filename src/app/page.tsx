import { redirect } from "next/navigation";

export default function Home() {
  // Always redirect to the marketing landing page
  redirect("/marketing");
  return null;
}
