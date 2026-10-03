# Editing the vision board

Edit `data/me/vision-board.md`. The YAML frontmatter defines `core` (the center card) and `items` (its surrounding branches). Each card can have a `children` list, nested as many levels as needed.

All content fields are optional: use `image`, `quote`, and `text` independently or together. `description` is also supported as a fallback for `text`. Optional fields include `title`, `alt`, `quoteAuthor`, and `color`. Add a `Vi` suffix for Vietnamese translations, including nested cards. Images use paths relative to `public`, or HTTPS URLs.

```yaml
core:
  title: My core value
  text: What matters most to me.
items:
  - title: A supporting goal
    color: "#268bd2"
    image: /assets/post-covers/aesthetic.jpg
    alt: A quiet still life
    quote: A reminder to return to.
    text: A practical direction to pursue.
    children:
      - text: A smaller step.
        textVi: Một bước nhỏ hơn.
        children:
          - quote: An everyday reminder.
```

Drag the background to pan; use pinch gestures or the zoom controls to zoom. The fit-view control returns to the whole board. Cards can be dragged; positions are temporary and reset when the board reloads or its language changes. Content is authored in Markdown, not edited through the canvas. Long cards scroll internally.

The layout packs cards near their parents with collision checks. The board opens centered on the core at a readable zoom; use fit-view to see every branch at once.

Run `node --test scripts/vision-graph.test.mjs` to check the data and layout.
