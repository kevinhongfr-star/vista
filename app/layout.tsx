import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { Sidebar } from "@/components/layout/Sidebar"
import { ClientLayout } from "./client-layout"

// Self-hosted fonts — NO Google CDN
const dmSans = localFont({
  src: [
    {
      path: "../public/fonts/DMSans-Variable.ttf",
      weight: "400 700",
      style: "normal",
    },
  ],
  variable: "--font-dm-sans",
  display: "swap",
})

const libreBaskerville = localFont({
  src: [
    {
      path: "../public/fonts/LibreBaskerville-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/LibreBaskerville-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/LibreBaskerville-Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-libre-baskerville",
  display: "swap",
})

export const metadata: Metadata = {
  title: "LYC Partners — VISTA BD Intelligence",
  description: "Business Development Intelligence Dashboard for LYC Partners",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <body className={`${dmSans.variable} ${libreBaskerville.variable} font-sans`}>
        <div className="relative min-h-screen bg-bg border-t-[3px] border-accent">
          <Sidebar />
          <ClientLayout>
            {children}
          </ClientLayout>
        </div>
      </body>
    </html>
  )
}
