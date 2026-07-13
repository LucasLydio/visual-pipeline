# Frontend Style Guide

This guide defines the base visual system for the project. It uses smooth tones, subtle borders, soft shadows, Montserrat typography, and a dark theme with balanced contrast.

## 1. Required font

Add these tags inside `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link
  href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
  rel="stylesheet"
>
<link rel="stylesheet" href="/assets/css/base-theme.css">
```

Do not use font sizes above `2rem`. The maximum heading size in this theme is below `2.1rem`.

## 2. Base palette

```css
--white: #ffffffff;
--cotton-rose: #f3babdff;
--graphite: #484349ff;
--snow: #f7f0f0ff;
--seagrass: #61988eff;
```

### Semantic use

| Token | Use |
|---|---|
| `--color-background` | Page background |
| `--color-surface` | Cards, forms, panels, header and footer |
| `--color-surface-soft` | Soft hover and secondary surfaces |
| `--color-text` | Headings and important text |
| `--color-text-muted` | Paragraphs and secondary text |
| `--color-primary` | Links, buttons, focus and active states |
| `--color-accent` | Decorative highlights |
| `--color-border` | Subtle borders |
| `--color-focus` | Keyboard focus ring |

Use semantic tokens in components instead of directly repeating hexadecimal colors.

## 3. Theme activation

Light theme is the default.

Dark theme:

```html
<html lang="en" data-theme="dark">
```

Theme toggle example:

```js
const root = document.documentElement;
const currentTheme = root.dataset.theme === "dark" ? "light" : "dark";

root.dataset.theme = currentTheme;
localStorage.setItem("theme", currentTheme);
```

Initial theme restoration:

```js
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark" || savedTheme === "light") {
  document.documentElement.dataset.theme = savedTheme;
}
```

## 4. Spacing tokens

### Padding

```css
--padding-sm: 0.5rem;
--padding-md: 1rem;
--padding-lg: 1.5rem;
--padding-xlg: 2rem;
```

### Gap

```css
--gap-sm: 0.5rem;
--gap-md: 1rem;
--gap-lg: 1.5rem;
--gap-xlg: 2rem;
```

Use `gap` for spacing between children. Avoid adding different margins to every child.

## 5. Border tokens

### Radius

```css
--border-sm: 0.375rem;
--border-md: 0.625rem;
--border-lg: 0.875rem;
--border-xlg: 1.25rem;
```

### Thickness

```css
--border-width-light: 1px;
--border-width-medium: 1.5px;
--border-width-dark: 2px;
```

Preferred usage:

- Inputs and buttons: `--border-md`
- Cards and panels: `--border-lg`
- Large modal or hero container: `--border-xlg`
- Default border thickness: `--border-width-light`

Use medium and dark borders only for strong visual separation.

## 6. Shadow tokens

```css
--shadow-sm: 0 2px 8px rgba(72, 67, 73, 0.06);
--shadow-md: 0 6px 18px rgba(72, 67, 73, 0.09);
--shadow-lg: 0 12px 30px rgba(72, 67, 73, 0.12);
--shadow-xlg: 0 20px 48px rgba(72, 67, 73, 0.16);
```

Preferred usage:

- `sm`: cards, inputs and default buttons
- `md`: hover states, dropdowns and menus
- `lg`: modals and floating panels
- `xlg`: rare use for important overlays

Do not combine strong shadows with thick borders.

## 7. Typography rules

- Font family: Montserrat.
- Default text: `1rem`.
- Small text: `0.875rem`.
- Large body text: `1.125rem`.
- Maximum heading size: `2rem`.
- Body line height: `1.6`.
- Heading line height: between `1.2` and `1.3`.
- Use weights `400`, `500`, `600`, and `700`.
- Avoid long paragraphs with bold text.
- Avoid uppercase except short labels and small headings.

## 8. Element rules

The base file styles these elements:

```text
html, head, title, meta, link, style, script, body, header, nav, main,
section, article, aside, footer, h1, h2, h3, h4, h5, h6, p, a, img,
div, span, ul, ol, li, table, thead, tbody, tr, th, td, form, label,
input, button, select, option, textarea, strong, em, br, hr
```

Important notes:

- `head`, `title`, `meta`, `link`, `style`, and `script` remain non-visual.
- `main` has a centered maximum width.
- `article` and `aside` use a soft card surface.
- Tables become horizontally scrollable on small screens.
- Inputs and buttons include visible keyboard focus.
- Images are responsive by default.

## 9. Component examples

### Card

```html
<article class="surface stack">
  <h3>Card title</h3>
  <p>Short supporting description.</p>
  <button type="button">Continue</button>
</article>
```

### Responsive grid

```html
<section class="grid gap-lg">
  <article class="surface">First item</article>
  <article class="surface">Second item</article>
  <article class="surface">Third item</article>
</section>
```

### Horizontal actions

```html
<div class="cluster gap-sm">
  <button type="button">Save</button>
  <a href="/">Cancel</a>
</div>
```

### Form

```html
<form>
  <div>
    <label for="name">Name</label>
    <input id="name" name="name" type="text" placeholder="Your name">
  </div>

  <div>
    <label for="category">Category</label>
    <select id="category" name="category">
      <option value="">Select an option</option>
    </select>
  </div>

  <div>
    <label for="message">Message</label>
    <textarea id="message" name="message"></textarea>
  </div>

  <button type="submit">Submit</button>
</form>
```

## 10. Utility classes

Available utility classes:

```text
surface
surface-accent
text-muted
text-primary

shadow-sm
shadow-md
shadow-lg
shadow-xlg

padding-sm
padding-md
padding-lg
padding-xlg

gap-sm
gap-md
gap-lg
gap-xlg

border-sm
border-md
border-lg
border-xlg

border-light
border-medium
border-dark

stack
cluster
grid
```

Use utility classes for simple layout and spacing. Create a component class when the same group of utilities appears repeatedly.

## 11. Accessibility rules

- Keep visible focus styles.
- Never remove `outline` without adding an equivalent focus indicator.
- Text and interactive controls must remain readable in both themes.
- Use labels connected to form fields with `for` and `id`.
- Buttons must describe actions.
- Links must describe destinations.
- Images that carry meaning must have useful `alt` text.
- Respect `prefers-reduced-motion`.
- Do not communicate state using only color.

## 12. Frontend implementation rules

1. Use CSS variables instead of repeated values.
2. Prefer `rem`, `%`, `min()`, `max()`, and `clamp()` over fixed pixels.
3. Keep shadows soft and borders thin.
4. Use `gap` for layout spacing.
5. Use `transform` and `opacity` for lightweight motion.
6. Keep transitions between `160ms` and `360ms`.
7. Avoid deep selectors and `!important`.
8. Keep one responsibility per component class.
9. Test light theme, dark theme, keyboard navigation, and mobile layout.
10. Avoid creating new colors unless the existing semantic palette cannot express the required state.

## 13. Complete CSS

The complete stylesheet is available in the accompanying `base-theme.css` file.

```css
/* Copy the content from base-theme.css into your project stylesheet. */
```
