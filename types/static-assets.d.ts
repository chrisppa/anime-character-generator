// Local type declarations for importing static assets in TypeScript
// Ensures `npx tsc --noEmit` recognizes image modules used by next/image

declare module "*.png" {
  const src: import("next/image").StaticImageData;
  export default src;
}

declare module "*.jpg" {
  const src: import("next/image").StaticImageData;
  export default src;
}

declare module "*.jpeg" {
  const src: import("next/image").StaticImageData;
  export default src;
}

declare module "*.webp" {
  const src: import("next/image").StaticImageData;
  export default src;
}

declare module "*.gif" {
  const src: import("next/image").StaticImageData;
  export default src;
}

declare module "*.svg" {
  // If using SVGR later, update this to React component types.
  const src: import("next/image").StaticImageData;
  export default src;
}

// Common video types if imported directly (rare). Adjust as needed.
declare module "*.mp4" {
  const src: string;
  export default src;
}

declare module "*.webm" {
  const src: string;
  export default src;
}

