import localFont from "next/font/local";
import {Inter} from "next/font/google";

export const fontDrukCondensed = localFont({
  src: "./Druk_Collection/Druk Condensed Family/DrukCond-Super-Trial.otf",
  variable: "--font-druk-condensed",
});

export const fontDrukTextWide = localFont({
  src:"./Druk_Collection/Druk Text Wide Family/DrukTextWide-SuperItalic-Trial.otf",
  variable:"--font-druk-text-wide"
})

export const fontDrukText = localFont({
  src:"./Druk_Collection/Druk Text Family/DrukText-Bold-Trial.otf",
  variable:"--font-druk-text"
});

export const fontInter = Inter({
  subsets: ["latin"],
  preload: true,
  variable: "--font-inter",
});
