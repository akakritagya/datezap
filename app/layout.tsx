import type { Metadata } from "next";
import { Big_Shoulders, Martian_Mono, Archivo, Noto_Sans_Devanagari } from "next/font/google";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { DevnagariProvider } from "@/lib/devnagari-context";
import "./globals.css";

// These raw variable names are distinct from the --font-display/-flap/-sans
// Tailwind theme tokens (see globals.css @theme inline) so the theme layer
// can compose each with the devnagari fallback below without the custom
// property self-referencing itself (which CSS treats as invalid and drops).
const display = Big_Shoulders({
  variable: "--font-display-raw",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const mono = Martian_Mono({
  variable: "--font-flap-raw",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const sans = Archivo({
  variable: "--font-sans-raw",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// None of the fonts above ship Devanagari glyphs -- this is the fallback the
// three stacks above delegate to (see globals.css) whenever the devnagari
// toggle renders digits/names Big Shoulders, Martian Mono, and Archivo can't.
const devnagari = Noto_Sans_Devanagari({
  variable: "--font-devnagari",
  subsets: ["devanagari"],
  weight: ["500", "700"],
});

const FAVICON = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="#0b0a08"/><rect x="4" y="9" width="24" height="14" rx="1.5" fill="#f3ede0"/><rect x="4" y="15" width="24" height="1.5" fill="#0b0a08" opacity="0.15"/><circle cx="16" cy="6" r="2" fill="#ffb020"/></svg>`,
)}`;

export const metadata: Metadata = {
  title: "datezap: Nepali BS ⇄ AD date service",
  description:
    "A live departure board for Bikram Sambat and Gregorian dates: convert, browse the month grid, and embed the picker, powered by nepkit.",
  icons: [{ url: FAVICON, type: "image/svg+xml" }],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${mono.variable} ${sans.variable} ${devnagari.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-casing text-ivory font-sans antialiased">
        <div
          hidden
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `<!--
  THESIS: converting a date is not a form submit, it is a board flipping to the right
  answer, shown not stated.
  OWN-WORLD: near-black board casing, ivory split-flap cells with near-black glyphs,
  amber pilot-light accent for "today," hazard-stripe flaps for out-of-range/error;
  Big Shoulders for chrome, Martian Mono for flap numerals, Archivo for body.
  STORY: a visitor types a date, watches it flap into its BS/AD counterpart, then
  trusts the same board powers /calendar and /picker.
  FIRST VIEWPORT: a large flap-board module — input row, live-flapping result row,
  adjacent "today" panel.
  FORM: Split-Flap Departure Board, direction 7 of 7 (resonance-ordered), seed key
  c8665e9d.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the finish
  review, the verdict, and DESIGN.md.
-->`,
          }}
        />
        <div className="grain-overlay" aria-hidden="true" />
        <DevnagariProvider>
          <Nav />
          <div className="flex-1">{children}</div>
          <Footer />
        </DevnagariProvider>
      </body>
    </html>
  );
}
