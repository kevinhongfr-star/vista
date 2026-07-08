# Next.js Configuration for APK Build

## Current State
The current `next.config.js` is configured for server-side rendering (SSR).

## For APK Build
Capacitor can work in two modes:

### Mode 1: Live URL (Recommended for VISTA)
App loads from Vercel URL - no changes needed to next.config.js
- Pros: Always up-to-date, smaller APK, no rebuild needed for content changes
- Cons: Requires internet connection

This is already configured in `capacitor.config.ts`:
```typescript
server: {
  url: 'https://vista-azure-delta.vercel.app',
  cleartext: true
}
```

### Mode 2: Static Export (Offline Support)
Bundle static files in APK - requires next.config.js changes:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Add this line
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // May need to add:
  images: {
    unoptimized: true, // Required for static export
  },
}

module.exports = nextConfig
```

**Limitations of static export:**
- API routes won't work (serverless functions)
- Dynamic routes need `generateStaticParams`
- Some middleware won't work
- Larger APK size

## Recommendation
Use **Mode 1 (Live URL)** for now. VISTA is a data-heavy app that benefits from real-time updates. Users will always see the latest version without app updates.
