export function simpleMarkdownToHtml(md: string): string {
  if (!md) return ""

  let html = md

  html = html.replace(/^###### (.*)$/gm, '<h6 class="text-sm font-semibold mt-3 mb-1">$1</h6>')
  html = html.replace(/^##### (.*)$/gm, '<h5 class="text-sm font-semibold mt-3 mb-1">$1</h5>')
  html = html.replace(/^#### (.*)$/gm, '<h4 class="text-base font-semibold mt-4 mb-2">$1</h4>')
  html = html.replace(/^### (.*)$/gm, '<h3 class="text-lg font-semibold mt-5 mb-2">$1</h3>')
  html = html.replace(/^## (.*)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3 text-accent-fuchsia">$1</h2>')
  html = html.replace(/^# (.*)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')

  html = html.replace(/^- (.*)$/gm, '<li class="ml-4">$1</li>')
  html = html.replace(/^\d+\. (.*)$/gm, '<li class="ml-4">$1</li>')

  html = html.replace(/(<li.*<\/li>\n?)+/g, (match) => {
    const items = match.trim()
    return `<ul class="list-disc space-y-1 my-3">${items}</ul>`
  })

  html = html.replace(/\n{2,}/g, '</p><p class="my-3">')
  html = '<p class="my-3">' + html + '</p>'
  html = html.replace(/<p class="my-3">\s*<\/p>/g, '')
  html = html.replace(/<p class="my-3">\s*(<h[1-6])/g, '$1')
  html = html.replace(/(<\/h[1-6]>)\s*<\/p>/g, '$1')
  html = html.replace(/<p class="my-3">\s*<ul/g, '<ul')
  html = html.replace(/<\/ul>\s*<\/p>/g, '</ul>')

  html = html.replace(/\n/g, ' ')

  return html
}

export function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }
  return Promise.resolve()
}
