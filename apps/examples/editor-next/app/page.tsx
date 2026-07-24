"use client";

import { oriaDefaultTheme } from "@oriatheme/core";
import { useOriaTheme } from "@oriatheme/react";
import { ThemeEditor } from "./components/oria-theme-editor";

export default function Home() {
  const { runtime } = useOriaTheme();

  return <ThemeEditor runtime={runtime} options={{ source: oriaDefaultTheme, identity: { id: "oria-default-demo", name: "Default demo" } }} />;
}
