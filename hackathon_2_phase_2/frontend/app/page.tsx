import { redirect } from "next/navigation";

export default async function RootPage() {
  // This will be handled by middleware, but we'll redirect as fallback
  redirect("/dashboard");
}
