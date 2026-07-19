"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { Bot, RefreshCcw, Save, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { WidgetPreview } from "@/components/widget/WidgetPreview";
import {
  ApiError,
  uploadLogoToCloudinary,
  websitesApi,
} from "@/lib/api";
import {
  DEFAULT_APPEARANCE,
  getWebsiteId,
  type Website,
  type WebsiteAppearance,
} from "@/types";

interface AppearanceEditorProps {
  website: Website;
  /**
   * Called after a successful save, upload, or remove so the parent can
   * keep its local Website state in sync without a refetch.
   */
  onWebsiteChange: (updater: (prev: Website) => Website) => void;
}

const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2 MB
const ACCEPTED_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];

/**
 * Default swatches shown beneath the color picker so the editor can
 * quickly audition curated looks. Designed to pair well with the white
 * surface — primary drives the launcher / header, surface drives the
 * panel background.
 */
const SWATCHES: Array<{ label: string; primary: string; surface: string }> = [
  { label: "Indigo / White", primary: "#3D5AFE", surface: "#FFFFFF" },
  { label: "Emerald / Cream", primary: "#059669", surface: "#FAF7F2" },
  { label: "Crimson / White", primary: "#DC2626", surface: "#FFFFFF" },
  { label: "Amber / Slate", primary: "#D97706", surface: "#F8FAFC" },
  { label: "Violet / White", primary: "#7C3AED", surface: "#FFFFFF" },
  { label: "Slate / White", primary: "#0F172A", surface: "#FFFFFF" },
];

/**
 * Dashboard editor for the chat widget's appearance.
 *
 *  - Color pickers + hex fields with validation.
 *  - Live preview via `WidgetPreview`.
 *  - Default swatches + reset-to-defaults.
 *  - Drag/drop and file-input PNG/JPEG/WebP upload (<=2 MB).
 *  - Object URL cleanup, signed direct-to-Cloudinary upload with progress.
 *  - Disabled controls during network operations.
 *  - Replace/remove logo with safe fallback.
 *
 * Colors and logo upload flow are independent — saving colors doesn't
 * trigger a logo upload and vice versa, which mirrors how admins actually
 * think about it.
 */
