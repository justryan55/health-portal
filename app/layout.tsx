"use client";

import { useEffect, useState } from "react";
import { Capacitor, PluginListenerHandle } from "@capacitor/core";
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
      Keyboard.setResizeMode({ mode: "body" as KeyboardResize });
    }
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let showListener: PluginListenerHandle | undefined;
    let hideListener: PluginListenerHandle | undefined;
    let isCancelled = false;

    const addListeners = async () => {
      if (isCancelled) return;

      showListener = await Keyboard.addListener("keyboardWillShow", (info) => {
        document.body.style.paddingBottom = `${info.keyboardHeight}px`;
      });

      hideListener = await Keyboard.addListener("keyboardWillHide", () => {
        document.body.style.paddingBottom = "0px";
      });
    };

    addListeners();

    return () => {
      isCancelled = true;
      showListener?.remove();
      hideListener?.remove();
    };
  }, []);

  return (
    <html lang="en">
      <body className={isNative ? "native-padding" : ""}>{children}</body>
    </html>
  );
}
