---
title: "React Core Concepts"
date: 2026-04-11
tags: [react, frontend]
---

> React is full of fancy terms — reconciliation, composition, error boundaries. Here's what they all actually mean, from first principles.

## Components

Components are the building blocks of every React app. They represent all visible parts of an application — buttons, inputs, entire pages. Like Lego bricks, you can reuse them as many times as you want.

Every React component is a **JavaScript function that returns markup**.

---

## JSX

React components don't return HTML — they return **JSX**, which is JavaScript in disguise. JSX is optional (the alternative is `React.createElement()`), but everyone uses JSX because the alternative gets tedious fast.

Since JSX is JavaScript, attributes follow **camelCase** naming instead of HTML conventions:

```jsx
// HTML
<div class="container">

// JSX
<div className="container">
```

---

## Curly Braces

Unlike static HTML, JSX lets you embed dynamic JavaScript values using **curly braces**:

```jsx
const name = "Alice";

// Display a value
<h1>{name}</h1>

// Dynamic attribute
<img src={avatarUrl} />

// Inline styles (note: double curly braces — outer for JSX, inner for the object)
<div style={{ color: 'red', fontSize: 16 }}>Hello</div>
```

---

## Fragments

JavaScript functions can only return one value, so a React component can only return **one parent element**. To avoid adding unnecessary wrapper `<div>`s to the DOM, use a **React Fragment**:

```jsx
// This throws an error
return (
  <h1>Title</h1>
  <p>Paragraph</p>
);

// This works — Fragment adds no real DOM element
return (
  <>
    <h1>Title</h1>
    <p>Paragraph</p>
  </>
);
```

---

## Props

Props (short for properties) are how you **pass data into a component**. Define a prop by adding a named attribute on a component, then access it from the function's parameter object:

```jsx
// Passing a prop
<UserCard name="Alice" age={30} />

// Receiving props
function UserCard({ name, age }) {
  return <p>{name} is {age} years old</p>;
}
```

Think of props like custom attributes you can add to any component.

---

## Children

You can pass **components as props** using the special `children` prop. Any content placed between a component's opening and closing tags becomes `children`:

```jsx
function Card({ children }) {
  return <div className="card">{children}</div>;
}

// Usage
<Card>
  <h2>Title</h2>
  <p>Some content inside the card</p>
</Card>
```

This pattern is fundamental to **composition** — organizing components in the most optimal, reusable way. It's especially useful for layout components.

---

## Keys

The `key` prop is a built-in React prop used when rendering lists. It helps React tell one list item apart from another:

```jsx
const items = ['Apple', 'Banana', 'Cherry'];

items.map((item, index) => (
  <li key={index}>{item}</li>
));
```

A key should be a unique string or number. React will warn you in the console if you forget one. If no unique value exists, the map index works as a fallback.

---

## Rendering

Rendering is how React turns your code into something visible in the browser. React manages this through the **Virtual DOM (vDOM)**:

1. App state changes
2. React updates the **virtual DOM** (a lightweight in-memory representation — faster to update than the real DOM)
3. React runs **diffing** — comparing the new virtual DOM to the previous snapshot to find what changed
4. React runs **reconciliation** — applying only those changes to the real DOM

This process is what makes React efficient. The risk: triggering infinite re-renders by updating state inside a render cycle, which crashes your app.

---

## Event Handling

React has built-in event props for common browser events. The most-used ones:

| Prop | Fires when... |
|---|---|
| `onClick` | User clicks an element |
| `onChange` | Input value changes |
| `onSubmit` | Form is submitted |

```jsx
function AlertButton() {
  function handleClick() {
    alert('Button clicked!');
  }

  return <button onClick={handleClick}>Click me</button>;
}
```

---

## State

State is a **snapshot of your app at any given moment**. Regular JavaScript variables don't work for state because changing them doesn't trigger a re-render. React provides special hooks for this:

```jsx
import { useState } from 'react';

function LikeButton() {
  const [likes, setLikes] = useState(0); // 0 is the initial value

  return (
    <button onClick={() => setLikes(likes + 1)}>
      Likes: {likes}
    </button>
  );
}
```

`useState` returns an array: the **state variable** and an **updater function**.

---

## Controlled Components

A controlled component uses `useState` to manage an input's value, giving you full control over its behavior:

