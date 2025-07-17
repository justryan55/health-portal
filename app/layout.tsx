"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import "./globals.css";
import { Keyboard, KeyboardResize } from "@capacitor/keyboard";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  useEffect(() => {
    async function setupStatusBar() {
      if (Capacitor.isNativePlatform()) {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: Style.Light });
      }
    }
    setupStatusBar();
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      Keyboard.setResizeMode({ mode: "native" as KeyboardResize });
    }
  }, []);

  return (
    <html lang="en">
      <body className={isNative ? "native-padding" : ""}>{children}</body>
    </html>
  );
}
