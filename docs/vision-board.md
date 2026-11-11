# Editing the vision board

Edit `data/me/vision-board.md`. The board opens with Faith & Eternity and displays one 3D scene per entry in `items`. The `core` data is retained but is not displayed. The eight life areas have dedicated environments in `components/me/VisionEnvironments.jsx`; extra entries use the mountain overlook. Keep those environments aligned when reordering the life areas.

Titles, verses, descriptions, virtues, and nested `children` are rendered from the Markdown data. Details support `text`, `description`, `quote`, `quoteAuthor`, `image`, and `alt`. Add a `Vi` suffix for Vietnamese translations. Core virtues use `virtues` for Vietnamese and `virtuesEn` for English.

Scenes scroll horizontally only. Click or tap the 3D artwork to advance to the next vision (the last loops to the first); Enter or Space does the same when the artwork has keyboard focus. Swiping does not trigger an extra advance. Scroll sideways or swipe left or right. The scrollbar and navigation footer are hidden. When the scene region has keyboard focus, Left / Right arrow keys and Page Up / Page Down navigate scenes. A vertical mouse wheel also moves scenes horizontally. Supporting details scroll independently when needed.

The scenes use Three.js through React Three Fiber, with volumetric objects, perspective cameras at eye level, lit materials, and cast shadows. `ThreeVisionRenderer.jsx` shares one WebGL canvas across the visible scene windows. Each scene has an entrance camera movement and ambient animation, including rotating crystals, drifting clouds, flickering lights, and music bars. Pointer movement gently adjusts the view.

There is no animation toggle. Reduced-motion preferences keep ambient motion and camera drift paused, and animation stops when the board is offscreen or the tab is hidden. Navigation remains usable while paused. If WebGL is unavailable, the descriptions and navigation remain available with a rendering notice.





Each environment includes a low-poly chibi character with swept faceted brown hair, large brown eyes, a brown jacket, and small boots inspired by the supplied character reference. Move the mouse over the artwork to turn the character's head. Click or tap the character to wave; clicks elsewhere advance the scene. Press H while the scene area is focused to wave using the keyboard. Reduced-motion mode uses a static greeting pose instead of a repeated wave.

