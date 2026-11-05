import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oshkon — бронирование столиков",
  description: "Выберите ресторан, столик и любимые блюда заранее"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
