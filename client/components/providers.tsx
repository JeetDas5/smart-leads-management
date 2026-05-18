import * as React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./theme-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <TooltipProvider>{children}</TooltipProvider>
    </ThemeProvider>
  );
}
