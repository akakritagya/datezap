// Next 16's App Router bundles React's canary channel (that's where
// `ViewTransition` lives), but the installed `react` package/types are
// stable-channel. This pulls in the canary type augmentations so
// `import { ViewTransition } from "react"` type-checks; only needs to be
// referenced once, anywhere in the project. See node_modules/@types/react/canary.d.ts.
/// <reference types="react/canary" />
