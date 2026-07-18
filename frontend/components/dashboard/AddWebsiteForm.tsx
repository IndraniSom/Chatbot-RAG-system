"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowRight, Globe, Type } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError, websitesApi } from "@/lib/api";

export function AddWebsiteForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter a website name.");
      return;
    }
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

    setLoading(true);
    try {
      await websitesApi.create({ name: name.trim(), url: url.trim() });
      toast.success("Website submitted! Waiting for admin approval.");
      router.push("/dashboard/websites");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.serverMessage ?? err.message
          : "Could not submit website. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
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