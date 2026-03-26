"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Toaster position="top-right" reverseOrder={false} />
      {children}
    </SessionProvider>
  );
}
