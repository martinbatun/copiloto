import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Copiloto Agent · Admin",
  description: "Inbox y configuracion del agente conversacional WhatsApp.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
