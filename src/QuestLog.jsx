import React, { useState, useEffect, useRef, useCallback } from "react";
import { jsPDF } from "jspdf";
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { supabase } from "./supabaseClient";
import {
  Sword,
  BookOpen,
  Users,
  Package,
  Quote,
  Plus,
  Trash2,
  Menu,
  X,
  Feather,
  Home,
  Sparkles,
  Star,
  MapPin,
  Shield,
  Flame,
  Compass,
  Gem,
  Skull,
  Wand2,
  Map as MapIcon,
  Heart,
  Dices,
  Check,
  Copy,
  ClipboardPaste,
  Mic,
  MicOff,
  Crown,
  Cloud,
  FileText,
  Share2,
  LogOut,
  Loader2,
  ChevronLeft,
  Milestone,
} from "lucide-react";

// ---- Design tokens ----
// bg-void #0a0714 | bg-deep #150c26 | panel #1c1130 | purple #7c4dc4 | purple-glow #a970ff
// blue #5b8fd6 | gold #c9a961 | text #e9e2f5 | text-dim #9c8fb8

const ICON_MAP = {
  Sword,
  BookOpen,
  Users,
  Package,
  Quote,
  Sparkles,
  Star,
  MapPin,
  Shield,
  Flame,
  Compass,
  Gem,
  Skull,
  Wand2,
  MapIcon,
  Heart,
  Dices,
};

const ICON_CHOICES = [
  "Sword",
  "BookOpen",
  "Users",
  "Package",
  "Quote",
  "Sparkles",
  "Star",
  "MapPin",
  "Shield",
  "Flame",
  "Compass",
  "Gem",
  "Skull",
  "Wand2",
  "MapIcon",
  "Heart",
  "Dices",
];

// Colorblind-safe palette (adapted from Okabe-Ito), brightened for a dark background.
// Chosen so hues stay distinguishable under deuteranopia, protanopia, and tritanopia —
// category icons remain the primary identifier, color is a secondary cue.
// UI chrome themes — background/panel/border/text/logo colors. Category accent
// colors stay constant across themes (they're deliberately colorblind-safe and
// tied to category identity, not to the app's visual skin).
const THEME_PALETTES = {
  purple: {
    label: "Purple",
    swatch: "#a970ff",
    bgA: "#1c1130",
    bgB: "#0a0714",
    bgC: "#060410",
    panelHeader: "#120a20e6",
    panelHeaderHover: "#1a1028",
    panelList: "#0e0819cc",
    panelForm: "#170e29",
    panelCard: "#150c26",
    activeBg: "#241638",
    hoverBg: "#33224d",
    borderStrong: "#2a1c42",
    borderMed: "#221737",
    borderSoft: "#3a2a5c",
    textPrimary: "#e9e2f5",
    textBright: "#f0e9fa",
    textDim1: "#9c8fb8",
    textDim2: "#8a7ba8",
    textDim3: "#7a6c9c",
    textDim4: "#6d5f8c",
    textDim5: "#5c4f7c",
    textDim6: "#4d4066",
    contentText: "#d9d0ea",
    logoFrom: "#a970ff",
    logoTo: "#5b8fd6",
  },
  green: {
    label: "Green",
    swatch: "#6fe0a0",
    bgA: "#122a1c",
    bgB: "#071309",
    bgC: "#040a06",
    panelHeader: "#0b1f12e6",
    panelHeaderHover: "#0f2617",
    panelList: "#081a0dcc",
    panelForm: "#0e2015",
    panelCard: "#0c1c11",
    activeBg: "#16331f",
    hoverBg: "#20402a",
    borderStrong: "#1c3a26",
    borderMed: "#173020",
    borderSoft: "#2e5c3a",
    textPrimary: "#e2f5e6",
    textBright: "#eafaee",
    textDim1: "#9cb8a2",
    textDim2: "#89a892",
    textDim3: "#7a9c83",
    textDim4: "#6d8c75",
    textDim5: "#5c7c64",
    textDim6: "#4d6654",
    contentText: "#d5ead9",
    logoFrom: "#6fe0a0",
    logoTo: "#4fae8f",
  },
  red: {
    label: "Red",
    swatch: "#ff8f70",
    bgA: "#2a1512",
    bgB: "#130808",
    bgC: "#0a0505",
    panelHeader: "#200d0be6",
    panelHeaderHover: "#291310",
    panelList: "#1a0908cc",
    panelForm: "#200f0e",
    panelCard: "#1c0d0c",
    activeBg: "#331a16",
    hoverBg: "#40241f",
    borderStrong: "#3a1e1c",
    borderMed: "#301917",
    borderSoft: "#5c332e",
    textPrimary: "#f5e4e2",
    textBright: "#faeceb",
    textDim1: "#b89a8f",
    textDim2: "#a8867b",
    textDim3: "#9c766c",
    textDim4: "#8c685f",
    textDim5: "#7c584f",
    textDim6: "#664740",
    contentText: "#ead4d0",
    logoFrom: "#ff8f70",
    logoTo: "#d65b5b",
  },
  blue: {
    label: "Blue",
    swatch: "#70b8ff",
    bgA: "#101c30",
    bgB: "#070d16",
    bgC: "#04070c",
    panelHeader: "#0b1524e6",
    panelHeaderHover: "#0f1c2e",
    panelList: "#081120cc",
    panelForm: "#0e1a28",
    panelCard: "#0c1524",
    activeBg: "#16283f",
    hoverBg: "#20344d",
    borderStrong: "#1c2f4a",
    borderMed: "#17283f",
    borderSoft: "#2e4f6b",
    textPrimary: "#e2ecf5",
    textBright: "#eaf2fa",
    textDim1: "#8fa3b8",
    textDim2: "#7b90a8",
    textDim3: "#6c839c",
    textDim4: "#5f748c",
    textDim5: "#4f647c",
    textDim6: "#405066",
    contentText: "#d0e0ea",
    logoFrom: "#70b8ff",
    logoTo: "#5b7fd6",
  },
};

const COLOR_CHOICES = [
  "#E8A33D", // orange
  "#4A90D9", // blue
  "#D682B0", // reddish purple
  "#2FBF8F", // bluish green
  "#E0623D", // vermillion
  "#F0D659", // yellow
  "#56B4E9", // sky blue
  "#B8B0D0", // neutral silver
];

const BUILTIN_CATEGORIES = [
  { key: "quest", label: "Quests", icon: "Sword", accent: "#E8A33D", builtin: true, type: "text" },
  { key: "journal", label: "Journal", icon: "BookOpen", accent: "#4A90D9", builtin: true, type: "text" },
  { key: "npcs", label: "NPCs", icon: "Users", accent: "#D682B0", builtin: true, type: "text" },
  { key: "backstory", label: "PC Backstory", icon: "Heart", accent: "#56B4E9", builtin: true, type: "text" },
  { key: "inventory", label: "Inventory", icon: "Package", accent: "#2FBF8F", builtin: true, type: "text" },
  { key: "quotes", label: "Game Quotes", icon: "Quote", accent: "#E0623D", builtin: true, type: "text" },
  { key: "maps", label: "Maps & Sketches", icon: "MapIcon", accent: "#F0D659", builtin: true, type: "sketch", singular: "Maps & Sketches" },
];

const SKETCH_COLORS = ["#1c140a", "#4a2a1c", "#7a1f1f", "#1f3a5c", "#1f5c3a", "#5c3a7a"];
const SKETCH_BG = "#ece0c4";
const SKETCH_SIZES = [3, 6, 12];
const SKETCH_GRID_SPACING = 24; // px, at the canvas's native 1000x640 resolution
const SKETCH_GRID_LINE = "rgba(74, 42, 28, 0.18)";

// Shared between the live SketchPad canvas container and the note-list thumbnail wrapper —
// the canvas itself is transparent (so drawings and the eraser work correctly regardless of
// paper style), so whatever's "underneath" it needs to render the actual paper texture.
function sketchBgStyle(bgStyle) {
  if (bgStyle === "grid") {
    return {
      background: SKETCH_BG,
      backgroundImage:
        `linear-gradient(${SKETCH_GRID_LINE} 1px, transparent 1px), ` +
        `linear-gradient(90deg, ${SKETCH_GRID_LINE} 1px, transparent 1px)`,
      backgroundSize: `${SKETCH_GRID_SPACING}px ${SKETCH_GRID_SPACING}px`,
    };
  }
  return { background: SKETCH_BG };
}

// Canvas-drawn equivalent of sketchBgStyle, used only where a flattened raster is required
// (PDF export) since CSS backgrounds obviously don't get captured by canvas.toDataURL.
function paintSketchBackground(ctx, width, height, bgStyle) {
  ctx.fillStyle = SKETCH_BG;
  ctx.fillRect(0, 0, width, height);
  if (bgStyle === "grid") {
    ctx.strokeStyle = "rgba(74, 42, 28, 0.32)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += SKETCH_GRID_SPACING) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += SKETCH_GRID_SPACING) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
      ctx.stroke();
    }
  }
}

// Composites a note's transparent drawing over its chosen paper style into one flattened PNG
// — needed for the PDF export, which can't render live CSS/canvas backgrounds itself.
function compositeSketchForExport(note) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 640;
    const ctx = canvas.getContext("2d");
    paintSketchBackground(ctx, canvas.width, canvas.height, note.bgStyle || "plain");
    if (!note.image) {
      resolve(canvas.toDataURL("image/png"));
      return;
    }
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(canvas.toDataURL("image/png"));
    img.src = note.image;
  });
}

const PLACEHOLDERS = {
  quest: "What's the objective? Who gave the quest? What's the reward…",
  npcs: "Name, appearance, motives, secrets, relationship to the party…",
  backstory: "Where they're from, what shaped them, secrets, motivations, ties to the world…",
  inventory: "Item name, quantity, properties, where it was found…",
  journal: "What happened this session…",
  quotes: "Who said it? What was happening when they said it…",
};

