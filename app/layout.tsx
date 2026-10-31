import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/cormorant-garamond";
import "@fontsource-variable/cormorant-garamond/wght-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: "DECUCARE — Нежна грижа за вашата кожа",
  description:
    "Открийте DECUCARE: регенериращ и възстановяващ крем, 150 мл, за специална грижа при чувствителна, раздразнена или увредена кожа. Работен преглед с активна форма за заявки.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "DECUCARE — Нежна грижа за вашата кожа",
    description:
      "Вашият ежедневен ритуал за грижа. Разгледайте продукта, съставките и начина на употреба.",
    locale: "bg_BG",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fcfafc",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  );
}
