---
title: "DumbPhobia#018: Web Content Accessibility Guidelines 2.2"
date: 2026-09-07
tags: [system-design]
image: /assets/post-covers/wcag.png
author:
  name: An Doan
  link: https://anddoanf.github.io/
---

**WCAG — Web Content Accessibility Guidelines** is the W3C standard for making websites and web applications accessible to users with disabilities.

It is built around four principles, commonly remembered as **POUR**:

* **Perceivable** — users can receive the information.
* **Operable** — users can interact with the interface.
* **Understandable** — users can understand content and behavior.
* **Robust** — browsers and assistive technologies can interpret the application reliably.

WCAG defines three conformance levels:

| Level   | Meaning                            |
| ------- | ---------------------------------- |
| **A**   | Minimum accessibility requirements |
| **AA**  | Common production target           |
| **AAA** | Highest WCAG conformance level     |

The levels are cumulative. To meet **WCAG 2.2 AAA**, a product must satisfy all applicable **A + AA + AAA** success criteria.

AAA should not be seen as simply “AA with better contrast.” It includes stronger requirements for readability, multimedia, focus, authentication, navigation, timing, error prevention, and cognitive accessibility.

---

## 1. Perceivable

Content must be available in forms users can perceive.

### Text alternatives

Meaningful images need useful alternative text:

```html
<img
  src="chart.png"
  alt="Revenue increased from $1.2M in Q1 to $1.8M in Q4."
>
```

Decorative images should normally use:

```html
<img src="divider.svg" alt="">
```

The goal is to communicate the **meaning**, not merely say “image” or “graphic.”

### Multimedia

Depending on the content and conformance level, provide:

* Captions
* Transcripts
* Audio descriptions
* Extended audio descriptions
* Sign-language interpretation
* Equivalent text alternatives

Important visual information in a video should not be available only visually.

### Semantic structure

Content should remain understandable when presented differently. Use semantic HTML rather than styling generic `<div>` elements to look like headings:

```html
<main>
  <h1>Products</h1>

  <section>
    <h2>Laptops</h2>
  </section>
</main>
```

Use proper headings, lists, tables, landmarks, labels, and form controls to preserve that structure.

### Contrast

For text, WCAG AAA generally requires:

| Text        |    AA |   AAA |
| ----------- | ----: | ----: |
| Normal text | 4.5:1 |   7:1 |
| Large text  |   3:1 | 4.5:1 |

Important UI components and graphics also need sufficient contrast. Never rely on color alone: explicit labels such as the following are better than only red and green states.

```text
✕ Invalid email
✓ Valid email
```

### Zoom and reflow

The application should remain usable when users zoom to 200%, 300%, or 400%. Avoid rigid layouts such as:

```css
.page {
  width: 1440px;
}
```

Prefer responsive sizing:

```css
.page {
  width: min(100% - 2rem, 1200px);
  margin-inline: auto;
}
```

---

## 2. Operable

All functionality should work without requiring a mouse.

### Keyboard accessibility

Interactive controls should support keyboard operation. Prefer a native button:

```html
<button>Save</button>
```

instead of:

```html
<div onclick="save()">Save</div>
```

Keyboard users commonly rely on `Tab`, `Shift + Tab`, `Enter`, `Space`, `Escape`, and the arrow keys, depending on the component.

### No keyboard traps

Users must be able to enter and leave interactive components. Common problem areas include modals, dropdowns, date pickers, editors, carousels, and embedded content.

### Focus order

Focus should follow a logical sequence:

```text
Name
↓
Email
↓
Password
↓
Submit
```

Avoid manually rearranging focus with positive values such as:

```html
tabindex="5"
```

### Visible focus

Users need to know where keyboard focus is.

```css
:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 3px;
}
```

Avoid globally removing focus outlines without a clear replacement. WCAG 2.2 added stronger focus requirements, including **Focus Not Obscured** and **Focus Appearance**. Sticky headers, cookie banners, fixed footers, or floating widgets must not hide the focused element.

### Navigation

Provide predictable ways to move through the application:

