import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VISTA - BD Intelligence",
  description: "Business Development Intelligence Dashboard for LYC Partners",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <body className={inter.className}>
        <div className="relative min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
          <Sidebar />
          <Header />
          <main className="ml-64 pt-16 min-h-screen transition-all duration-300">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}