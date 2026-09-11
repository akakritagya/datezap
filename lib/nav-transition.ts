// Shared enter/exit mapping for the top-level <ViewTransition> on each page.
// Nav.tsx tags its <Link>s with a matching "nav-forward" / "nav-back"
// transitionTypes based on route order; browser-initiated navigation (back
// button, refresh) carries no type and falls through to "default": no slide.
export const NAV_TRANSITION = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "none",
} as const;
