import type { Metadata } from "next";
import { Big_Shoulders, Martian_Mono, Archivo } from "next/font/google";
import { Nav } from "@/components/Nav";
import "./globals.css";

const display = Big_Shoulders({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const mono = Martian_Mono({
  variable: "--font-flap",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const sans = Archivo({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const FAVICON = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="#0b0a08"/><rect x="4" y="9" width="24" height="14" rx="1.5" fill="#f3ede0"/><rect x="4" y="15" width="24" height="1.5" fill="#0b0a08" opacity="0.15"/><circle cx="16" cy="6" r="2" fill="#ffb020"/></svg>`,
)}`;

export const metadata: Metadata = {
  title: "datezap — Nepali BS ⇄ AD date service",
  description:
    "A live departure board for Bikram Sambat and Gregorian dates: convert, browse the month grid, and embed the picker — powered by nepkit.",
  icons: [{ url: FAVICON, type: "image/svg+xml" }],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${mono.variable} ${sans.variable} h-full`}
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
        <Nav />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
