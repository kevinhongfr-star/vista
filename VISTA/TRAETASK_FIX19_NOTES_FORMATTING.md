# FIX-19: Contact Notes Formatting

## Priority: Medium (UI polish, live site)
## Effort: 10-15 min
## Files: `app/contacts/[id]/ContactDetail.tsx`

## Problem
Notes on the contact detail page render as flat unformatted text. When agents (CARL, LENS) write structured notes with line breaks, bullet points, or markdown formatting, everything collapses into a single wall of text.

## Root Cause
Line ~370 in ContactDetail.tsx, the Notes tab renders:
```tsx
{note.description && (
  <p className="text-sm text-muted-foreground mt-2">
    {note.description}
  </p>
)}
```

This has three issues:
1. No `whitespace-pre-wrap` — line breaks (`\n`) collapse
2. No markdown rendering — `**bold**`, `- bullet`, `# header` show as raw text
3. No author display — `note.author` exists in DB but isn't shown

## Fix Required

### 1. Preserve whitespace + newlines
Change the `<p>` tag to preserve formatting:
```tsx
<p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap break-words">
  {note.description}
</p>
```

### 2. Show author
Add author attribution next to the date:
```tsx
<div className="flex items-center gap-2">
  <Badge variant="outline">{note.note_type}</Badge>
  {note.author && (
    <span className="text-xs text-muted-foreground">by {note.author}</span>
  )}
  <span className="text-xs text-muted-foreground">
    {note.created_at ? new Date(note.created_at).toLocaleDateString() : "-"}
  </span>
</div>
```

### 3. Visual differentiation by note_type
Add color coding for different note types:
```tsx
const noteTypeColors: Record<string, string> = {
  'insight': 'border-l-blue-500',
  'risk': 'border-l-red-500', 
  'action': 'border-l-green-500',
  'observation': 'border-l-amber-500',
  'strategy': 'border-l-purple-500',
};

// In the note card div:
<div
  key={note.note_id}
  className={`flex items-start gap-4 p-4 bg-muted/30 rounded-none border-l-4 ${noteTypeColors[note.note_type] || 'border-l-gray-300'}`}
>
```

## Verification
1. Navigate to any contact detail page → Notes tab
2. Notes with line breaks should display with proper spacing
3. Author name should appear between badge and date
4. Different note types should have colored left border

## Do NOT
- Do NOT add a full markdown parser library (overkill)
- Do NOT change the API — no backend changes needed
- Do NOT modify other tabs — only the Notes tab
