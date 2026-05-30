import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { LanguageProvider } from "@/components/layout/LanguageProvider";
import Header from "@/components/layout/Header";
import Breadcrumb from "@/components/layout/Breadcrumb";

export const metadata: Metadata = {
  title: "Dig Vault",
  description: "Thrift store dig judgment app + closet management app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <ThemeProvider>
          <LanguageProvider>
            <Header />
            <Breadcrumb />
            <main>{children}</main>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