* Descriptive page titles
* Logical headings
* Clear link text
* Consistent navigation
* Skip links
* Breadcrumbs where useful
* Multiple ways to locate content on larger sites

Example skip link:

```html
<a href="#main">Skip to main content</a>

<main id="main">
  ...
</main>
```

Avoid vague links such as ?Click here,? ?Read more,? or ?More.? Prefer descriptive text such as ?Read the accessibility report? or ?View security settings.?

### Target size

Controls should be large and spaced enough to activate reliably. This helps users with limited dexterity or tremors, as well as those using touch devices, styluses, or alternative pointing devices.

### Dragging alternatives

If an interface supports:

```text
Drag task → Done
```

also provide another mechanism:

```text
Move to:
[Done ▼]
```

Dragging should not be the only way to complete an action unless it is essential.

### Motion

If device motion triggers an action, provide another control:

```html
<button>Undo</button>
```

### Timing

Users may need more time to read or complete tasks. Where time limits are not essential, remove them. Otherwise provide mechanisms such as:

```text
Session expires in 2 minutes.

[Extend session]
```

### Flashing and animation

Avoid harmful flashing and unnecessary motion. Support reduced-motion preferences where appropriate:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    scroll-behavior: auto;
  }
}
```

---

## 3. Understandable

Users should understand both the content and the way the interface behaves.

### Language

Declare the page language:

```html
<html lang="en">
```

Use language changes when needed:

```html
<span lang="ja">こんにちは</span>
```

This helps screen readers pronounce content correctly.

### Readability

AAA places stronger emphasis on understandable text. Good practices include:

* Clear headings
* Short paragraphs
* Defined abbreviations
* Familiar terminology
* Reasonable line length
* Sufficient line spacing
* Avoiding unnecessary jargon

For example, write ?Web Content Accessibility Guidelines (WCAG)? on first use instead of assuming every reader already knows the abbreviation.

### Predictability

Interfaces should behave consistently. Navigation should not unexpectedly change order between pages, and form controls should not trigger surprising actions.

### Consistent help

WCAG 2.2 introduced **Consistent Help**. Repeated support mechanisms such as contact support, FAQ, chat, and a help center should appear consistently across pages.

---

### Forms and Validation

Forms are one of the most common accessibility failure points.

#### Labels

Use real labels:

```html
<label for="email">Email</label>
<input id="email" type="email">
```

Do not rely on placeholders as the only label.

#### Instructions

Give users requirements before they fail.

```text
Password must contain:
- 12 characters
- one number
- one special character
```

#### Error messages

Bad:

```text
Invalid input.
```

Better:

```text
Email address is invalid.
Enter an address such as name@example.com.
```

A good error explains what went wrong, where the problem occurred, and how the user can fix it. Associate errors programmatically with the relevant field:

```html
<input
  id="email"
  aria-invalid="true"
  aria-describedby="email-error"
>

<p id="email-error">
  Enter a valid email address.
</p>
```

#### Error prevention

Important actions should support review or correction, especially for payments, legal submissions, account deletion, and data deletion. Possible safeguards include reviewing or editing before final submission, confirmation, and undo.

#### Redundant entry

WCAG 2.2 discourages unnecessarily requesting the same information twice. Instead of asking users to retype an address, offer an option such as:

```text
☑ Billing address is the same as shipping address
```

#### Accessible authentication

Authentication should work with password managers, copy and paste, and autofill. Avoid blocking paste:

```javascript
passwordInput.onpaste = e => e.preventDefault();
```

AAA places even stronger requirements on avoiding unnecessary cognitive-function tests during authentication.

---

## 4. Robust

Accessible interfaces must expose correct information to assistive technologies.

### Semantic HTML first

Prefer native controls:

```html
<button>Delete</button>
```

over recreating them:

```html
<div role="button" tabindex="0">
  Delete
</div>
```

The native control already provides keyboard behavior, focus, semantics, activation, and accessibility API support.

### Accessibility tree

Conceptually:

```text
HTML
 ↓
DOM
 ↓