```jsx
function ControlledInput() {
  const [value, setValue] = useState('');

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

**Flow:** user types → `setValue` updates state → state updates → input reflects new state.

The benefit: to change the component's behavior, you only need to change the state that controls it.

---

## Hooks

Hooks let you "hook into" React features like state from inside function components. There are five categories:

| Category | Hooks | Purpose |
|---|---|---|
| **State** | `useState`, `useReducer` | Manage component state |
| **Context** | `useContext` | Read data from React context |
| **Ref** | `useRef` | Reference DOM elements directly |
| **Effect** | `useEffect` | Connect to external systems and APIs |
| **Performance** | `useMemo`, `useCallback` | Prevent unnecessary work |

In practice, you'll use `useState`, `useEffect`, and `useRef` the vast majority of the time.

---

## Purity

React components should be **pure functions** — given the same input (props), they should always return the same output (JSX). A pure component:

- Only returns JSX
- Does not modify variables or objects that exist outside the component during render

```jsx
// Impure — mutates an external variable during render
let count = 0;
function ImpureComponent() {
  count += 1; // side effect during render
  return <p>{count}</p>;
}

// Pure — no external mutation
function PureComponent({ count }) {
  return <p>{count}</p>;
}
```

---

## Strict Mode

Strict Mode is a special wrapper component that surfaces mistakes during development. Wrap it around your app to get warnings when you're doing something you shouldn't:

```jsx
<StrictMode>
  <App />
</StrictMode>
```

It has no effect in production — it's a development tool only.

---

## Effects

Effects are code that **reaches outside of React** — things like browser API calls or server requests. They're called "side effects" because they happen alongside rendering, not as part of it.

If possible, run effects inside **event handlers** (e.g., an HTTP request on form submit). When that's not possible — like fetching data when a component first loads — use the `useEffect` hook:

```jsx
useEffect(() => {
  fetch('/api/user')
    .then(res => res.json())
    .then(data => setUser(data));
}, []); // empty array = run once on mount
```

---

## Refs

Refs let you **directly reference a real DOM element**, stepping outside of React's managed rendering. Created with `useRef` and attached via the `ref` prop:

```jsx
function FocusInput() {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current.focus(); // directly manipulates the DOM
  }

  return (
    <>
      <input ref={inputRef} />
      <button onClick={handleClick}>Focus</button>
    </>
  );
}
```

Useful for tasks like focusing inputs, measuring element dimensions, or integrating with third-party DOM libraries.

---

## Context

Context solves **prop drilling** — the problem of passing the same data through many nested components that don't actually need it. Context lets you jump through the component tree and access data at any level:

```jsx
// 1. Create context
const ThemeContext = createContext();

// 2. Wrap with provider and supply data
<ThemeContext.Provider value="dark">
  <App />
</ThemeContext.Provider>

// 3. Consume anywhere in the tree
function DeepChild() {
  const theme = useContext(ThemeContext);
  return <div className={theme}>Hello</div>;
}
```

---

## Portals

Portals let you **render a React component into any DOM element you choose**, outside of its parent component's DOM node. This is useful when a parent's CSS (like `overflow: hidden`) would clip or break a child component:

```jsx
import { createPortal } from 'react-dom';

function Modal({ children }) {
  return createPortal(
    <div className="modal">{children}</div>,
    document.getElementById('modal-root') // render here instead
  );
}
```

Common use cases: modals, dropdown menus, tooltips.

---

## Suspense

Suspense is a special component that handles the **loading state** of a component or its data. Instead of showing nothing while data fetches, it shows a fallback:

```jsx
<Suspense fallback={<LoadingSpinner />}>
  <SlowDataComponent />
</Suspense>
```

Also useful for **lazy loading** — deferring the loading of a component until it's actually needed:

```jsx
const HeavyChart = lazy(() => import('./HeavyChart'));

<Suspense fallback={<p>Loading chart...</p>}>
  <HeavyChart />
</Suspense>
```

---

## Error Boundaries

Since React apps are JavaScript, errors during rendering can crash the entire app. **Error boundaries** are components that catch these errors and show a fallback UI instead:

```jsx
<ErrorBoundary fallback={<p>Something went wrong.</p>}>
  <ComponentThatMightCrash />
</ErrorBoundary>
```

Without an error boundary, a single rendering error takes down the whole app. With one, you can isolate failures and show the user a helpful message instead of a blank screen.

---

## How It All Connects

```
Components          →  the building blocks
  └─ JSX            →  what they return
  └─ Props          →  how data flows in
  └─ Children       →  composition pattern
  └─ Keys           →  list identity

State               →  the snapshot of your app
  └─ useState       →  simple state
  └─ useReducer     →  complex state logic
  └─ Controlled     →  state-driven inputs

Rendering           →  how state becomes UI
  └─ Virtual DOM    →  fast in-memory model
  └─ Diffing        →  find what changed
  └─ Reconciliation →  update the real DOM

Escaping React      →  when you need the outside world
  └─ Effects        →  external system side effects
  └─ Refs           →  direct DOM access
  └─ Portals        →  render outside the tree

Data flow           →  moving data around the app
  └─ Props          →  parent → child
  └─ Context        →  any level, no drilling

Safety              →  protecting your app
  └─ Purity         →  predictable components
  └─ Strict Mode    →  dev-time warnings
  └─ Error Boundaries → graceful failure
  └─ Suspense       →  graceful loading
```
