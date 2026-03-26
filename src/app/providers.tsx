"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SessionProvider>
        <TooltipProvider>
          <Toaster position="top-right" reverseOrder={false} />
          {children}
        </TooltipProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
