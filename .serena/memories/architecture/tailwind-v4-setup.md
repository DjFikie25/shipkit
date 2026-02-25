# Tailwind CSS v4 Setup (Next.js)

## Required files
Tailwind v4 works fundamentally differently from v3. Two files are essential:

### 1. `apps/web/postcss.config.mjs` (REQUIRED — easy to miss)
Without this file, Tailwind v4 does NOT process CSS. There is no `tailwind.config.js` in v4.
```js
const config = { plugins: { '@tailwindcss/postcss': {} } };
export default config;
```

### 2. `apps/web/src/app/globals.css`
Replace the old `@tailwind base/components/utilities` directives with a single import:
```css
@import "tailwindcss";

/* Wire custom fonts into the Tailwind theme */
@theme {
  --font-sans: var(--font-geist), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;
  --color-primary: #0070f3;
}

/* Focus rings */
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

## Custom fonts with `@theme`
In Tailwind v4, custom font families MUST be wired via CSS `@theme` block — there is no `tailwind.config.js` `theme.extend.fontFamily`. If you skip this, `font-sans` / `font-mono` classes won't use your custom fonts even if the CSS variable is defined.

## Devdependencies needed
```json
{
  "@tailwindcss/postcss": "^4.x",
  "tailwindcss": "^4.x",
  "postcss": "^8.x"
}
```

## NativeWind (mobile)
Mobile uses NativeWind v4, which still requires `tailwind.config.js` (different from web v4):
```js
// apps/mobile/tailwind.config.js
module.exports = { content: ['./app/**/*.tsx', './components/**/*.tsx'], presets: [require('nativewind/preset')] };
```
And `babel.config.js` must include `nativewind/babel` preset.

## Common symptoms of missing postcss.config.mjs
- Tailwind classes render with no styles (unstyled HTML)
- No build errors, just missing styles
- Adding the file and restarting dev server fixes it immediately
