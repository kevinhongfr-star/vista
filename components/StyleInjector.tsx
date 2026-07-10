"use client"

import { useEffect } from "react"

const CRITICAL_CSS = `
  /* VISTA BRAND RULES — injected at runtime to bypass CSS CDN cache */
  
  /* ZERO RADIUS — non-negotiable brand rule */
  *, *::before, *::after {
    border-radius: 0 !important;
  }
  
  /* Exceptions: avatars and badge pills */
  .avatar, [class*="avatar"], img.rounded-full, img[class*="rounded-full"] { 
    border-radius: 50% !important; 
  }
  .badge, .badge-pill, [class*="badge-pill"], [class*="rounded-full"][class*="h-"] { 
    border-radius: 9999px !important; 
  }

  /* Body — warm neutral background */
  body {
    background-color: #FAFAFA !important;
    font-family: var(--font-dm-sans, system-ui, sans-serif) !important;
  }

  /* Headings — serif font */
  h1, h2, h3, h4, h5, h6,
  [class*="font-heading"],
  .font-heading {
    font-family: var(--font-libre-baskerville, Georgia, serif) !important;
    color: #1A1A1A !important;
  }

  /* Table headers — premium uppercase */
  th, [role="columnheader"] {
    font-size: 10px !important;
    text-transform: uppercase !important;
    letter-spacing: 1.5px !important;
    color: #999 !important;
    font-family: var(--font-dm-sans, sans-serif) !important;
    font-weight: 600 !important;
  }

  /* Button specs — 44px min height, hover lift, zero radius */
  button, [role="button"], .btn, a[class*="btn"] {
    min-height: 44px !important;
    border-radius: 0 !important;
    transition: transform 0.15s ease, box-shadow 0.15s ease !important;
  }
  button:hover, [role="button"]:hover, .btn:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
  }
  button:active, [role="button"]:active, .btn:active {
    transform: translateY(0) !important;
  }

  /* VistaCard component styles */
  .bg-white[class*="border"][class*="shadow"] {
    box-shadow: 0 1px 3px rgba(0,0,0,0.08) !important;
    transition: transform 0.2s ease, box-shadow 0.2s ease !important;
  }
`

export function StyleInjector() {
  useEffect(() => {
    const existingStyle = document.getElementById('vista-brand-css')
    if (existingStyle) return

    const style = document.createElement('style')
    style.id = 'vista-brand-css'
    style.setAttribute('data-vista-brand', 'true')
    style.textContent = CRITICAL_CSS
    document.head.appendChild(style)
  }, [])

  return null
}
