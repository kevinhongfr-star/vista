import type { Metadata } from "next"
import { DM_Sans, Libre_Baskerville } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/layout/Sidebar"
import { ClientLayout } from "./client-layout"
import { StyleInjector } from "@/components/StyleInjector"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
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
      <body className={`${dmSans.variable} ${libreBaskerville.variable} font-sans`} style={{ backgroundColor: '#FAFAFA' }}>
        <StyleInjector />
        <div className="relative min-h-screen">
          <Sidebar />
          <ClientLayout>
            {children}
          </ClientLayout>
        </div>
      </body>
    </html>
  )
}
