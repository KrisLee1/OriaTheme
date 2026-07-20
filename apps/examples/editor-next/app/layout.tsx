import type { ReactNode } from "react";
import "@oriatheme/colors/styles.css";
import "./styles.css";
import { Providers } from "./providers";

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return <html lang="en"><body><Providers>{children}</Providers></body></html>;
}
