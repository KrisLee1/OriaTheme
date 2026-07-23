import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createBootstrapStorageScript } from "@oriatheme/runtime-dom";
import "@oriatheme/colors/styles.css";
import "./globals.css";
import { defaultThemeCss } from "./default-theme-style";
import { Providers } from "./providers";

const bootstrapScript = createBootstrapStorageScript();

export const metadata: Metadata = {
  title: { default: "OriaTheme", template: "%s · OriaTheme" },
  description: "A complete, validated theme system for React, Vue, and the web.",
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <style id="oria-default-theme">{defaultThemeCss}</style>
        <script id="oria-theme-bootstrap" dangerouslySetInnerHTML={{ __html: bootstrapScript }} />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
