"use client";

import { Reveal } from "./Reveal";

export function SectionHeader({
  eyebrow,
  title,
  description,
  center = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-iris-700">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-[1.9rem] font-bold tracking-tight text-ink-900 sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-[15px] leading-relaxed text-ink-600">
          {description}
        </p>
      )}
    </Reveal>
  );
}
