import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Shiply - AI Changelog Generator",
  description:
    "Generate polished public changelogs from GitHub commits with AI-assisted release writing.",
};

const themeScript = `
(() => {
  try {
    const storedTheme = localStorage.getItem("theme");
    const cookieTheme = document.cookie.match(/(?:^|; )theme=(dark|light)(?:;|$)/)?.[1];
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = storedTheme === "dark" || cookieTheme === "dark" || (!storedTheme && !cookieTheme && prefersDark) ? "dark" : "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased transition-colors`}
      >
        {children}
      </body>
    </html>
  );
}