export function AppearanceEditor({
  website,
  onWebsiteChange,
}: AppearanceEditorProps) {
  const id = getWebsiteId(website);

  const initialAppearance: WebsiteAppearance = useMemo(
    () => ({
      ...DEFAULT_APPEARANCE,
      ...(website.appearance ?? {}),
    }),
    [website.appearance]
  );

  // `committed` is what's actually saved on the server. `draft` is what the
  // editor is currently editing — they diverge while the user plays with
  // controls and re-converge on save.
  const [committed, setCommitted] =
    useState<WebsiteAppearance>(initialAppearance);
  const [draft, setDraft] = useState<WebsiteAppearance>(initialAppearance);

  // Re-sync when the upstream website changes (e.g. after a refetch).
  useEffect(() => {
    setCommitted(initialAppearance);
    setDraft(initialAppearance);
  }, [initialAppearance]);

  const [primaryError, setPrimaryError] = useState<string | null>(null);
  const [surfaceError, setSurfaceError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Logo upload state.
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  // Revoke object URLs when they change or the component unmounts so we
  // don't leak memory.
  useEffect(() => {
    if (!previewUrl) return;
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const isDirty = useMemo(
    () =>
      draft.primaryColor.toLowerCase() !== committed.primaryColor.toLowerCase() ||
      draft.surfaceColor.toLowerCase() !== committed.surfaceColor.toLowerCase(),
    [draft, committed]
  );

  const validateHex = useCallback((value: string): string | null => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
      return "Use a 6-digit hex like #3D5AFE.";
    }
    return null;
  }, []);

  const updateDraftPrimary = (next: string) => {
    setDraft((d) => ({ ...d, primaryColor: next }));
    setPrimaryError(validateHex(next));
  };
  const updateDraftSurface = (next: string) => {
    setDraft((d) => ({ ...d, surfaceColor: next }));
    setSurfaceError(validateHex(next));
  };

  const onApplySwatch = (primary: string, surface: string) => {
    setDraft((d) => ({ ...d, primaryColor: primary, surfaceColor: surface }));
    setPrimaryError(null);
    setSurfaceError(null);
  };

  const onResetDefaults = () => {
    setDraft({ ...DEFAULT_APPEARANCE });
    setPrimaryError(null);
    setSurfaceError(null);
  };

  const onSaveColors = async () => {
    const p = validateHex(draft.primaryColor);
    const s = validateHex(draft.surfaceColor);
    setPrimaryError(p);
    setSurfaceError(s);
    if (p || s) return;

    setSaving(true);
    try {
      const { appearance } = await websitesApi.updateAppearance(id, {
        primaryColor: draft.primaryColor,
        surfaceColor: draft.surfaceColor,
      });
      onWebsiteChange((prev) => ({ ...prev, appearance }));
      setCommitted(appearance);
      setDraft(appearance);
      toast.success("Appearance saved.");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.serverMessage ?? err.message
          : "Could not save appearance.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // ---- Logo upload ----

  const handleFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
        toast.error("Logo must be a PNG, JPEG, or WebP image.");
        return;
      }
      if (file.size > MAX_LOGO_BYTES) {
        toast.error("Logo must be 2 MB or smaller.");
        return;
      }

      // Show a local object-URL preview immediately so the UI feels live.
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setUploadProgress(0);

      setUploading(true);
      try {
        // 1. Ask our backend for a Cloudinary signature.
        const sig = await websitesApi.getLogoSignature(id, {
          overwrite: true,
        });

        // 2. Upload directly to Cloudinary — no JWT leaves the browser, just
        //    the signature + public api key. Cloudinary's FormData requires
        //    folder, public_id, timestamp, api_key, signature.
        await uploadLogoToCloudinary({
          file,
          cloudName: sig.params.cloudName,
          apiKey: sig.params.apiKey,
          signature: sig.params.signature,
          timestamp: sig.params.timestamp,
          folder: sig.params.folder,
          publicId: sig.params.publicId,
          onUploadProgress: (pct) => {
            setUploadProgress(pct < 0 ? -1 : pct);
          },
        });

        // 3. Tell the backend the upload finished. We send back the
        //    signature response's *unqualified* publicId + the timestamp +
        //    signature it issued us — the backend verifies them and derives
        //    the owned folder itself. Cloudinary returns the full
        //    `<folder>/<publicId>` path, so we strip the folder prefix here.
        const unqualifiedPublicId = stripFolderPrefix(
          sig.params.publicId,
          sig.params.folder
        );
        const { appearance } = await websitesApi.completeLogoUpload(id, {
          publicId: unqualifiedPublicId,
          timestamp: sig.params.timestamp,
          signature: sig.params.signature,
        });
        onWebsiteChange((prev) => ({ ...prev, appearance }));
        setCommitted(appearance);
        setDraft((current) => ({ ...current, ...appearance }));
        setPreviewUrl(null);
        toast.success("Logo updated.");
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.serverMessage ?? err.message
            : "Logo upload failed.";
        toast.error(message);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [id, onWebsiteChange]
  );

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Always clear the input so re-selecting the same file fires onChange.
    e.target.value = "";
    if (file) void handleFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const onRemoveLogo = async () => {
    if (!committed.logoUrl && !previewUrl) return;
    if (!window.confirm("Remove the logo? The widget will fall back to the robot mark.")) {
      return;
    }
    setRemoving(true);
    try {
      const { appearance } = await websitesApi.deleteLogo(id);
      onWebsiteChange((prev) => ({ ...prev, appearance }));
      setCommitted(appearance);
      setDraft((current) => ({ ...current, ...appearance }));
      setPreviewUrl(null);
      toast.success("Logo removed.");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.serverMessage ?? err.message
          : "Could not remove logo.";
      toast.error(message);
    } finally {
      setRemoving(false);
    }
  };

  const livePreview: WebsiteAppearance = {
    primaryColor: draft.primaryColor,
    surfaceColor: draft.surfaceColor,
    // Use the in-flight object URL while uploading so the preview reflects
    // what the user just dropped, even before the backend acknowledges it.
    logoUrl: previewUrl ?? committed.logoUrl,
    logoPublicId: committed.logoPublicId,
  };

  const showLogoPreview = !!(livePreview.logoUrl);

  return (
    <Card>
      <div className="flex flex-col gap-1">
        <h3 className="text-[15px] font-semibold text-ink-900">
          Widget appearance
        </h3>
        <p className="text-[13px] text-ink-500">
          Customize the chat launcher colors and brand logo. Changes apply
          {website.status === "APPROVED"
            ? " to your live widget immediately after you save."
            : " once your website is approved — the widget is not live yet."}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Controls */}
        <div className="space-y-6">
          {/* Colors */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[12.5px] font-semibold uppercase tracking-wider text-ink-500">
                Colors
              </p>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={onResetDefaults}
                leftIcon={<RefreshCcw size={13} />}
                disabled={saving || uploading}
              >
                Reset to defaults
              </Button>
            </div>

            <ColorField
              label="Primary color"
              value={draft.primaryColor}
              onChange={updateDraftPrimary}
              error={primaryError}
              disabled={saving || uploading}
              hint="Launcher, header, and primary buttons."
            />
            <ColorField
              label="Surface color"
              value={draft.surfaceColor}
              onChange={updateDraftSurface}
              error={surfaceError}
              disabled={saving || uploading}
              hint="Chat panel background."
            />

            {/* Swatches */}
            <div className="space-y-2">
              <p className="text-[11.5px] font-medium text-ink-500">
                Quick swatches
              </p>
              <div className="flex flex-wrap gap-2">
                {SWATCHES.map((s) => {
                  const active =
                    s.primary.toLowerCase() === draft.primaryColor.toLowerCase() &&
                    s.surface.toLowerCase() ===
                      draft.surfaceColor.toLowerCase();
                  return (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => onApplySwatch(s.primary, s.surface)}
                      title={s.label}
                      aria-label={`Apply ${s.label}`}
                      aria-pressed={active}
                      disabled={saving || uploading}
                      className={[
                        "group flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-medium transition-colors disabled:opacity-50",
                        active
                          ? "border-ink-900 bg-ink-50 text-ink-900"
                          : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:bg-ink-50",
                      ].join(" ")}
                    >
                      <span className="flex items-center -space-x-1">
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/10 ring-1 ring-white"
                          style={{ background: s.primary }}
                        />
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/10 ring-1 ring-white"
                          style={{ background: s.surface }}
                        />
                      </span>
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                onClick={onSaveColors}
                loading={saving}
                disabled={
                  saving ||
                  uploading ||
                  !!primaryError ||
                  !!surfaceError ||
                  !isDirty
                }
                leftIcon={<Save size={14} strokeWidth={2.2} />}
              >
                Save colors
              </Button>
            </div>
            {website.status !== "APPROVED" && (
              <p className="text-[11.5px] text-ink-500">
                You can save now — the appearance will activate the moment an
                admin approves this website.
              </p>
            )}
          </div>

          {/* Logo */}
          <div className="space-y-3 border-t border-ink-100 pt-6">
            <p className="text-[12.5px] font-semibold uppercase tracking-wider text-ink-500">
              Brand logo
            </p>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={[
                "flex items-center gap-4 rounded-xl border-2 border-dashed px-4 py-4 transition-colors",
                dragOver
                  ? "border-accent-500 bg-accent-50/40"
                  : "border-ink-200 bg-ink-50/40",
                uploading ? "pointer-events-none opacity-70" : "",
              ].join(" ")}
            >
              <LogoThumb
                logoUrl={livePreview.logoUrl}
                primary={draft.primaryColor}
                uploading={uploading}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-ink-900">
                  {showLogoPreview ? "Replace logo" : "Upload a logo"}
                </p>
                <p className="mt-0.5 text-[12px] text-ink-500">
                  PNG, JPEG, or WebP. Up to 2 MB. Drag & drop or use the
                  button below.
                </p>
                {uploading && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                      <div
                        className="h-full rounded-full bg-accent-500 transition-all"
                        style={{
                          width:
                            uploadProgress < 0
                              ? "100%"
                              : `${Math.min(100, Math.max(5, uploadProgress))}%`,
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-ink-500">
                      {uploadProgress < 0
                        ? "Uploading…"
                        : `Uploading… ${uploadProgress}%`}
                    </p>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    leftIcon={<Upload size={13} />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || removing}
                    loading={uploading}
                  >
                    {showLogoPreview ? "Replace" : "Choose file"}
                  </Button>
                  {showLogoPreview && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      leftIcon={<Trash2 size={13} />}
                      onClick={onRemoveLogo}
                      disabled={uploading || removing}
                      loading={removing}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_LOGO_TYPES.join(",")}
                  className="hidden"
                  onChange={onFileInputChange}
                />
              </div>
            </div>

            {!showLogoPreview && !uploading && (
              <p className="text-[11.5px] text-ink-500">
                No logo yet — the widget will use the built-in robot mark.
              </p>
            )}
          </div>
        </div>

        {/* Live preview */}
        <div className="space-y-3">
          <p className="text-[12.5px] font-semibold uppercase tracking-wider text-ink-500">
            Live preview
          </p>
          <WidgetPreview appearance={livePreview} />
          <p className="text-[11.5px] text-ink-500">
            Preview reflects unsaved color changes. Save colors to apply them to
            your widget.
          </p>
        </div>
      </div>
    </Card>
  );
}

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (next: string) => void;
  error?: string | null;
  hint?: string;
  disabled?: boolean;
}

function ColorField({
  label,
  value,
  onChange,
  error,
  hint,
  disabled,
}: ColorFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12.5px] font-medium text-ink-700">{label}</label>
      <div
        className={[
          "flex items-center gap-2 rounded-lg border bg-white px-2 py-1.5 transition-colors",
          error
            ? "border-red-400 focus-within:border-red-500"
            : "border-ink-200 focus-within:border-ink-900",
        ].join(" ")}
      >
        {/* Native color picker swatch */}
        <label
          className="relative inline-flex h-8 w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-ink-200"
          style={{ background: value }}
          aria-label={`Pick ${label}`}
        >
          <input
            type="color"
            value={normalizeForColorInput(value)}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            disabled={disabled}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <span
            className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5"
            aria-hidden
          />
        </label>
        {/* Hex field */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          spellCheck={false}
          maxLength={7}
          className="flex-1 bg-transparent px-1 py-1 font-mono text-[13px] uppercase tracking-wider text-ink-900 outline-none placeholder:text-ink-400 disabled:opacity-50"
          placeholder="#3D5AFE"
          aria-label={`${label} hex value`}
          aria-invalid={error ? "true" : undefined}
        />
      </div>
      {error ? (
        <p className="text-[12px] font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

function LogoThumb({
  logoUrl,
  primary,
  uploading,
}: {
  logoUrl?: string;
  primary: string;
  uploading: boolean;
}) {
  return (
    <div
      className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink-200"
      style={{ background: logoUrl ? "#fff" : primary }}
      aria-hidden
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          className="h-full w-full object-contain"
        />
      ) : (
        <Bot size={20} className="text-white" />
      )}
      {uploading && (
        <span className="absolute inset-0 flex items-center justify-center bg-white/70">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-300 border-r-transparent" />
        </span>
      )}
    </div>
  );
}

function normalizeForColorInput(value: string): string {
  // The native <input type="color"> only accepts #RRGGBB. If the user has
  // typed something invalid we fall back to white so the swatch still
  // renders — the actual error is shown on the hex field.
  return /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#FFFFFF";
}

/**
 * Cloudinary returns the full `<folder>/<publicId>` path in its response,
 * but the backend's completion endpoint expects the *unqualified* id it
 * generated in the signature response (so it can derive/verify the owned
 * folder itself). Strip the folder prefix defensively — if it's already
 * unqualified we leave it untouched.
 */
function stripFolderPrefix(publicId: string, folder: string): string {
  if (!folder) return publicId;
  const prefix = folder.endsWith("/") ? folder : `${folder}/`;
  return publicId.startsWith(prefix) ? publicId.slice(prefix.length) : publicId;
}
