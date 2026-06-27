import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReadCode — Professor de Código",
  description:
    "Analise qualquer projeto de software. Entenda regras de negócio, código morto, testes e cada linha de código.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