const STORAGE_KEY = "questlog-notes-v2";
const PREMIUM_KEY = "questlog-premium-v1";

// Stripe Payment Links — configure these in .env (see .env.example). Each Payment Link's
// "after payment" redirect should point back at this app with `?upgraded=1` appended so
// unlockPremiumFromUrl() below can pick it up. No secret keys involved — Payment Links are
// public checkout URLs, safe to ship in a client-only app with no backend.
const PAYMENT_LINKS = {
  monthly: import.meta.env.VITE_STRIPE_LINK_MONTHLY || "",
  yearly: import.meta.env.VITE_STRIPE_LINK_YEARLY || "",
  lifetime: import.meta.env.VITE_STRIPE_LINK_LIFETIME || "",
};

function migrateCategories(saved) {
  let cats = saved.map((c) => ({ ...c, type: c.type || "text" }));
  // Backfill the singular override for anyone who saved a "maps" category before this fix existed
  cats = cats.map((c) => (c.key === "maps" && !c.singular ? { ...c, singular: "Maps & Sketches" } : c));
  // Inject any built-in category the user's saved data predates (e.g. Maps & Sketches, PC Backstory)
  BUILTIN_CATEGORIES.forEach((builtinCat) => {
    if (!cats.some((c) => c.key === builtinCat.key)) {
      const lastBuiltinIdx = cats.reduce((acc, c, i) => (c.builtin ? i : acc), -1);
      cats.splice(lastBuiltinIdx + 1, 0, builtinCat);
    }
  });
  return cats;
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function slugify(label) {
  const base = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "category"}-${uid()}`;
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function buildEmptyNotes(categories) {
  const obj = {};
  categories.forEach((c) => (obj[c.key] = []));
  return obj;
}

async function exportCampaignToPdf(categories, notes) {
  // Sketch entries need their background (plain/grid) composited in first — canvas image
  // loading is async, so this has to happen before the otherwise-synchronous PDF build below.
  const compositedSketches = new Map();
  for (const cat of categories) {
    if (cat.type !== "sketch") continue;
    for (const note of notes[cat.key] || []) {
      compositedSketches.set(note.id, await compositeSketchForExport(note));
    }
  }

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 54;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (needed) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.text("Quest Log — Campaign Log", margin, y);
  y += 22;
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110, 110, 110);
  doc.text(`Exported ${new Date().toLocaleDateString()}`, margin, y);
  doc.setTextColor(20, 20, 20);
  y += 34;

  categories.forEach((cat) => {
    const entries = (notes[cat.key] || []).slice().sort((a, b) => b.updatedAt - a.updatedAt);
    if (entries.length === 0) return;

    ensureSpace(40);
    doc.setFont("times", "bold");
    doc.setFontSize(17);
    doc.text(cat.label, margin, y);
    y += 8;
    doc.setDrawColor(180, 180, 180);
    doc.line(margin, y, pageWidth - margin, y);
    y += 22;

    entries.forEach((note) => {
      ensureSpace(30);
      doc.setFont("times", "bold");
      doc.setFontSize(13);
      doc.text(note.title || "Untitled entry", margin, y);
      y += 16;

      if (cat.type === "sketch") {
        const composited = compositedSketches.get(note.id);
        if (composited) {
          const imgWidth = contentWidth;
          const imgHeight = imgWidth * (640 / 1000);
          ensureSpace(imgHeight + 20);
          doc.addImage(composited, "PNG", margin, y, imgWidth, imgHeight);
          y += imgHeight + 24;
        } else {
          y += 12;
        }
      } else {
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        const lines = doc.splitTextToSize(note.content || "(no content)", contentWidth);
        lines.forEach((line) => {
          ensureSpace(15);
          doc.text(line, margin, y);
          y += 15;
        });
        y += 14;
      }
    });
    y += 10;
  });

  doc.save(`quest-log-campaign-${new Date().toISOString().slice(0, 10)}.pdf`);
}

const RECAP_VERSION = 1;

// Party Sharing has no backend — the recap is encoded straight into the URL (compressed via
// lz-string), so the link itself IS the data. That means: no server storage, but also no live
// updates after sharing (it's a snapshot), and no images — sketch entries would blow past
// practical URL length limits even compressed, so only text categories are shareable this way.
function buildRecapLink(categories, notes, selectedIds) {
  const shareableCategories = categories.filter((c) => c.type !== "sketch");
  const payload = { v: RECAP_VERSION, categories: [], entries: [] };
  const usedCatKeys = new Set();

  shareableCategories.forEach((cat) => {
    (notes[cat.key] || []).forEach((note) => {
      if (!selectedIds.has(note.id)) return;
      usedCatKeys.add(cat.key);
      payload.entries.push({
        c: cat.key,
        t: note.title || "",
        b: note.content || "",
      });
    });
  });

  payload.categories = shareableCategories
    .filter((c) => usedCatKeys.has(c.key))
    .map((c) => ({ key: c.key, label: c.label, icon: c.icon, accent: c.accent }));

  if (payload.entries.length === 0) return null;

  const encoded = compressToEncodedURIComponent(JSON.stringify(payload));
  return `${window.location.origin}${window.location.pathname}#recap=${encoded}`;
}

function readRecapFromUrl() {
  const hash = window.location.hash;
  const match = hash.match(/^#recap=(.+)$/);
  if (!match) return null;
  try {
    const json = decompressFromEncodedURIComponent(match[1]);
    if (!json) return null;
    const payload = JSON.parse(json);
    if (payload && payload.v === RECAP_VERSION && Array.isArray(payload.entries)) return payload;
  } catch (e) {
    // malformed or truncated link — fall through to null
  }
  return null;
}

// Feather quill over parchment logo mark
function QuillMark({ size = 40, glow = true, logoFrom = "#a970ff", logoTo = "#5b8fd6" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id="inkGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd98e" />
          <stop offset="100%" stopColor="#c9a961" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="quillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={logoFrom} />
          <stop offset="100%" stopColor={logoTo} />
        </linearGradient>
      </defs>

      {/* Parchment, folded corner */}
      <path
        d="M14 54 H62 L70 62 V84 Q70 86 68 86 H16 Q14 86 14 84 Z"
        stroke="url(#quillGrad)"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
      <path d="M62 54 V62 H70" stroke="url(#quillGrad)" strokeWidth="2" fill="none" strokeLinejoin="round" />
      <line x1="21" y1="66" x2="55" y2="66" stroke="url(#quillGrad)" strokeWidth="1.3" opacity="0.7" />
      <line x1="21" y1="73" x2="60" y2="73" stroke="url(#quillGrad)" strokeWidth="1.3" opacity="0.7" />
      <line x1="21" y1="80" x2="48" y2="80" stroke="url(#quillGrad)" strokeWidth="1.3" opacity="0.7" />

      {/* Quill feather, nib resting on the parchment */}
      <path
        d="M84 10 C90 20 87 33 78 44 C69 55 58 63 47 72 C40 78 34 82 29 86
           C33 80 38 74 45 66 C55 56 66 46 74 35 C81 26 82 18 84 10 Z"
        stroke="url(#quillGrad)"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
      <path d="M29 86 L83 12" stroke="url(#quillGrad)" strokeWidth="1.4" />
      <path
        d="M42 68 L34 74 M50 60 L43 67 M58 52 L51 59 M66 43 L59 50 M73 34 L67 41"
        stroke="url(#quillGrad)"
        strokeWidth="1"
        opacity="0.6"
      />

      <circle cx="29" cy="86" r={glow ? 4 : 2.4} fill="url(#inkGlow)" className={glow ? "animate-pulse" : ""} />
      <circle cx="29" cy="86" r="1.3" fill="#2a1740" />
    </svg>
  );
}

// Large faint background watermark of the quill and parchment
function QuillWatermark({
  className = "pointer-events-none absolute -right-8 top-6 opacity-[0.06] select-none",
  size = 320,
  style,
  stroke = "#a970ff",
}) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 200 200" fill="none">
      <path
        d="M28 108 H124 L140 124 V168 Q140 172 136 172 H32 Q28 172 28 168 Z"
        stroke={stroke}
        strokeWidth="1.4"
        fill="none"
      />
      <path d="M124 108 V124 H140" stroke={stroke} strokeWidth="1.4" fill="none" />
      <line x1="42" y1="132" x2="110" y2="132" stroke={stroke} strokeWidth="1" opacity="0.7" />
      <line x1="42" y1="146" x2="120" y2="146" stroke={stroke} strokeWidth="1" opacity="0.7" />
      <line x1="42" y1="160" x2="96" y2="160" stroke={stroke} strokeWidth="1" opacity="0.7" />
      <path
        d="M168 20 C180 40 174 66 156 88 C138 110 116 126 94 144 C80 156 68 164 58 172
           C66 160 76 148 90 132 C110 112 132 92 148 70 C162 52 164 36 168 20 Z"
        stroke={stroke}
        strokeWidth="1.4"
        fill="none"
      />
      <path d="M58 172 L166 24" stroke={stroke} strokeWidth="1" />
      <path
        d="M84 136 L68 148 M100 120 L86 134 M116 104 L102 118 M132 86 L118 100 M146 68 L134 82"
        stroke={stroke}
        strokeWidth="0.8"
        opacity="0.6"
      />
    </svg>
  );
}

function CategoryIcon({ name, size = 17, style }) {
  const Icon = ICON_MAP[name] || Sparkles;
  return <Icon size={size} style={style} />;
}

