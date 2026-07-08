import type { Metadata } from "next"
import { DM_Sans, Libre_Baskerville } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/layout/Sidebar"
import { ClientLayout } from "./client-layout"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
})

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre-baskerville",
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
        <div className="relative min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
          <Sidebar />
          <ClientLayout>
            {children}
          </ClientLayout>
        </div>
      </body>
    </html>
  )
}
