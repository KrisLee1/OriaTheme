import type { ReactNode } from "react";
import { createBootstrapStorageScript } from "@oriatheme/runtime-dom";
import "@oriatheme/colors/styles.css";
import "../../styles.css";
import { defaultThemeCss } from "./default-theme-style";
import { Providers } from "./providers";

const bootstrapScript = createBootstrapStorageScript({ contract: { name: "oria-standard", version: 2 } });

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return <html lang="en" suppressHydrationWarning><head><style id="oria-default-theme">{defaultThemeCss}</style><script id="oria-theme-bootstrap" dangerouslySetInnerHTML={{ __html: bootstrapScript }} /></head><body><Providers>{children}</Providers></body></html>;
}