// Read-only view for a shared recap link — entirely self-contained from the URL, no
// storage reads/writes, no editing. Rendered instead of the normal app when the page
// loads with a #recap= hash.
function RecapView({ payload }) {
  const T = THEME_PALETTES.purple;
  const catByKey = {};
  payload.categories.forEach((c) => (catByKey[c.key] = c));

  return (
    <div
      className="h-full w-full overflow-y-auto qlog-scroll"
      style={{
        background: `radial-gradient(ellipse at top left, ${T.bgA} 0%, ${T.bgB} 55%, ${T.bgC} 100%)`,
        color: T.textPrimary,
        fontFamily: "'Crimson Pro', 'Georgia', serif",
      }}
    >
      <style>{`
        .qlog-scroll::-webkit-scrollbar { width: 8px; }
        .qlog-scroll::-webkit-scrollbar-track { background: transparent; }
        .qlog-scroll::-webkit-scrollbar-thumb { background: ${T.borderSoft}; border-radius: 8px; }
      `}</style>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-2">
          <QuillMark size={40} logoFrom={T.logoFrom} logoTo={T.logoTo} />
          <div>
            <div className="text-2xl" style={{ fontFamily: "'Cinzel', serif", color: T.textBright }}>
              Quest Log
            </div>
            <div className="text-[13px] tracking-widest uppercase" style={{ color: "#c9a961" }}>
              Shared Campaign Recap
            </div>
          </div>
        </div>
        <div className="text-base mb-10" style={{ color: T.textDim3 }}>
          A fellow adventurer shared this snapshot with you. It won't update if they edit their
          notes later.
        </div>

        {payload.entries.length === 0 ? (
          <div className="text-lg" style={{ color: T.textDim3 }}>
            This recap link doesn't have any entries in it.
          </div>
        ) : (
          payload.categories.map((cat) => {
            const entries = payload.entries.filter((e) => e.c === cat.key);
            if (entries.length === 0) return null;
            return (
              <div key={cat.key} className="mb-10">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: T.borderStrong }}>
                  <CategoryIcon name={cat.icon} size={24} style={{ color: cat.accent }} />
                  <span className="text-2xl" style={{ fontFamily: "'Cinzel', serif", color: T.textPrimary }}>
                    {cat.label}
                  </span>
                </div>
                <div className="flex flex-col gap-6">
                  {entries.map((e, i) => (
                    <div key={i}>
                      <div className="text-lg mb-1" style={{ fontWeight: 600, color: T.textBright }}>
                        {e.t || "Untitled entry"}
                      </div>
                      <div className="text-[17px] leading-relaxed whitespace-pre-wrap" style={{ color: T.contentText }}>
                        {e.b || "(no content)"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}

        <div className="mt-16 pt-6 border-t text-center" style={{ borderColor: T.borderStrong }}>
          <div className="text-sm" style={{ color: T.textDim4 }}>
            Keep your own campaign notes with{" "}
            <a href="https://lunaticproductionsmedia.com" style={{ color: "#c9a961" }}>
              Quest Log
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Read-only, chronological view of pinned excerpts — it never generates its own content;
// it only ever reflects what's been pinned from other entries via the "Milestone" button.
function TimelineView({ timeline, categories, notes, T, onJump, onDelete }) {
  const sorted = timeline.slice().sort((a, b) => a.addedAt - b.addedAt);

  return (
    <main className="flex-1 overflow-y-auto qlog-scroll z-10 px-6 md:px-10 py-10">
      <div className="flex items-center gap-4 mb-10">
        <Milestone size={52} style={{ color: "#c9a961" }} />
        <div>
          <div className="text-4xl tracking-wide" style={{ fontFamily: "'Cinzel', serif", color: T.textBright }}>
            Timeline
          </div>
          <div className="text-lg mt-1" style={{ color: T.textDim1 }}>
            {sorted.length === 0
              ? "No moments pinned yet"
              : `${sorted.length} moment${sorted.length === 1 ? "" : "s"} pinned from your campaign`}
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-lg max-w-md" style={{ color: T.textDim3 }}>
          Highlight text in any entry, then tap the milestone icon that appears to pin it here.
          The timeline builds itself as your campaign goes — it isn't edited directly.
        </div>
      ) : (
        <div className="relative pl-8 max-w-2xl">
          <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: T.borderStrong }} />
          {sorted.map((entry) => {
            const cat = categories.find((c) => c.key === entry.catKey);
            const sourceExists = (notes[entry.catKey] || []).some((n) => n.id === entry.noteId);
            return (
              <div key={entry.id} className="relative mb-9">
                <div
                  className="absolute -left-8 top-1.5 w-3.5 h-3.5 rounded-full border-2"
                  style={{ background: T.bgB, borderColor: cat ? cat.accent : "#c9a961" }}
                />
                <div className="text-[14px] mb-1.5 uppercase tracking-wide" style={{ color: T.textDim5 }}>
                  {new Date(entry.addedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="text-[19px] leading-relaxed italic mb-2" style={{ color: T.contentText }}>
                  "{entry.text}"
                </div>
                <div className="flex items-center gap-4 text-base">
                  {sourceExists ? (
                    <button
                      onClick={() => onJump(entry)}
                      className="flex items-center gap-1.5 min-w-0 hover:brightness-125 transition"
                      style={{ color: cat ? cat.accent : T.textDim2 }}
                    >
                      {cat && <CategoryIcon name={cat.icon} size={15} />}
                      <span className="truncate">
                        {entry.catLabel} — {entry.noteTitle}
                      </span>
                    </button>
                  ) : (
                    <span className="italic" style={{ color: T.textDim5 }}>
                      Source entry deleted
                    </span>
                  )}
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="p-1 rounded hover:brightness-125 transition shrink-0"
                    style={{ color: T.textDim4 }}
                    title="Remove from timeline"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

function SketchPad({ note, onChange, onBgStyleChange, accent, T }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const [color, setColor] = useState(SKETCH_COLORS[0]);
  const [size, setSize] = useState(SKETCH_SIZES[1]);
  const [erasing, setErasing] = useState(false);
  const bgStyle = note.bgStyle || "plain";

  // Load the note's saved sketch whenever we switch to a different note. The canvas itself
  // is always transparent — paper texture (plain/grid) is a CSS background on the container
  // behind it, so the eraser and the paper-style toggle both work correctly no matter what's
  // already been drawn.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (note.image) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = note.image;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id]);

  // Allow pasting an image (e.g. a screenshotted map) straight onto the canvas
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.indexOf("image") === -1) continue;
        const file = item.getAsFile();
        if (!file) continue;
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (canvas.width - w) / 2;
            const y = (canvas.height - h) / 2;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, x, y, w, h);
            onChange(canvas.toDataURL("image/png"));
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
        break;
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [onChange]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const handleDown = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    canvas.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastPointRef.current = getPos(e);
  };

  const handleMove = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e);
    // Pressure-sensitive when the input device (e.g. a stylus) reports it
    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;
    // Erasing punches transparent holes (destination-out) rather than painting a solid fill,
    // so it works correctly no matter what paper style is showing through underneath.
    ctx.globalCompositeOperation = erasing ? "destination-out" : "source-over";
    ctx.strokeStyle = color;
    ctx.lineWidth = erasing ? size * 2.5 : size * (0.5 + pressure);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    lastPointRef.current = pos;
  };

  const handleUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    onChange(canvasRef.current.toDataURL("image/png"));
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange(canvas.toDataURL("image/png"));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 px-6 py-4">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="flex gap-1.5">
          {SKETCH_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setErasing(false);
                setColor(c);
              }}
              className="w-6 h-6 rounded-full"
              style={{
                background: c,
                boxShadow: !erasing && color === c ? `0 0 0 2px ${T.bgB}, 0 0 0 3.5px ${accent}` : `0 0 0 1px ${T.borderSoft}`,
              }}
            />
          ))}
        </div>
        <div className="h-5 w-px" style={{ background: T.borderStrong }} />
        <div className="flex gap-1.5">
          {SKETCH_SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className="flex items-center justify-center w-7 h-7 rounded-md border"
              style={{ borderColor: size === s ? accent : T.borderStrong }}
            >
              <span className="rounded-full" style={{ width: s, height: s, background: size === s ? accent : T.textDim2 }} />
            </button>
          ))}
        </div>
        <div className="h-5 w-px" style={{ background: T.borderStrong }} />
        <button
          onClick={() => setErasing((v) => !v)}
          className="text-base px-2.5 py-1.5 rounded-md border"
          style={{
            borderColor: erasing ? accent : T.borderStrong,
            color: erasing ? accent : T.textDim2,
            background: erasing ? T.activeBg : "transparent",
          }}
        >
          Eraser
        </button>
        <button
          onClick={handleClear}
          className="text-base px-2.5 py-1.5 rounded-md border flex items-center gap-1"
          style={{ borderColor: T.borderStrong, color: T.textDim2 }}
        >
          <Trash2 size={16} /> Clear
        </button>
        <div className="h-5 w-px" style={{ background: T.borderStrong }} />
        <div className="flex gap-1.5">
          {[
            { key: "plain", label: "Plain" },
            { key: "grid", label: "Grid" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => onBgStyleChange(opt.key)}
              className="text-base px-2.5 py-1.5 rounded-md border"
              style={{
                borderColor: bgStyle === opt.key ? accent : T.borderStrong,
                color: bgStyle === opt.key ? accent : T.textDim2,
                background: bgStyle === opt.key ? T.activeBg : "transparent",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="text-[15px] ml-auto hidden sm:inline" style={{ color: T.textDim5 }}>
          Draw with stylus, finger, or mouse — or paste (Ctrl/Cmd+V) an image
        </span>
      </div>
      <div
        className="flex-1 rounded-lg overflow-hidden border min-h-0"
        style={{ borderColor: T.borderStrong, ...sketchBgStyle(bgStyle) }}
      >
        <canvas
          ref={canvasRef}
          width={1000}
          height={640}
          className="w-full h-full"
          style={{ touchAction: "none", cursor: erasing ? "cell" : "crosshair" }}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerLeave={handleUp}
          onPointerCancel={handleUp}
        />
      </div>
    </div>
  );
}

export default function QuestLog() {
  const [recapPayload] = useState(() => readRecapFromUrl());
  const [categories, setCategories] = useState(BUILTIN_CATEGORIES);
  const [notes, setNotes] = useState(buildEmptyNotes(BUILTIN_CATEGORIES));
  const [activeCategory, setActiveCategory] = useState("quest");
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [showHome, setShowHome] = useState(true);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [selRange, setSelRange] = useState({ start: 0, end: 0 });
  const contentRef = useRef(null);
  const [theme, setTheme] = useState("purple");
  const [loaded, setLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Sparkles");
  const [newCatColor, setNewCatColor] = useState(COLOR_CHOICES[0]);
  const [newCatType, setNewCatType] = useState("text");
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [isPremium, setIsPremium] = useState(false);
  const [upgradeToast, setUpgradeToast] = useState(false);
  const [checkoutUnavailable, setCheckoutUnavailable] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareSelectedIds, setShareSelectedIds] = useState(() => new Set());
  const [shareLink, setShareLink] = useState(null);
  const [shareCopyFeedback, setShareCopyFeedback] = useState(false);
  const [session, setSession] = useState(null);
  const [cloudPremium, setCloudPremium] = useState(false);
  const [showCloudPanel, setShowCloudPanel] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authStatus, setAuthStatus] = useState("idle"); // idle | sending | sent | error
  const [cloudSyncState, setCloudSyncState] = useState("idle"); // idle | loading | syncing | synced | error
  const [showImportPrompt, setShowImportPrompt] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const dictationBaseRef = useRef("");
  const dictationNoteIdRef = useRef(null);
  const saveTimer = useRef(null);

  // Load from storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const savedCategories = migrateCategories(
          Array.isArray(parsed.categories) && parsed.categories.length ? parsed.categories : BUILTIN_CATEGORIES
        );
        const savedNotes = parsed.notes || {};
        const mergedNotes = buildEmptyNotes(savedCategories);
        Object.keys(mergedNotes).forEach((k) => {
          if (Array.isArray(savedNotes[k])) mergedNotes[k] = savedNotes[k];
        });
        setCategories(savedCategories);
        setNotes(mergedNotes);
        if (parsed.theme && THEME_PALETTES[parsed.theme]) setTheme(parsed.theme);
        if (Array.isArray(parsed.timeline)) setTimeline(parsed.timeline);
      }
    } catch (e) {
      // no existing data yet, or it was corrupted — start fresh
    } finally {
      setLoaded(true);
    }
  }, []);

  // Premium unlock: Stripe Payment Links redirect back here with ?upgraded=1 on success.
  // There's no backend to verify the purchase server-side, so this is an honor-system
  // unlock — acceptable for a client-only app with no gated data, not a substitute for
  // real entitlement checks if higher-value features get gated later.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "1") {
      localStorage.setItem(PREMIUM_KEY, "true");
      setIsPremium(true);
      setUpgradeToast(true);
      window.history.replaceState({}, "", window.location.pathname);
      setTimeout(() => setUpgradeToast(false), 5000);
    } else {
      setIsPremium(localStorage.getItem(PREMIUM_KEY) === "true");
    }
  }, []);

  // Cloud Sync auth — entirely optional. If Supabase isn't configured (no env vars),
  // `supabase` is null and this just never fires; the app behaves exactly like the
  // localStorage-only free tier.
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        setCloudPremium(false);
        setCloudSyncState("idle");
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // On sign-in: check real (server-verified) premium status, then either load existing
  // cloud data (if this account already has some) or offer to import what's on this
  // device. Deliberately reads `categories`/`notes`/`theme` from the closure at the
  // moment of sign-in rather than reacting to their later changes — this should run once
  // per sign-in event, not on every keystroke.
  useEffect(() => {
    if (!supabase || !session) return;
    setCloudSyncState("loading");
    (async () => {
      const { data: premiumRow } = await supabase
        .from("premium_status")
        .select("is_premium")
        .eq("user_id", session.user.id)
        .maybeSingle();
      setCloudPremium(Boolean(premiumRow?.is_premium));

      const { data: cloudRow } = await supabase
        .from("campaign_data")
        .select("categories, notes, theme, timeline")
        .eq("user_id", session.user.id)
        .maybeSingle();

      const cloudHasData =
        cloudRow && Array.isArray(cloudRow.categories) && cloudRow.categories.length > 0 &&
        cloudRow.notes && Object.values(cloudRow.notes).some((l) => Array.isArray(l) && l.length > 0);
      const localHasData = Object.values(notes).some((l) => l.length > 0);

      if (cloudHasData) {
        const savedCategories = migrateCategories(cloudRow.categories);
        const mergedNotes = buildEmptyNotes(savedCategories);
        Object.keys(mergedNotes).forEach((k) => {
          if (Array.isArray(cloudRow.notes[k])) mergedNotes[k] = cloudRow.notes[k];
        });
        setCategories(savedCategories);
        setNotes(mergedNotes);
        if (cloudRow.theme && THEME_PALETTES[cloudRow.theme]) setTheme(cloudRow.theme);
        if (Array.isArray(cloudRow.timeline)) setTimeline(cloudRow.timeline);
        setCloudSyncState("synced");
      } else if (localHasData) {
        setShowImportPrompt(true);
        setCloudSyncState("idle");
      } else {
        await supabase.from("campaign_data").upsert({
          user_id: session.user.id,
          categories,
          notes,
          theme,
          timeline,
          updated_at: new Date().toISOString(),
        });
        setCloudSyncState("synced");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const persist = useCallback((nextNotes, nextCategories, nextTheme, nextTimeline = timeline) => {
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ notes: nextNotes, categories: nextCategories, theme: nextTheme, timeline: nextTimeline })
        );
        // localStorage always stays the source of truth for the free tier and as an
        // offline cache; Supabase sync is additive, only for signed-in cloud-premium users.
        if (supabase && session && cloudPremium) {
          setCloudSyncState("syncing");
          const { error } = await supabase.from("campaign_data").upsert({
            user_id: session.user.id,
            categories: nextCategories,
            notes: nextNotes,
            theme: nextTheme,
            timeline: nextTimeline,
            updated_at: new Date().toISOString(),
          });
          setCloudSyncState(error ? "error" : "synced");
        }
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 1200);
      } catch (e) {
        setSaveState("idle");
      }
    }, 450);
  }, [session, cloudPremium, timeline]);

  const changeTheme = (nextTheme) => {
    setTheme(nextTheme);
    persist(notes, categories, nextTheme);
  };

  const updateNotes = (updater) => {
    setNotes((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      persist(next, categories, theme);
      return next;
    });
  };

  const activeList = notes[activeCategory] || [];
  const activeNote = activeList.find((n) => n.id === activeNoteId) || null;

  const createNote = (catKey) => {
    const key = catKey || activeCategory;
    const cat = categories.find((c) => c.key === key);
    const n =
      cat && cat.type === "sketch"
        ? { id: uid(), title: "", image: null, bgStyle: "plain", updatedAt: Date.now() }
        : { id: uid(), title: "", content: "", updatedAt: Date.now() };
    updateNotes((prev) => ({ ...prev, [key]: [n, ...(prev[key] || [])] }));
    setActiveCategory(key);
    setActiveNoteId(n.id);
    setShowHome(false);
    setShowTimeline(false);
    setSidebarOpen(false);
  };

  const deleteNote = (id) => {
    updateNotes((prev) => ({
      ...prev,
      [activeCategory]: prev[activeCategory].filter((n) => n.id !== id),
    }));
    if (activeNoteId === id) setActiveNoteId(null);
  };

  const captureSelection = () => {
    const ta = contentRef.current;
    if (!ta) return;
    setSelRange({ start: ta.selectionStart, end: ta.selectionEnd });
  };

  const addSelectionToTimeline = () => {
    if (!activeNote || selRange.end <= selRange.start) return;
    const text = activeNote.content.slice(selRange.start, selRange.end).trim();
    if (!text) return;
    const cat = categories.find((c) => c.key === activeCategory);
    const entry = {
      id: uid(),
      text,
      catKey: activeCategory,
      catLabel: cat ? cat.label : activeCategory,
      noteId: activeNote.id,
      noteTitle: activeNote.title || "Untitled entry",
      addedAt: Date.now(),
    };
    const nextTimeline = [...timeline, entry];
    setTimeline(nextTimeline);
    persist(notes, categories, theme, nextTimeline);
    setSelRange({ start: 0, end: 0 });
  };

  const deleteTimelineEntry = (id) => {
    const nextTimeline = timeline.filter((t) => t.id !== id);
    setTimeline(nextTimeline);
    persist(notes, categories, theme, nextTimeline);
  };

  const jumpToTimelineSource = (entry) => {
    const sourceExists = (notes[entry.catKey] || []).some((n) => n.id === entry.noteId);
    if (!sourceExists) return;
    setActiveCategory(entry.catKey);
    setActiveNoteId(entry.noteId);
    setShowHome(false);
    setShowTimeline(false);
    setSidebarOpen(false);
  };

  const copyEntry = async (note, type) => {
    try {
      if (type === "sketch") {
        if (!note.image) return;
        const blob = await (await fetch(note.image)).blob();
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      } else {
        const text = note.title ? `${note.title}\n\n${note.content || ""}` : note.content || "";
        await navigator.clipboard.writeText(text);
      }
      setCopyFeedback(note.id);
      setTimeout(() => setCopyFeedback(null), 1500);
    } catch (e) {
      // Clipboard access can fail (permissions, unsupported browser) — fail quietly
    }
  };

  const dictationSupported =
    typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const stopDictation = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setListening(false);
  };

  const startDictation = (note) => {
    if (!dictationSupported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    dictationBaseRef.current = note.content || "";
    dictationNoteIdRef.current = note.id;
    if (dictationBaseRef.current && !/\s$/.test(dictationBaseRef.current)) {
      dictationBaseRef.current += " ";
    }

    recognition.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += transcript;
        else interimText += transcript;
      }
      if (finalText) {
        dictationBaseRef.current += finalText.trim() + " ";
      }
      editNote(dictationNoteIdRef.current, "content", dictationBaseRef.current + interimText);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const toggleDictation = (note) => {
    if (listening) {
      stopDictation();
    } else {
      startDictation(note);
    }
  };

  // Stop dictation automatically if the person navigates away from the note being dictated into
  useEffect(() => {
    if (listening && activeNoteId !== dictationNoteIdRef.current) {
      stopDictation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNoteId, showHome]);

  // A stale text selection from a previous note shouldn't leave the "pin to timeline"
  // button showing after switching notes
  useEffect(() => {
    setSelRange({ start: 0, end: 0 });
  }, [activeNoteId]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const editNote = (id, field, value) => {
    updateNotes((prev) => ({
      ...prev,
      [activeCategory]: prev[activeCategory].map((n) =>
        n.id === id ? { ...n, [field]: value, updatedAt: Date.now() } : n
      ),
    }));
  };

  const addCategory = () => {
    const label = newCatName.trim();
    if (!label) return;
    const key = slugify(label);
    const cat = { key, label, icon: newCatIcon, accent: newCatColor, builtin: false, type: newCatType };
    const nextCategories = [...categories, cat];
    setCategories(nextCategories);
    setNotes((prev) => {
      const next = { ...prev, [key]: [] };
      persist(next, nextCategories, theme);
      return next;
    });
    setNewCatName("");
    setNewCatIcon("Sparkles");
    setNewCatColor(COLOR_CHOICES[0]);
    setNewCatType("text");
    setShowAddCategory(false);
    setActiveCategory(key);
    setShowHome(false);
    setShowTimeline(false);
  };

  const deleteCategory = (key) => {
    if (!window.confirm("Delete this category and all its entries? This can't be undone.")) return;
    const nextCategories = categories.filter((c) => c.key !== key);
    setCategories(nextCategories);
    setNotes((prev) => {
      const next = { ...prev };
      delete next[key];
      persist(next, nextCategories, theme);
      return next;
    });
    if (activeCategory === key) {
      setShowHome(true);
      setShowTimeline(false);
      setActiveNoteId(null);
    }
  };

  const sendMagicLink = async () => {
    if (!supabase || !authEmail.trim()) return;
    setAuthStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail.trim(),
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    });
    setAuthStatus(error ? "error" : "sent");
  };

  const signOutCloud = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setShowCloudPanel(false);
  };

  const importLocalToCloud = async () => {
    if (!supabase || !session) return;
    setCloudSyncState("syncing");
    const { error } = await supabase.from("campaign_data").upsert({
      user_id: session.user.id,
      categories,
      notes,
      theme,
      timeline,
      updated_at: new Date().toISOString(),
    });
    setCloudSyncState(error ? "error" : "synced");
    setShowImportPrompt(false);
  };

  const startFreshInCloud = async () => {
    if (!supabase || !session) return;
    setCloudSyncState("syncing");
    const emptyCategories = BUILTIN_CATEGORIES;
    const emptyNotes = buildEmptyNotes(emptyCategories);
    const { error } = await supabase.from("campaign_data").upsert({
      user_id: session.user.id,
      categories: emptyCategories,
      notes: emptyNotes,
      theme: "purple",
      timeline: [],
      updated_at: new Date().toISOString(),
    });
    setCategories(emptyCategories);
    setNotes(emptyNotes);
    setTheme("purple");
    setTimeline([]);
    setCloudSyncState(error ? "error" : "synced");
    setShowImportPrompt(false);
  };

  // Appends client_reference_id when signed in so the Stripe webhook can link the
  // purchase back to a Supabase account and grant real (server-verified) Cloud Sync
  // access. Anonymous checkouts (not signed in) still work exactly as before — they just
  // get the honor-system unlock for PDF export / party sharing, no Cloud Sync.
  const paymentLinkFor = (plan) => {
    const base = PAYMENT_LINKS[plan];
    if (!base) return null;
    if (!session) return base;
    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}client_reference_id=${encodeURIComponent(session.user.id)}`;
  };

  const catMeta = categories.find((c) => c.key === activeCategory) || categories[0];
  const T = THEME_PALETTES[theme] || THEME_PALETTES.purple;

  if (recapPayload) {
    return <RecapView payload={recapPayload} />;
  }

  if (!loaded) {
    return (
      <div
        className="h-full w-full flex items-center justify-center"
        style={{ background: T.bgB, color: T.textDim1 }}
      >
        <div className="flex flex-col items-center gap-3">
          <QuillMark size={64} logoFrom={T.logoFrom} logoTo={T.logoTo} />
          <span className="text-lg tracking-widest uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
            Unrolling the parchment…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full w-full flex overflow-hidden relative"
      style={{
        background: `radial-gradient(ellipse at top left, ${T.bgA} 0%, ${T.bgB} 55%, ${T.bgC} 100%)`,
        color: T.textPrimary,
        fontFamily: "'Crimson Pro', 'Georgia', serif",
      }}
    >
      <style>{`
        .qlog-scroll::-webkit-scrollbar { width: 8px; }
        .qlog-scroll::-webkit-scrollbar-track { background: transparent; }
        .qlog-scroll::-webkit-scrollbar-thumb { background: ${T.borderSoft}; border-radius: 8px; }
        textarea:focus, input:focus { outline: none; }
        .cat-row:hover .cat-delete { opacity: 1; }
      `}</style>

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen((s) => !s)}
        className="md:hidden absolute top-3 right-3 z-30 p-2 rounded-lg border"
        style={{ background: `${T.bgA}cc`, borderColor: T.borderSoft, color: T.textPrimary }}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`z-20 flex flex-col shrink-0 border-r transition-transform duration-200 absolute md:relative h-full ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ width: "230px", background: T.panelHeader, borderColor: T.borderStrong, backdropFilter: "blur(6px)" }}
      >
        <button
          onClick={() => {
            setShowHome(true);
            setShowTimeline(false);
            setSidebarOpen(false);
          }}
          className="flex items-center gap-2 px-4 py-4 border-b text-left transition-colors"
          style={{ borderColor: T.borderStrong }}
          onMouseEnter={(e) => (e.currentTarget.style.background = T.panelHeaderHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          title="Return to home"
        >
          <QuillMark size={46} logoFrom={T.logoFrom} logoTo={T.logoTo} />
          <div>
            <div className="text-2xl leading-tight tracking-wide" style={{ fontFamily: "'Cinzel', serif", color: T.textPrimary }}>
              Quest Log
            </div>
            <div className="text-[15px] tracking-widest uppercase" style={{ color: "#c9a961" }}>
              Session Notes
            </div>
          </div>
        </button>

        <nav className="flex-1 px-2 py-3 flex flex-col gap-1 overflow-y-auto qlog-scroll">
          <button
            onClick={() => {
              setShowHome(true);
              setShowTimeline(false);
              setSidebarOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-lg transition-colors mb-1"
            style={{
              background: showHome ? T.activeBg : "transparent",
              color: showHome ? T.textBright : T.textDim1,
              boxShadow: showHome ? "inset 3px 0 0 #c9a961" : "none",
            }}
          >
            <Home size={24} style={{ color: showHome ? "#c9a961" : T.textDim4 }} />
            <span style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.02em" }}>Home</span>
          </button>
          <button
            onClick={() => {
              setShowTimeline(true);
              setShowHome(false);
              setSidebarOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-lg transition-colors mb-1"
            style={{
              background: showTimeline ? T.activeBg : "transparent",
              color: showTimeline ? T.textBright : T.textDim1,
              boxShadow: showTimeline ? "inset 3px 0 0 #c9a961" : "none",
            }}
          >
            <Milestone size={24} style={{ color: showTimeline ? "#c9a961" : T.textDim4 }} />
            <span style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.02em" }}>Timeline</span>
            {timeline.length > 0 && (
              <span className="ml-auto text-base shrink-0" style={{ color: T.textDim5 }}>
                {timeline.length}
              </span>
            )}
          </button>
          <div className="h-px mx-3 my-1" style={{ background: T.borderStrong }} />

          {categories.map((c) => {
            const active = !showHome && !showTimeline && c.key === activeCategory;
            return (
              <div key={c.key} className="cat-row relative flex items-center">
                <button
                  onClick={() => {
                    setActiveCategory(c.key);
                    setActiveNoteId(null);
                    setShowHome(false);
                    setShowTimeline(false);
                    setSidebarOpen(false);
                  }}
                  className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-lg transition-colors min-w-0"
                  style={{
                    background: active ? T.activeBg : "transparent",
                    color: active ? T.textBright : T.textDim1,
                    boxShadow: active ? `inset 3px 0 0 ${c.accent}` : "none",
                  }}
                >
                  <CategoryIcon name={c.icon} size={30} style={{ color: active ? c.accent : T.textDim4 }} />
                  <span className="truncate" style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.02em" }}>
                    {c.label}
                  </span>
                  <span className="ml-auto text-base shrink-0" style={{ color: T.textDim5 }}>
                    {notes[c.key]?.length || 0}
                  </span>
                </button>
                {!c.builtin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCategory(c.key);
                    }}
                    className="cat-delete opacity-0 transition-opacity absolute right-1.5 p-1 rounded"
                    style={{ color: T.textDim2 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = T.hoverBg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    title="Delete category"
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </div>
            );
          })}

          {showAddCategory ? (
            <div className="mt-2 mx-1 p-3 rounded-lg border" style={{ borderColor: T.borderSoft, background: T.panelForm }}>
              <input
                autoFocus
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCategory()}
                placeholder="Category name…"
                className="w-full bg-transparent border-b text-lg px-1 py-1.5 mb-2"
                style={{ borderColor: T.borderSoft, color: T.textPrimary }}
              />
              <div className="flex gap-1.5 mb-2">
                {[
                  { v: "text", label: "Text" },
                  { v: "sketch", label: "Sketch" },
                ].map((opt) => (
                  <button
                    key={opt.v}
                    onClick={() => setNewCatType(opt.v)}
                    className="flex-1 text-[15px] py-1 rounded-md border"
                    style={{
                      borderColor: newCatType === opt.v ? newCatColor : T.borderStrong,
                      color: newCatType === opt.v ? newCatColor : T.textDim2,
                      background: newCatType === opt.v ? T.activeBg : "transparent",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-6 gap-1.5 mb-2">
                {ICON_CHOICES.map((iconName) => (
                  <button
                    key={iconName}
                    onClick={() => setNewCatIcon(iconName)}
                    className="flex items-center justify-center p-1.5 rounded-md border"
                    style={{
                      borderColor: newCatIcon === iconName ? newCatColor : T.borderStrong,
                      background: newCatIcon === iconName ? T.activeBg : "transparent",
                    }}
                  >
                    <CategoryIcon
                      name={iconName}
                      size={20}
                      style={{ color: newCatIcon === iconName ? newCatColor : T.textDim2 }}
                    />
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5 mb-3">
                {COLOR_CHOICES.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewCatColor(color)}
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      background: color,
                      boxShadow: newCatColor === color ? `0 0 0 2px ${T.bgB}, 0 0 0 3.5px ${color}` : "none",
                    }}
                  >
                    {newCatColor === color && <Check size={15} color={T.bgB} />}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addCategory}
                  disabled={!newCatName.trim()}
                  className="flex-1 text-base py-1.5 rounded-md border disabled:opacity-40"
                  style={{ borderColor: newCatColor, color: newCatColor }}
                >
                  Create
                </button>
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="flex-1 text-base py-1.5 rounded-md border"
                  style={{ borderColor: T.borderSoft, color: T.textDim2 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddCategory(true)}
              className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg text-lg transition-colors border border-dashed"
              style={{ borderColor: T.borderSoft, color: T.textDim2 }}
            >
              <Plus size={19} />
              <span style={{ fontFamily: "'Cinzel', serif" }}>Add Category</span>
            </button>
          )}
        </nav>

        <div className="px-4 py-3 border-t" style={{ borderColor: T.borderStrong }}>
          <button
            onClick={() => setShowUpgrade(true)}
            className="w-full flex items-center gap-2 px-3 py-2 mb-2 rounded-lg border text-base transition hover:brightness-110"
            style={{ borderColor: "#c9a961", color: "#c9a961", background: `${T.activeBg}` }}
          >
            <Crown size={18} />
            <span style={{ fontFamily: "'Cinzel', serif" }}>Upgrade</span>
          </button>
          {supabase && (
            <button
              onClick={() => setShowCloudPanel(true)}
              className="w-full flex items-center gap-2 px-3 py-2 mb-3 rounded-lg border text-base transition hover:brightness-110"
              style={{ borderColor: T.borderSoft, color: session && cloudPremium ? "#6fe0a0" : T.textDim2 }}
            >
              {cloudSyncState === "loading" || cloudSyncState === "syncing" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Cloud size={18} />
              )}
              <span style={{ fontFamily: "'Cinzel', serif" }}>
                {session && cloudPremium
                  ? cloudSyncState === "syncing"
                    ? "Syncing…"
                    : "Synced"
                  : session
                  ? "Cloud Sync"
                  : "Sign in to Sync"}
              </span>
            </button>
          )}
          <div className="flex items-center gap-2 mb-2.5">
            {Object.entries(THEME_PALETTES).map(([key, pal]) => (
              <button
                key={key}
                onClick={() => changeTheme(key)}
                title={pal.label}
                className="w-6 h-6 rounded-full transition"
                style={{
                  background: pal.swatch,
                  boxShadow: theme === key ? `0 0 0 2px ${T.bgB}, 0 0 0 3.5px ${pal.swatch}` : `0 0 0 1px ${T.borderSoft}`,
                }}
              />
            ))}
          </div>
          <div className="text-[15px] flex items-center gap-2" style={{ color: T.textDim5 }}>
            <Feather size={16} />
            {saveState === "saving" ? "Inscribing…" : saveState === "saved" ? "Saved to your device" : "Auto-saves as you write"}
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="md:hidden absolute inset-0 bg-black/50 z-10" onClick={() => setSidebarOpen(false)} />
      )}

      {showTimeline ? (
        <TimelineView
          timeline={timeline}
          categories={categories}
          notes={notes}
          T={T}
          onJump={jumpToTimelineSource}
          onDelete={deleteTimelineEntry}
        />
      ) : showHome ? (
        <main className="flex-1 overflow-y-auto qlog-scroll z-10 px-6 md:px-10 py-10">
          <div className="flex items-center gap-4 mb-8">
            <QuillMark size={60} logoFrom={T.logoFrom} logoTo={T.logoTo} />
            <div className="flex-1 min-w-0">
              <div className="text-4xl tracking-wide" style={{ fontFamily: "'Cinzel', serif", color: T.textBright }}>
                Welcome back, adventurer
              </div>
              <div className="text-lg mt-1" style={{ color: T.textDim1 }}>
                {Object.values(notes).reduce((s, l) => s + l.length, 0)} entries recorded across your campaign
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-2 shrink-0 ml-auto">
              <button
                onClick={() => {
                  if (isPremium) {
                    exportCampaignToPdf(categories, notes);
                  } else {
                    setShowUpgrade(true);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border text-base hover:brightness-110 transition"
                style={{ borderColor: "#c9a961", color: "#c9a961" }}
                title={isPremium ? "Export your campaign as a PDF" : "Upgrade to unlock PDF export"}
              >
                <FileText size={17} />
                Export to PDF
                {!isPremium && <Crown size={14} />}
              </button>
              <button
                onClick={() => {
                  if (isPremium) {
                    setShareLink(null);
                    setShareSelectedIds(new Set());
                    setShowShareModal(true);
                  } else {
                    setShowUpgrade(true);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border text-base hover:brightness-110 transition"
                style={{ borderColor: "#c9a961", color: "#c9a961" }}
                title={isPremium ? "Share a recap with your party" : "Upgrade to unlock party sharing"}
              >
                <Share2 size={17} />
                Share with Party
                {!isPremium && <Crown size={14} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 relative z-10">
            {categories.map((c) => {
              const list = notes[c.key] || [];
              const latest = list.slice().sort((a, b) => b.updatedAt - a.updatedAt)[0];
              return (
                <button
                  key={c.key}
                  onClick={() => {
                    setActiveCategory(c.key);
                    setActiveNoteId(null);
                    setShowHome(false);
                  }}
                  className="text-left p-4 rounded-xl border transition hover:brightness-110"
                  style={{ borderColor: T.borderStrong, background: T.panelCard }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <CategoryIcon name={c.icon} size={44} style={{ color: c.accent }} />
                      <span
                        className="text-3xl truncate"
                        style={{ fontFamily: "'Cinzel', serif", color: T.textPrimary }}
                      >
                        {c.label}
                      </span>
                    </div>
                    <span className="text-5xl shrink-0 ml-2" style={{ fontFamily: "'Cinzel', serif", color: c.accent }}>
                      {list.length}
                    </span>
                  </div>
                  <div className="text-lg mt-1 truncate" style={{ color: T.textDim4 }}>
                    {latest ? `Last: ${latest.title || "Untitled entry"}` : "No entries yet"}
                  </div>
                </button>
              );
            })}
            <button
              onClick={() => {
                setShowHome(false);
                setActiveCategory(categories[0]?.key);
                setShowAddCategory(true);
                setSidebarOpen(true);
              }}
              className="text-left p-4 rounded-xl border border-dashed flex flex-col items-center justify-center gap-2 transition hover:brightness-110"
              style={{ borderColor: T.borderSoft, color: T.textDim2 }}
            >
              <Plus size={28} />
              <span className="text-lg" style={{ fontFamily: "'Cinzel', serif" }}>
                Add Category
              </span>
            </button>
          </div>

          <div className="relative h-0 z-0">
            <QuillWatermark
              size={230}
              className="pointer-events-none absolute opacity-[0.08] select-none"
              style={{ top: "-170px", right: "22%" }}
              stroke={T.logoFrom}
            />
          </div>

          <div className="relative z-10">
            <div className="mb-4 text-lg tracking-widest uppercase" style={{ color: "#c9a961", fontFamily: "'Cinzel', serif" }}>
              Quick Add
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map((c) => (
                <button
                  key={c.key}
                  onClick={() => createNote(c.key)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border text-lg hover:brightness-125 transition"
                  style={{ borderColor: c.accent, color: c.accent }}
                >
                  <Plus size={18} />
                  New {c.singular || c.label.replace(/s$/, "")}
                </button>
              ))}
            </div>
          </div>
        </main>
      ) : (
        <>
          {/* Notes list — on mobile this and the editor are mutually exclusive (list/detail
              pattern); both show side by side from md: up. */}
          <section
            className={`${activeNoteId ? "hidden" : "flex"} md:flex w-full md:w-72 shrink-0 border-r flex-col z-10`}
            style={{ borderColor: T.borderMed, background: T.panelList }}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: T.borderMed }}>
              <h2
                className="text-xl tracking-wide flex items-center gap-2 min-w-0"
                style={{ fontFamily: "'Cinzel', serif", color: catMeta.accent }}
              >
                <CategoryIcon name={catMeta.icon} size={28} />
                <span className="truncate">{catMeta.label}</span>
              </h2>
              <button
                onClick={() => createNote()}
                className="p-1.5 rounded-md border text-base flex items-center gap-1 hover:brightness-125 transition shrink-0"
                style={{ borderColor: catMeta.accent, color: catMeta.accent }}
              >
                <Plus size={18} /> New
              </button>
            </div>

            <div className="flex-1 overflow-y-auto qlog-scroll px-2 py-2">
              {activeList.length === 0 && (
                <div className="text-center text-lg px-4 py-10" style={{ color: T.textDim5 }}>
                  No entries yet.
                  <br />
                  Begin your {catMeta.label.toLowerCase()} log.
                </div>
              )}
              {activeList
                .slice()
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setActiveNoteId(n.id)}
                    className="w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-colors"
                    style={{
                      background: activeNoteId === n.id ? T.activeBg : "transparent",
                      color: T.textPrimary,
                    }}
                  >
                    <div className="text-lg truncate" style={{ fontWeight: 500 }}>
                      {n.title || "Untitled entry"}
                    </div>
                    {catMeta.type === "sketch" ? (
                      n.image ? (
                        <div
                          className="w-full h-12 rounded mt-1 border overflow-hidden"
                          style={{ borderColor: T.borderStrong, ...sketchBgStyle(n.bgStyle) }}
                        >
                          <img src={n.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="text-base truncate mt-0.5" style={{ color: T.textDim3 }}>
                          Blank sketch
                        </div>
                      )
                    ) : (
                      <div className="text-base truncate mt-0.5" style={{ color: T.textDim3 }}>
                        {n.content ? n.content.slice(0, 48) : "No content"}
                      </div>
                    )}
                    <div className="text-[14px] mt-1" style={{ color: "#4d4066" }}>
                      {timeAgo(n.updatedAt)}
                    </div>
                  </button>
                ))}
            </div>
          </section>

          {/* Editor */}
          <main className={`${activeNoteId ? "flex" : "hidden"} md:flex flex-1 flex-col z-10 min-w-0`}>
            {activeNote ? (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: T.borderMed }}>
                  <button
                    onClick={() => setActiveNoteId(null)}
                    className="md:hidden p-2 -ml-2 mr-1 rounded-md transition shrink-0"
                    style={{ color: T.textDim2 }}
                    title="Back to list"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <input
                    value={activeNote.title}
                    onChange={(e) => editNote(activeNote.id, "title", e.target.value)}
                    placeholder="Entry title…"
                    className="bg-transparent text-3xl w-full pr-4"
                    style={{ fontFamily: "'Cinzel', serif", color: T.textBright }}
                  />
                  {catMeta.type !== "sketch" && dictationSupported && (
                    <button
                      onClick={() => toggleDictation(activeNote)}
                      className="p-2 rounded-md transition shrink-0"
                      style={{ color: listening ? "#e0623d" : T.textDim2 }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = T.borderStrong)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      title={listening ? "Stop dictation" : "Dictate entry (speech to text)"}
                    >
                      {listening ? <Mic size={22} className="animate-pulse" /> : <MicOff size={22} />}
                    </button>
                  )}
                  {catMeta.type !== "sketch" && selRange.end > selRange.start && (
                    <button
                      onClick={addSelectionToTimeline}
                      className="p-2 rounded-md transition shrink-0"
                      style={{ color: "#c9a961" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = T.borderStrong)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      title="Pin selected text to Timeline"
                    >
                      <Milestone size={22} />
                    </button>
                  )}
                  <button
                    onClick={() => copyEntry(activeNote, catMeta.type)}
                    className="p-2 rounded-md transition shrink-0"
                    style={{ color: copyFeedback === activeNote.id ? "#7fbf8f" : T.textDim2 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = T.borderStrong)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    title={catMeta.type === "sketch" ? "Copy sketch as image" : "Copy entry text"}
                  >
                    {copyFeedback === activeNote.id ? <Check size={22} /> : <Copy size={22} />}
                  </button>
                  <button
                    onClick={() => deleteNote(activeNote.id)}
                    className="p-2 rounded-md transition shrink-0"
                    style={{ color: "#c76b6b" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = T.borderStrong)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    title="Delete entry"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>
                {catMeta.type === "sketch" ? (
                  <SketchPad
                    note={activeNote}
                    accent={catMeta.accent}
                    T={T}
                    onChange={(dataUrl) => editNote(activeNote.id, "image", dataUrl)}
                    onBgStyleChange={(style) => editNote(activeNote.id, "bgStyle", style)}
                  />
                ) : (
                  <div className="flex-1 relative min-h-0">
                    <textarea
                      ref={contentRef}
                      value={activeNote.content}
                      onChange={(e) => editNote(activeNote.id, "content", e.target.value)}
                      onSelect={captureSelection}
                      onMouseUp={captureSelection}
                      onKeyUp={captureSelection}
                      placeholder={PLACEHOLDERS[activeCategory] || `Write your ${catMeta.label.toLowerCase()} entry…`}
                      className="w-full h-full bg-transparent resize-none px-6 py-5 text-[19px] leading-relaxed qlog-scroll"
                      style={{ color: T.contentText }}
                    />
                    {listening && dictationNoteIdRef.current === activeNote.id && (
                      <div
                        className="absolute top-3 right-6 flex items-center gap-2 px-3 py-1.5 rounded-full text-base"
                        style={{ background: T.activeBg, color: "#e0623d", border: `1px solid ${T.borderSoft}` }}
                      >
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#e0623d" }} />
                        Listening…
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <QuillMark size={72} logoFrom={T.logoFrom} logoTo={T.logoTo} />
                <div>
                  <div className="text-2xl" style={{ fontFamily: "'Cinzel', serif", color: T.textPrimary }}>
                    Select or create an entry
                  </div>
                  <div className="text-lg mt-1" style={{ color: T.textDim3 }}>
                    {catMeta.type === "sketch"
                      ? `Your ${catMeta.label.toLowerCase()} await their next stroke.`
                      : `Your ${catMeta.label.toLowerCase()} await their next line.`}
                  </div>
                </div>
                <button
                  onClick={() => createNote()}
                  className="mt-2 px-5 py-2.5 rounded-lg border text-lg flex items-center gap-2 hover:brightness-125 transition"
                  style={{ borderColor: catMeta.accent, color: catMeta.accent }}
                >
                  <Plus size={19} /> New {catMeta.singular || catMeta.label.replace(/s$/, "")}
                </button>
              </div>
            )}
          </main>
        </>
      )}

      {showUpgrade && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)" }}
          onClick={() => setShowUpgrade(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border overflow-hidden qlog-scroll"
            style={{ background: T.panelCard, borderColor: "#c9a961", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative px-7 pt-7 pb-5 text-center border-b" style={{ borderColor: T.borderStrong }}>
              <button
                onClick={() => setShowUpgrade(false)}
                className="absolute top-3 right-3 p-1.5 rounded-md hover:brightness-125 transition"
                style={{ color: T.textDim2 }}
              >
                <X size={20} />
              </button>
              <div className="flex justify-center mb-3">
                <QuillMark size={48} logoFrom={T.logoFrom} logoTo={T.logoTo} />
              </div>
              <div className="text-2xl tracking-wide" style={{ fontFamily: "'Cinzel', serif", color: "#c9a961" }}>
                {isPremium ? "You're Upgraded" : "Unlock the Full Scroll"}
              </div>
              <div className="text-base mt-1.5" style={{ color: T.textDim1 }}>
                {isPremium
                  ? "Thank you for supporting Quest Log."
                  : "Keep every campaign safe, shareable, and with you everywhere."}
              </div>
            </div>

            <div className="px-7 py-5 flex flex-col gap-4 border-b" style={{ borderColor: T.borderStrong }}>
              {[
                { icon: Cloud, title: "Cloud Sync & Backup", desc: "Start on your laptop, pick up on your phone at the table.", available: true },
                { icon: FileText, title: "Export to PDF", desc: "Turn any campaign into a printable campaign bible.", available: true },
                { icon: Share2, title: "Share with Your Party", desc: "Send a curated recap link to the whole table.", available: true },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <div
                    className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: T.activeBg, color: "#c9a961" }}
                  >
                    <f.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-base font-medium" style={{ color: T.textPrimary }}>
                        {f.title}
                      </div>
                      {!f.available && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0"
                          style={{ border: `1px solid ${T.borderSoft}`, color: T.textDim3 }}
                        >
                          Coming soon
                        </span>
                      )}
                    </div>
                    <div className="text-sm" style={{ color: T.textDim3 }}>
                      {f.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isPremium ? (
              <div className="px-7 py-5">
                <button
                  onClick={() => setShowUpgrade(false)}
                  className="w-full py-3 rounded-lg text-lg tracking-wide hover:brightness-110 transition"
                  style={{ background: "#c9a961", color: T.bgB, fontFamily: "'Cinzel', serif" }}
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="px-7 py-5">
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { key: "monthly", label: "Monthly", price: "$3.99", sub: "/mo" },
                    { key: "yearly", label: "Yearly", price: "$24.99", sub: "/yr", badge: "Best Value" },
                    { key: "lifetime", label: "Lifetime", price: "$49.99", sub: "once" },
                  ].map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setSelectedPlan(p.key)}
                      className="relative flex flex-col items-center gap-0.5 py-3 px-1 rounded-lg border transition"
                      style={{
                        borderColor: selectedPlan === p.key ? "#c9a961" : T.borderStrong,
                        background: selectedPlan === p.key ? T.activeBg : "transparent",
                      }}
                    >
                      {p.badge && (
                        <span
                          className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[10px] whitespace-nowrap"
                          style={{ background: "#c9a961", color: T.bgB, fontFamily: "'Cinzel', serif" }}
                        >
                          {p.badge}
                        </span>
                      )}
                      <span className="text-sm mt-1" style={{ color: T.textDim2, fontFamily: "'Cinzel', serif" }}>
                        {p.label}
                      </span>
                      <span className="text-lg" style={{ color: selectedPlan === p.key ? "#c9a961" : T.textPrimary }}>
                        {p.price}
                      </span>
                      <span className="text-xs" style={{ color: T.textDim4 }}>
                        {p.sub}
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const link = paymentLinkFor(selectedPlan);
                    if (!link) {
                      setCheckoutUnavailable(true);
                      return;
                    }
                    window.location.href = link;
                  }}
                  className="w-full py-3 rounded-lg text-lg tracking-wide hover:brightness-110 transition"
                  style={{ background: "#c9a961", color: T.bgB, fontFamily: "'Cinzel', serif" }}
                >
                  Upgrade Now
                </button>
                {checkoutUnavailable ? (
                  <div className="text-center text-xs mt-2" style={{ color: "#e0623d" }}>
                    Checkout isn't configured for this plan yet.
                  </div>
                ) : (
                  <div className="text-center text-xs mt-2" style={{ color: T.textDim5 }}>
                    Secure checkout via Stripe.
                  </div>
                )}
                <button
                  onClick={() => setShowUpgrade(false)}
                  className="w-full text-center text-sm mt-3 hover:underline"
                  style={{ color: T.textDim3 }}
                >
                  Maybe later
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {upgradeToast && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-lg border shadow-lg"
          style={{ background: T.panelCard, borderColor: "#c9a961", color: T.textPrimary }}
        >
          <Check size={18} style={{ color: "#c9a961" }} />
          Upgrade successful — PDF export unlocked.
        </div>
      )}

      {showShareModal && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)" }}
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border overflow-hidden qlog-scroll flex flex-col"
            style={{ background: T.panelCard, borderColor: "#c9a961", maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative px-7 pt-7 pb-5 text-center border-b shrink-0" style={{ borderColor: T.borderStrong }}>
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-3 right-3 p-1.5 rounded-md hover:brightness-125 transition"
                style={{ color: T.textDim2 }}
              >
                <X size={20} />
              </button>
              <div className="flex justify-center mb-3">
                <Share2 size={36} style={{ color: "#c9a961" }} />
              </div>
              <div className="text-2xl tracking-wide" style={{ fontFamily: "'Cinzel', serif", color: "#c9a961" }}>
                Share with Your Party
              </div>
              <div className="text-base mt-1.5" style={{ color: T.textDim1 }}>
                Pick a few entries for a recap link. Sketches can't be included — image data is
                too large to fit in a link.
              </div>
            </div>

            <div className="flex-1 overflow-y-auto qlog-scroll px-7 py-5">
              {categories.filter((c) => c.type !== "sketch").every((c) => (notes[c.key] || []).length === 0) ? (
                <div className="text-base text-center py-6" style={{ color: T.textDim3 }}>
                  No shareable entries yet — sketches aside, write something first.
                </div>
              ) : (
                categories
                  .filter((c) => c.type !== "sketch" && (notes[c.key] || []).length > 0)
                  .map((cat) => (
                    <div key={cat.key} className="mb-5">
                      <div className="flex items-center gap-2 mb-2">
                        <CategoryIcon name={cat.icon} size={18} style={{ color: cat.accent }} />
                        <span className="text-base" style={{ fontFamily: "'Cinzel', serif", color: T.textPrimary }}>
                          {cat.label}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {(notes[cat.key] || [])
                          .slice()
                          .sort((a, b) => b.updatedAt - a.updatedAt)
                          .map((note) => (
                            <label
                              key={note.id}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition"
                              style={{ background: shareSelectedIds.has(note.id) ? T.activeBg : "transparent" }}
                            >
                              <input
                                type="checkbox"
                                checked={shareSelectedIds.has(note.id)}
                                onChange={(e) => {
                                  setShareLink(null);
                                  setShareSelectedIds((prev) => {
                                    const next = new Set(prev);
                                    if (e.target.checked) next.add(note.id);
                                    else next.delete(note.id);
                                    return next;
                                  });
                                }}
                              />
                              <span className="text-[15px] truncate" style={{ color: T.textPrimary }}>
                                {note.title || "Untitled entry"}
                              </span>
                            </label>
                          ))}
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="px-7 py-5 border-t shrink-0" style={{ borderColor: T.borderStrong }}>
              {shareLink ? (
                <div>
                  <div
                    className="text-[13px] mb-3 px-3 py-2 rounded-lg border break-all"
                    style={{ borderColor: T.borderSoft, color: T.textDim2, maxHeight: "80px", overflowY: "auto" }}
                  >
                    {shareLink}
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(shareLink);
                        setShareCopyFeedback(true);
                        setTimeout(() => setShareCopyFeedback(false), 1500);
                      } catch (e) {
                        // clipboard access can fail — link is still visible to copy manually
                      }
                    }}
                    className="w-full py-3 rounded-lg text-lg tracking-wide hover:brightness-110 transition flex items-center justify-center gap-2"
                    style={{ background: "#c9a961", color: T.bgB, fontFamily: "'Cinzel', serif" }}
                  >
                    {shareCopyFeedback ? <Check size={20} /> : <Copy size={20} />}
                    {shareCopyFeedback ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    const link = buildRecapLink(categories, notes, shareSelectedIds);
                    if (link) setShareLink(link);
                  }}
                  disabled={shareSelectedIds.size === 0}
                  className="w-full py-3 rounded-lg text-lg tracking-wide hover:brightness-110 transition disabled:opacity-40"
                  style={{ background: "#c9a961", color: T.bgB, fontFamily: "'Cinzel', serif" }}
                >
                  Generate Link ({shareSelectedIds.size} selected)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showCloudPanel && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)" }}
          onClick={() => setShowCloudPanel(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border overflow-hidden"
            style={{ background: T.panelCard, borderColor: "#c9a961" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative px-7 pt-7 pb-6 text-center">
              <button
                onClick={() => setShowCloudPanel(false)}
                className="absolute top-3 right-3 p-1.5 rounded-md hover:brightness-125 transition"
                style={{ color: T.textDim2 }}
              >
                <X size={20} />
              </button>
              <div className="flex justify-center mb-3">
                <Cloud size={36} style={{ color: "#c9a961" }} />
              </div>
              <div className="text-2xl tracking-wide mb-4" style={{ fontFamily: "'Cinzel', serif", color: "#c9a961" }}>
                Cloud Sync
              </div>

              {!session ? (
                <div>
                  <div className="text-base mb-4" style={{ color: T.textDim1 }}>
                    Sign in to start syncing your campaign across devices. Free to create — no
                    password needed.
                  </div>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent border rounded-lg px-3 py-2.5 text-base mb-3"
                    style={{ borderColor: T.borderSoft, color: T.textPrimary }}
                  />
                  {authStatus === "sent" ? (
                    <div className="text-base" style={{ color: "#6fe0a0" }}>
                      Check your email for a sign-in link.
                    </div>
                  ) : (
                    <button
                      onClick={sendMagicLink}
                      disabled={!authEmail.trim() || authStatus === "sending"}
                      className="w-full py-2.5 rounded-lg text-base tracking-wide hover:brightness-110 transition disabled:opacity-40"
                      style={{ background: "#c9a961", color: T.bgB, fontFamily: "'Cinzel', serif" }}
                    >
                      {authStatus === "sending" ? "Sending…" : "Send Sign-In Link"}
                    </button>
                  )}
                  {authStatus === "error" && (
                    <div className="text-sm mt-2" style={{ color: "#e0623d" }}>
                      Couldn't send the link — check the email and try again.
                    </div>
                  )}
                </div>
              ) : !cloudPremium ? (
                <div>
                  <div className="text-base mb-1" style={{ color: T.textDim1 }}>
                    Signed in as <span style={{ color: T.textPrimary }}>{session.user.email}</span>
                  </div>
                  <div className="text-base mb-4" style={{ color: T.textDim1 }}>
                    Upgrade to enable syncing for this account.
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { key: "monthly", label: "Monthly", price: "$3.99" },
                      { key: "yearly", label: "Yearly", price: "$24.99" },
                      { key: "lifetime", label: "Lifetime", price: "$49.99" },
                    ].map((p) => (
                      <a
                        key={p.key}
                        href={paymentLinkFor(p.key) || "#"}
                        onClick={(e) => {
                          if (!paymentLinkFor(p.key)) e.preventDefault();
                        }}
                        className="flex flex-col items-center gap-0.5 py-2.5 px-1 rounded-lg border transition hover:brightness-110"
                        style={{ borderColor: T.borderStrong, textDecoration: "none" }}
                      >
                        <span className="text-[13px]" style={{ color: T.textDim2, fontFamily: "'Cinzel', serif" }}>
                          {p.label}
                        </span>
                        <span className="text-base" style={{ color: T.textPrimary }}>
                          {p.price}
                        </span>
                      </a>
                    ))}
                  </div>
                  <button
                    onClick={signOutCloud}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm hover:brightness-125 transition"
                    style={{ color: T.textDim3 }}
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-base mb-1" style={{ color: T.textDim1 }}>
                    Signed in as <span style={{ color: T.textPrimary }}>{session.user.email}</span>
                  </div>
                  <div className="text-base mb-5 flex items-center justify-center gap-2" style={{ color: "#6fe0a0" }}>
                    {cloudSyncState === "syncing" ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Syncing…
                      </>
                    ) : (
                      <>
                        <Check size={16} /> Synced
                      </>
                    )}
                  </div>
                  <button
                    onClick={signOutCloud}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border text-base hover:brightness-125 transition"
                    style={{ borderColor: T.borderSoft, color: T.textDim2 }}
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showImportPrompt && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border overflow-hidden px-7 py-7 text-center"
            style={{ background: T.panelCard, borderColor: "#c9a961" }}
          >
            <div className="flex justify-center mb-3">
              <Cloud size={36} style={{ color: "#c9a961" }} />
            </div>
            <div className="text-xl tracking-wide mb-3" style={{ fontFamily: "'Cinzel', serif", color: "#c9a961" }}>
              Import Your Notes?
            </div>
            <div className="text-base mb-5" style={{ color: T.textDim1 }}>
              This device has notes that aren't in your cloud account yet. Bring them along, or
              start this account fresh and keep them local-only.
            </div>
            <button
              onClick={importLocalToCloud}
              className="w-full py-2.5 rounded-lg text-base tracking-wide hover:brightness-110 transition mb-2"
              style={{ background: "#c9a961", color: T.bgB, fontFamily: "'Cinzel', serif" }}
            >
              Import to Cloud
            </button>
            <button
              onClick={startFreshInCloud}
              className="w-full py-2.5 rounded-lg text-base hover:brightness-125 transition"
              style={{ color: T.textDim3 }}
            >
              Start Fresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