Accessibility Tree
 ↓
Screen Reader
```

For:

```html
<button aria-label="Close dialog">
  <svg aria-hidden="true">...</svg>
</button>
```

assistive technology should receive something similar to:

```text
Role: button
Name: Close dialog
```

### Accessible names

Every interactive control needs a meaningful accessible name. For icon-only buttons, provide a label:

```html
<button aria-label="Search">
  <svg aria-hidden="true">...</svg>
</button>
```

### ARIA

ARIA can expose additional roles, states, properties, and relationships. For example:

```html
<button
  aria-expanded="false"
  aria-controls="menu"
>
  Menu
</button>
```

> Use native HTML whenever possible. Use ARIA when HTML alone is insufficient.

ARIA changes semantics, but it does not automatically implement keyboard behavior or component logic.

### Hidden content

`display: none;` normally removes content visually and from the accessibility tree. If content should be visually hidden but still announced, use an `sr-only` technique instead.

### Dynamic content

Modern applications often update without page reloads. Important updates may need live regions:

```html
<div aria-live="polite">
  Profile saved successfully.
</div>
```

Urgent errors may use:

```html
<div role="alert">
  Payment failed.
</div>
```

Do not overuse announcements or the interface becomes noisy.

### Dialogs

Accessible dialogs should generally:

1. Receive focus when opened.
2. Have an accessible name.
3. Prevent accidental background interaction.
4. Support keyboard closing.
5. Restore focus when closed.

Native `<dialog>` can simplify part of this behavior.

### Custom widgets

Components such as tabs, menus, comboboxes, listboxes, grids, trees, and sliders should follow established keyboard interaction patterns instead of inventing custom behavior.

---

## WCAG 2.2 AAA Checklist

A practical AAA review should cover all applicable A, AA, and AAA criteria.

**Content**

* Meaningful images have useful alt text.
* Decorative images are ignored by assistive technology.
* Heading structure is logical.
* Page titles are descriptive.
* Page and inline languages are declared.
* Abbreviations and difficult terminology are explained.
* Long-form content remains readable.

**Visual Design**

* AAA text contrast targets are met where required.
* UI components remain distinguishable.
* Information does not depend on color alone.
* Focus indicators are clearly visible.
* Focus is not obscured by floating or sticky UI.
* Content remains usable at high zoom.
* Layout reflows correctly.

**Keyboard**

* All functionality works without a mouse.
* Focus order is logical.
* No keyboard traps exist.
* Dialogs manage focus correctly.
* Custom widgets follow established keyboard patterns.
* Skip navigation is available where useful.

**Forms**

* Inputs have accessible labels.
* Required fields are clearly identified.
* Instructions appear before errors.
* Errors explain how to recover.
* Errors are programmatically connected to fields.
* Important actions can be reviewed or corrected.
* Previously entered data is reused where possible.

**Authentication**

* Password managers work.
* Copy and paste are allowed.
* Autofill works.
* Authentication avoids unnecessary cognitive tests.
* Accessible alternatives exist where required.

**Media**

* Captions are available.
* Audio descriptions are provided when required.
* Transcripts are available where appropriate.
* AAA media requirements such as sign-language interpretation are reviewed where applicable.

**Motion and Timing**

* Flashing content stays within safety limits.
* Reduced-motion preferences are respected.
* Moving content can be paused where necessary.
* Time limits are removable or extendable where required.
* Motion-based actions have alternatives.

**Navigation**

* Navigation is consistent.
* Help appears consistently.
* Link purpose is clear.
* Multiple navigation methods exist where applicable.
* Users can determine their current location.

**Pointer Interaction**

* Targets are sufficiently large.
* Controls are adequately spaced.
* Dragging has an alternative.
* Precision gestures are not unnecessarily required.

**Semantics and ARIA**

* Native HTML is used first.
* Interactive controls have correct roles.
* Controls have meaningful accessible names.
* ARIA states stay synchronized with UI state.
* Dynamic messages are announced appropriately.
* Decorative content is hidden from assistive technology where necessary.
