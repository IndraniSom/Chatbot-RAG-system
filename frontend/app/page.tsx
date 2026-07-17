import { redirect } from "next/navigation";

/**
 * Marketing landing is intentionally a stub for now — visitors land in the
 * dashboard once they're signed in, otherwise in /login.
 */
export default function HomePage() {
  redirect("/login");
}
