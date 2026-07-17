"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Globe, Type } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AddWebsiteForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        setError("Please enter a valid URL.");
        return;
      }
    } catch {
      setError("Please enter a valid URL.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter a website name.");
      return;
    }
    setLoading(true);
    // Mock submission: route back to /dashboard/websites
    window.setTimeout(() => router.push("/dashboard/websites"), 400);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input
        label="Website name"
        type="text"
        name="name"
        placeholder="Run For Safe Food"
        value={name}
        onChange={(e) => setName(e.target.value)}
        leftIcon={<Type size={15} strokeWidth={2} />}
        required
      />
      <Input
        label="Website URL"
        type="text"
        name="url"
        placeholder="https://runforsafefood.org"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        leftIcon={<Globe size={15} strokeWidth={2} />}
        hint="Include the full https:// URL."
        error={error ?? undefined}
        required
      />
      <Button
        type="submit"
        size="lg"
        loading={loading}
        rightIcon={<ArrowRight size={15} strokeWidth={2.4} />}
      >
        Submit Website
      </Button>
    </form>
  );
}
