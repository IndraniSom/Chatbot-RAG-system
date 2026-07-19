"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, ImagePlus, Palette } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

const presets = [
  { name: "Forest studio", primary: "#315C48", surface: "#F4F1E8" },
  { name: "Clay shop", primary: "#D75C38", surface: "#FFF4EA" },
  { name: "Blue editorial", primary: "#3159D4", surface: "#F0F4FF" },
];

export function CustomizationShowcase() {
  const [primaryColor, setPrimaryColor] = useState(presets[0].primary);
  const [surfaceColor, setSurfaceColor] = useState(presets[0].surface);
  const foreground = useMemo(() => readableText(primaryColor), [primaryColor]);

  return (
    <section id="customize" className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
      <SectionHeader
        eyebrow="Make it yours"
        title="A chatbot that belongs on your website"
        description="Upload your mark and tune the widget screen in the dashboard. The installed assistant updates automatically — no new script tag required."
      />

      <Reveal className="mt-12" delay={0.08}>
        <div className="grid overflow-hidden rounded-[2rem] border border-ink-900/10 bg-white/80 shadow-[0_34px_90px_-60px_rgba(10,10,11,0.7)] lg:grid-cols-[0.8fr_1.2fr]">
          <div className="border-b border-ink-900/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-iris-50 text-iris-700">
                <Palette size={19} />
              </span>
              <div>
                <p className="text-[14px] font-semibold text-ink-900">Brand controls</p>
                <p className="text-[12px] text-ink-500">Preview a palette below</p>
              </div>
            </div>

            <div className="mt-7 space-y-3">
              {presets.map((preset) => {
                const active = preset.primary === primaryColor;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setPrimaryColor(preset.primary);
                      setSurfaceColor(preset.surface);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-left transition-all ${
                      active
                        ? "border-ink-900/20 bg-[#F8F5EE] shadow-sm"
                        : "border-transparent hover:border-ink-900/10 hover:bg-white"
                    }`}
                    aria-pressed={active}
                  >
                    <span>
                      <span className="block text-[13px] font-semibold text-ink-800">{preset.name}</span>
                      <span className="mt-0.5 block font-mono text-[10px] text-ink-500">
                        {preset.primary} · {preset.surface}
                      </span>
                    </span>
                    <span className="flex -space-x-1">
                      <span className="h-7 w-7 rounded-full border-2 border-white" style={{ backgroundColor: preset.primary }} />
                      <span className="h-7 w-7 rounded-full border-2 border-white" style={{ backgroundColor: preset.surface }} />
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <ColorControl label="Brand" value={primaryColor} onChange={setPrimaryColor} />
              <ColorControl label="Screen" value={surfaceColor} onChange={setSurfaceColor} />
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-xl border border-dashed border-ink-900/15 bg-[#F8F5EE]/70 p-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-ink-500 shadow-sm">
                <ImagePlus size={17} />
              </span>
              <div>
                <p className="text-[12.5px] font-semibold text-ink-800">Your logo goes here</p>
                <p className="text-[11px] text-ink-500">PNG, JPEG or WebP · stored securely</p>
              </div>
            </div>

            <Link
              href="/dashboard/websites"
              className="mt-7 inline-flex items-center gap-1.5 text-[13px] font-semibold text-iris-700 transition-colors hover:text-iris-900"
            >
              Customize in dashboard <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="relative min-h-[520px] overflow-hidden p-6 sm:p-10" style={{ backgroundColor: surfaceColor }}>
            <div aria-hidden className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-[42px] border-white/40" />
            <div aria-hidden className="absolute bottom-8 left-8 h-24 w-24 rotate-12 rounded-[2rem] bg-white/35" />
            <div className="relative mx-auto max-w-[390px] overflow-hidden rounded-[1.7rem] border border-ink-900/10 bg-white shadow-[0_30px_70px_-42px_rgba(10,10,11,0.7)]">
              <div className="flex items-center justify-between px-5 py-4" style={{ backgroundColor: primaryColor, color: foreground }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                    <BotMark />
                  </span>
                  <div className="font-zilla">
                    <p className="text-[15px] font-semibold leading-none">Studio assistant</p>
                    <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.16em] opacity-70">Ready to help</p>
                  </div>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-300 ring-4 ring-white/10" />
              </div>
              <div className="min-h-[330px] bg-[#FBFAF7] p-5 font-zilla text-[14px] text-ink-700">
                <div className="max-w-[82%] rounded-[16px_16px_16px_5px] border border-ink-900/10 bg-white px-4 py-3">
                  Welcome! How can I help with your order?
                </div>
                <div
                  className="ml-auto mt-4 max-w-[72%] rounded-[16px_16px_5px_16px] px-4 py-3"
                  style={{ backgroundColor: primaryColor, color: foreground }}
                >
                  Can I change the delivery date?
                </div>
                <div className="mt-4 max-w-[86%] rounded-[16px_16px_16px_5px] border border-ink-900/10 bg-white px-4 py-3 leading-relaxed">
                  Absolutely. Open your order link and choose a new available date — I can guide you through it.
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-ink-900/10 bg-white p-3">
                <span className="flex-1 rounded-xl border border-ink-900/10 px-3 py-2.5 font-zilla text-[13px] text-ink-400">Ask a question…</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: primaryColor, color: foreground }}>
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="rounded-xl border border-ink-900/10 bg-white p-3">
      <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-ink-500">{label}</span>
      <span className="mt-2 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent p-0"
          aria-label={`${label} color`}
        />
        <span className="font-mono text-[10px] text-ink-600">{value}</span>
      </span>
    </label>
  );
}

function BotMark() {
  return (
    <svg viewBox="0 0 32 32" width="21" height="21" fill="none" aria-hidden>
      <circle cx="13" cy="14" r="2" fill="currentColor" />
      <circle cx="19" cy="14" r="2" fill="currentColor" />
      <path d="M11 19.5 Q16 22.5 21 19.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16" cy="6.5" r="1" fill="currentColor" />
      <path d="M16 7.5V9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function readableText(hex: string) {
  const normalized = /^#[0-9A-F]{6}$/i.test(hex) ? hex : "#315C48";
  const r = Number.parseInt(normalized.slice(1, 3), 16);
  const g = Number.parseInt(normalized.slice(3, 5), 16);
  const b = Number.parseInt(normalized.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 155 ? "#0A0A0B" : "#FFFFFF";
}
