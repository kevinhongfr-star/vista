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
      <body className={`${dmSans.variable} ${libreBaskerville.variable} font-sans`} style={{ backgroundColor: '#FAFAFA', borderTop: '4px solid #C108AB' }}>
    <style>
      /* === CRITICAL BRAND CSS — INLINE TO BYPASS CDN CACHE === */
      *, *::before, *::after { border-radius: 0 !important; }
      .avatar, [class*="avatar"], img.rounded-full { border-radius: 50% !important; }
      .badge, .badge-pill, [class*="badge-pill"] { border-radius: 9999px !important; }
      body { background-color: #FAFAFA !important; color: #1A1A1A !important; }
      h1, h2, h3, h4, h5, h6 { font-family: var(--font-libre-baskerville), Georgia, serif !important; color: #1A1A1A !important; }
      th, [role="columnheader"] { font-size: 10px !important; text-transform: uppercase !important; letter-spacing: 1.5px !important; color: #999 !important; font-family: var(--font-dm-sans), sans-serif !important; font-weight: 600 !important; }
      button, [role="button"], .btn { min-height: 44px !important; border-radius: 0 !important; transition: transform 0.15s ease, box-shadow 0.15s ease !important; }
      button:hover, [role="button"]:hover, .btn:hover { transform: translateY(-1px) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important; }
    </style>

        {/* INLINE PROOF: If you see fuchsia top border + warm bg, deployment is working */}
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
