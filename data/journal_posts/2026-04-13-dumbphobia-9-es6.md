---
title: "DumbPhobia#9 ECMAScript 6"
date: 2026-04-13
tags: [frontend]
---

> ES6 (ECMAScript 2015) and its successors transformed JavaScript from a scripting language into a serious engineering platform. These aren't just syntax shortcuts — each feature solves a specific class of problem that plagued JavaScript developers for years.

## What is ES6?

ES6, officially called **ECMAScript 2015**, was the largest single update to JavaScript in its history. Released in June 2015, it introduced over 20 major features. Since then, ECMAScript has released yearly updates (ES2016 through ES2024), each adding more capabilities.

This guide covers the most important features across all versions — the ones you'll use daily and encounter in every senior frontend interview.

| Era | Version | Key additions |
|---|---|---|
| **ES6** | ES2015 | `let`/`const`, arrow functions, classes, modules, destructuring, spread, template literals, promises, symbols, iterators |
| **ES7** | ES2016 | `Array.prototype.includes`, exponentiation operator `**` |
| **ES8** | ES2017 | `async`/`await`, `Object.entries`, `Object.values`, `String.padStart/padEnd` |
| **ES9** | ES2018 | Rest/spread for objects, `Promise.finally`, async iteration |
| **ES10** | ES2019 | `Array.flat`, `Array.flatMap`, `Object.fromEntries`, optional catch binding |
| **ES11** | ES2020 | Optional chaining `?.`, nullish coalescing `??`, `Promise.allSettled`, `BigInt`, `globalThis` |
| **ES12** | ES2021 | `Promise.any`, logical assignment `&&=` `||=` `??=`, `String.replaceAll` |
| **ES13** | ES2022 | Top-level `await`, class fields, `Array.at()`, `Object.hasOwn` |
| **ES14** | ES2023 | `Array.toSorted`, `Array.toReversed`, `Array.findLast` |

---

## 1. `let` and `const`

### What it solves

`var` has **function scope** and is **hoisted** — two behaviors that cause hard-to-debug issues. `let` and `const` have **block scope** and are not accessible before their declaration.

```javascript
// ❌ var — function-scoped, hoisted, leads to surprises
function example() {
  console.log(x); // undefined (hoisted, not ReferenceError)
  var x = 10;

  for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100); // prints 3, 3, 3 — not 0, 1, 2
  }
}

// ✅ let — block-scoped, temporal dead zone
function example() {
  // console.log(x); // ReferenceError — cannot access before initialization
  let x = 10;

  for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100); // prints 0, 1, 2 — correct closure
  }
}

// ✅ const — block-scoped, cannot be reassigned
const API_URL = 'https://api.example.com';
// API_URL = 'other'; // TypeError

// Note: const prevents reassignment, not mutation
const user = { name: 'Alice' };
user.name = 'Bob'; // allowed — mutating the object, not reassigning the variable
```

### `let` vs. `const` — when to use which

```javascript
// Use const by default
const items = [];
const config = { timeout: 3000 };

// Use let only when the binding itself will change
let count = 0;
count++;

let response;
if (condition) {
  response = await fetchA();
} else {
  response = await fetchB();
}
```

### Use cases

- `const` for all values that don't need reassignment (the vast majority)
- `let` for loop counters, conditional assignments, accumulating values
- Never use `var` in modern code

### Pros

- Block scoping matches developer mental model
- `const` communicates intent — this value won't change
- Eliminates the class of bugs caused by `var` hoisting

### Cons

- `const` can give false confidence — objects and arrays are still mutable
- Temporal dead zone errors can confuse developers coming from `var`

---

## 2. Arrow Functions

### What it solves

Regular functions create their own `this` binding — a major source of confusion in callbacks and event handlers. Arrow functions **lexically inherit `this`** from the surrounding scope.

```javascript
// ❌ Regular function — 'this' is lost in callbacks
function Timer() {
  this.seconds = 0;

  setInterval(function() {
    this.seconds++; // 'this' is undefined (strict) or window (sloppy)
    console.log(this.seconds); // NaN or error
  }, 1000);
}

// ✅ Arrow function — 'this' is inherited from Timer
function Timer() {
  this.seconds = 0;

  setInterval(() => {
    this.seconds++; // 'this' correctly refers to the Timer instance
    console.log(this.seconds); // 1, 2, 3...
  }, 1000);
}
```

### Syntax variations

```javascript
// Multi-line with explicit return
const add = (a, b) => {
  const result = a + b;
  return result;
};

// Single expression — implicit return
const add = (a, b) => a + b;

// Single parameter — parentheses optional
const double = n => n * 2;

// No parameters
const getRandom = () => Math.random();

// Returning an object literal — wrap in parentheses
const makeUser = (name) => ({ name, createdAt: new Date() });

// In array methods — concise and readable
const doubled  = [1, 2, 3].map(n => n * 2);
const evens    = [1, 2, 3, 4].filter(n => n % 2 === 0);
const total    = [1, 2, 3].reduce((sum, n) => sum + n, 0);
```

### When NOT to use arrow functions

```javascript
// ❌ Object methods — 'this' will not refer to the object
const counter = {
  count: 0,
  increment: () => {
    this.count++; // 'this' is the outer scope, not counter
  },
};

// ✅ Use regular function for object methods
const counter = {
  count: 0,
  increment() {
    this.count++; // correct
  },
};

// ❌ Constructor functions — arrow functions cannot be used with 'new'
const Person = (name) => { this.name = name; };
new Person('Alice'); // TypeError: Person is not a constructor
```

### Use cases

- Callbacks in array methods (`map`, `filter`, `reduce`)
- Event handlers in React components
- Any function that needs to inherit `this` from the parent scope
- Short, single-expression functions

### Pros

- Eliminates `this` binding confusion in callbacks
- Concise syntax reduces boilerplate
- Implicit return for single expressions is expressive

### Cons

- Cannot be used as constructors
- No own `arguments` object
- Not suitable for object methods or prototype methods
- Harder to name for stack traces when defined as variables

---

## 3. Template Literals

### What it solves

String concatenation with `+` is verbose and error-prone. Template literals enable embedded expressions, multi-line strings, and tagged templates.

```javascript
const user = { name: 'Alice', age: 30 };
const role = 'admin';

// ❌ String concatenation
const message = 'Hello, ' + user.name + '! You are ' + user.age + ' years old and have the role: ' + role + '.';

// ✅ Template literal
const message = `Hello, ${user.name}! You are ${user.age} years old and have the role: ${role}.`;

// Multi-line strings
const html = `
  <div class="card">
    <h2>${user.name}</h2>
    <p>Age: ${user.age}</p>
  </div>
`;

// Expressions inside ${}
const price  = 49.99;
const tax    = 0.08;
const total  = `Total: $${(price * (1 + tax)).toFixed(2)}`;

// Nested template literals
const items  = ['apple', 'banana'];
const list   = `Items: ${items.map(item => `<li>${item}</li>`).join('')}`;
```

### Tagged templates

Tagged templates let you process a template literal with a function — used by libraries like `styled-components` and `graphql-tag`:

```javascript
// A tag function receives the string parts and interpolated values
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) =>
    result + str + (values[i] !== undefined ? `<mark>${values[i]}</mark>` : ''),
    ''
  );
}

const name  = 'Alice';
const score = 98;
const output = highlight`Player ${name} scored ${score} points!`;
// "Player <mark>Alice</mark> scored <mark>98</mark> points!"

// Real-world: styled-components uses tagged templates
const Button = styled.button`
  background: ${props => props.primary ? 'blue' : 'white'};
  padding: 8px 16px;
`;
```

### Use cases

- Dynamic string construction (URLs, messages, SQL-like queries)
- Multi-line HTML or markdown generation
- Styled components (CSS-in-JS)
- GraphQL query definitions (`gql` tag)

### Pros

- Significantly more readable than concatenation
- Multi-line strings without `\n` hacks
- Full JavaScript expressions inside `${}`
- Tagged templates enable powerful DSLs

### Cons

- Tagged templates have a steep learning curve
- Expressions inside `${}` can get complex and hard to read
- No automatic escaping — raw user input in templates is an XSS risk

---

## 4. Destructuring

### What it solves

Extracting values from objects and arrays used to require verbose repetitive assignments. Destructuring does it in one expressive statement.

```javascript
// ❌ Old way
const name     = user.name;
const email    = user.email;
const address  = user.address;
const city     = user.address.city;

// ✅ Object destructuring
const { name, email, address: { city } } = user;

// Rename while destructuring
const { name: userName, email: userEmail } = user;

// Default values
const { name = 'Anonymous', role = 'viewer' } = user;

// Combining rename and default
const { name: displayName = 'Guest' } = user;

// Array destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];
// first = 1, second = 2, rest = [3, 4, 5]

// Swap variables without a temp variable
let a = 1, b = 2;
[a, b] = [b, a];
// a = 2, b = 1

// Skip elements
const [,, third] = [1, 2, 3];
// third = 3
```

### Destructuring in function parameters

```javascript
// ❌ Accessing properties throughout the function body
function renderUser(user) {
  return `${user.firstName} ${user.lastName} (${user.role})`;
}

// ✅ Destructure in the parameter — self-documenting interface
function renderUser({ firstName, lastName, role = 'viewer' }) {
  return `${firstName} ${lastName} (${role})`;
}

// React component props
function UserCard({ name, avatarUrl, onClick, className = '' }) {
  return (
    <div className={`user-card ${className}`} onClick={onClick}>
      <img src={avatarUrl} alt={name} />
      <h3>{name}</h3>
    </div>
  );
}
```

### Nested destructuring

```javascript
const { 
  user: { 
    profile: { 
      firstName, 
      lastName 
    }, 
    settings: { theme = 'light' } 
  } 
} = apiResponse;
```

### Use cases

- Extracting props in React components
- Processing API responses
- Swapping variables
- Function return values (return an object, destructure at call site)
- Importing multiple named exports

### Pros

- Reduces repetitive property access
- Makes function signatures self-documenting
- Enables clean handling of defaults
- Works with any iterable for array destructuring

### Cons

- Deep nested destructuring is hard to read
- Destructuring undefined throws a TypeError — guard against it
- Can obscure where a variable comes from in large destructuring blocks

---

## 5. Spread and Rest Operators

### What it solves

Copying arrays/objects, merging data, and handling variable argument counts all required clunky workarounds. Spread (`...`) and rest (`...`) use the same syntax for complementary purposes.

```javascript
// SPREAD — expand an iterable into individual elements

// Array spread — copy and combine
const a = [1, 2, 3];
const b = [4, 5, 6];
const combined  = [...a, ...b];          // [1, 2, 3, 4, 5, 6]
const copy      = [...a];               // shallow copy
const prepended = [0, ...a];            // [0, 1, 2, 3]

// Object spread — copy and merge
const defaults = { theme: 'light', lang: 'en', fontSize: 14 };
const userPrefs = { theme: 'dark' };
const config = { ...defaults, ...userPrefs }; // { theme: 'dark', lang: 'en', fontSize: 14 }

// Immutable state update pattern (React / Redux)
const state = { user: { name: 'Alice', role: 'viewer' }, isLoading: false };

// Update nested property immutably
const newState = {
  ...state,
  user: { ...state.user, role: 'admin' },
};

// Function call spread
const numbers = [1, 5, 3, 9, 2];
const max     = Math.max(...numbers); // equivalent to Math.max(1, 5, 3, 9, 2)
```

```javascript
// REST — collect remaining elements into an array

// Rest in function parameters
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
sum(1, 2, 3, 4, 5); // 15

// Rest in destructuring
const [head, ...tail] = [1, 2, 3, 4, 5];
// head = 1, tail = [2, 3, 4, 5]

// Object rest — extract some properties, collect the rest
const { id, createdAt, updatedAt, ...publicData } = userRecord;
// publicData contains everything except id, createdAt, updatedAt

// Useful for omitting props in React
function Button({ variant, className, ...nativeProps }) {
  return (
    <button
      className={`btn btn-${variant} ${className}`}
      {...nativeProps} // spread remaining props onto the native element
    />
  );
}
```

### Use cases

- Immutable state updates in React and Redux
- Merging configuration objects with defaults
- Cloning arrays and objects
- Passing arbitrary props to child components
- Variadic functions (accepting any number of arguments)

### Pros

- Enables immutable patterns without external libraries
- Clean, readable syntax for merging and cloning
- Rest parameters replace the old `arguments` object with a real array

### Cons

- Spread creates **shallow copies** — nested objects are still shared references
- Spreading large objects or arrays on every render has a performance cost
- Object spread order matters — later properties override earlier ones (easy to get wrong)

---

## 6. Default Parameters

### What it solves

Manually checking for `undefined` and setting fallback values at the top of every function was repetitive and noisy.

```javascript
// ❌ Old pattern
function createUser(name, role, active) {
  name   = name   !== undefined ? name   : 'Anonymous';
  role   = role   !== undefined ? role   : 'viewer';
  active = active !== undefined ? active : true;
  return { name, role, active };
}

// ✅ Default parameters
function createUser(name = 'Anonymous', role = 'viewer', active = true) {
  return { name, role, active };
}

// Defaults can be expressions — evaluated at call time, not definition time
function createPost(title, createdAt = new Date(), id = generateId()) {
  return { title, createdAt, id };
}

// Defaults can reference earlier parameters
function buildUrl(host, port = 443, path = '/', protocol = port === 443 ? 'https' : 'http') {
  return `${protocol}://${host}:${port}${path}`;
}
```

### Use cases

- Optional function arguments with sensible fallbacks
- React component default prop values
- Configuration functions with optional settings
- Factory functions

### Pros

- Eliminates defensive `||` or ternary checks for `undefined`
- Defaults are visible in the function signature — self-documenting
- Defaults are expressions — can call functions or reference other params

### Cons

- Only triggers on `undefined` — not `null` or `0` or `''`
- Complex default expressions can obscure function behavior
- Debugging can be confusing when defaults shadow missing arguments

---

## 7. Classes

### What it solves

JavaScript's prototype-based inheritance required complex patterns (`Object.create`, manual `prototype` assignment) that were hard to read and teach. Classes provide a cleaner syntax over the same underlying prototype system.

```javascript
// ES5 — prototype-based
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  return `${this.name} makes a noise.`;
};

// ES6 — class syntax
class Animal {
  // Public class field (ES2022)
  type = 'animal';

  // Private class field (ES2022)
  #secretId;

  constructor(name) {
    this.name    = name;
    this.#secretId = Math.random();
  }

  // Instance method
  speak() {
    return `${this.name} makes a noise.`;
  }

  // Static method — called on the class, not instances
  static create(name) {
    return new Animal(name);
  }

  // Getter
  get displayName() {
    return this.name.toUpperCase();
  }

  // Setter
  set displayName(value) {
    this.name = value.toLowerCase();
  }
}

// Inheritance
class Dog extends Animal {
  #tricks = [];

  constructor(name, breed) {
    super(name); // must call super before using 'this'
    this.breed = breed;
  }

  speak() {
    return `${this.name} barks.`;
  }

  learn(trick) {
    this.#tricks.push(trick);
  }

  get tricks() {
    return [...this.#tricks]; // return a copy — private field stays protected
  }
}

const dog  = new Dog('Rex', 'Labrador');
dog.speak();         // "Rex barks."
dog.learn('sit');
dog.tricks;          // ['sit']
dog.#tricks;         // SyntaxError — private field not accessible outside class
```

### Use cases

- Custom error classes (`class ValidationError extends Error`)
- Service or repository classes in larger applications
- React class components (legacy — functional components preferred now)
- SDK and library design where OOP patterns make sense

### Pros

- Cleaner, more familiar syntax than raw prototype manipulation
- Private fields (`#field`) provide true encapsulation
- `super` and `extends` are explicit and readable
- Static methods and fields are naturally expressed

### Cons

- Syntactic sugar — still prototype-based under the hood; misconceptions persist
- Classes encourage mutable state and inheritance — both can lead to tight coupling
- In React, functional components + hooks have largely replaced class components
- `this` binding still bites developers in class methods used as callbacks

---

## 8. Modules (import / export)

### What it solves

Before ES modules, JavaScript had no native module system. Code was either all in one file or shared via globals, AMD, or CommonJS (`require`). ES modules bring native, statically analyzable imports and exports to the language.

```javascript
// Named exports — a module can have many
// math.js
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export function multiply(a, b) { return a * b; }

// Default export — a module can have one
// formatDate.js
export default function formatDate(date) {
  return new Intl.DateTimeFormat('en-US').format(date);
}

// Re-exporting — barrel files (index.js)
export { UserCard } from './UserCard';
export { UserList } from './UserList';
export { useUser }  from './useUser';
export type { User } from './types';
```

```javascript
// Named imports
import { add, multiply, PI } from './math';

// Default import
import formatDate from './formatDate';

// Rename on import
import { add as addNumbers } from './math';

// Import everything as a namespace
import * as MathUtils from './math';
MathUtils.add(1, 2);

// Import from barrel file
import { UserCard, UserList, useUser } from '@/components/user';

// Dynamic import — lazy loading
const { Chart } = await import('./Chart');

// Top-level await (ES2022)
const config = await fetch('/config.json').then(r => r.json());
export { config };
```

### ES modules vs. CommonJS

```javascript
// CommonJS (Node.js legacy)
const fs      = require('fs');
module.exports = { readFile };

// ES Modules (modern)
import { readFile } from 'fs';
export { readFile };

// Key differences:
// - ES modules are statically analyzable → enables tree shaking
// - ES modules are always strict mode
// - ES modules are asynchronous (top-level await works)
// - CommonJS is synchronous, evaluated at runtime
```

### Use cases

- Organizing code across files — every modern frontend project
- Tree shaking — bundlers eliminate unused named exports
- Lazy loading routes and heavy components
- Barrel files for clean public APIs from feature folders

### Pros

- Static structure enables tree shaking and dead code elimination
- Named exports are self-documenting and IDE-friendly (autocomplete, find-all-references)
- Circular dependency issues are caught earlier than with CommonJS
- Top-level `await` eliminates awkward IIFE patterns for async initialization

### Cons

- Default exports lose their name on import — can lead to inconsistent naming across a codebase
- Barrel files can inadvertently import large dependency trees
- Node.js support required `.mjs` or `"type": "module"` for a long time — ecosystem migration was slow

---

## 9. Promises

### What it solves

Asynchronous JavaScript relied on nested callbacks — the infamous "callback hell." Promises represent the eventual result of an async operation with a clean, chainable API.

```javascript
// ❌ Callback hell
fetchUser(id, function(err, user) {
  if (err) return handleError(err);
  fetchPosts(user.id, function(err, posts) {
    if (err) return handleError(err);
    fetchComments(posts[0].id, function(err, comments) {
      if (err) return handleError(err);
      render(user, posts, comments);
    });
  });
});

// ✅ Promise chaining
fetchUser(id)
  .then(user => fetchPosts(user.id))
  .then(posts => fetchComments(posts[0].id))
  .then(comments => render(comments))
  .catch(handleError)
  .finally(() => setLoading(false));

// Creating a promise
function delay(ms) {
  return new Promise((resolve, reject) => {
    if (ms < 0) reject(new Error('Delay cannot be negative'));
    setTimeout(resolve, ms);
  });
}
```

### Promise combinators

```javascript
// Promise.all — all must resolve; fails fast on first rejection
const [user, posts, settings] = await Promise.all([
  fetchUser(id),
  fetchPosts(id),
  fetchSettings(id),
]);

// Promise.allSettled — waits for all, regardless of outcome
const results = await Promise.allSettled([fetchA(), fetchB(), fetchC()]);
results.forEach(result => {
  if (result.status === 'fulfilled') console.log(result.value);
  if (result.status === 'rejected')  console.error(result.reason);
});

// Promise.race — resolves/rejects with the first to settle
const result = await Promise.race([
  fetchData(),
  delay(5000).then(() => { throw new Error('Timeout'); }),
]);

// Promise.any — resolves with first success; rejects only if ALL fail
const fastestResult = await Promise.any([fetchFromServer1(), fetchFromServer2()]);
```

### Use cases

- Any asynchronous operation: API calls, file reads, timers
- Parallel data fetching with `Promise.all`
- Timeout patterns with `Promise.race`
- Error resilience with `Promise.allSettled`

### Pros

- Eliminates callback hell with chainable `.then()`
- Unified error handling with `.catch()`
- Combinators (`all`, `race`, `allSettled`, `any`) handle complex async patterns
- Foundation for `async`/`await`

### Cons

- Unhandled promise rejections are silent errors if `.catch()` is omitted
- Promise chaining can still become hard to read with many steps
- `Promise.all` fails fast — one rejection cancels the rest (use `allSettled` if you want all results)

---

## 10. `async` / `await`

### What it solves

Even with promises, complex async flows were hard to read. `async`/`await` lets you write asynchronous code that reads like synchronous code.

```javascript
// ✅ async/await — reads top to bottom, like synchronous code
async function loadDashboard(userId) {
  try {
    const user  = await fetchUser(userId);
    const [feed, notifications] = await Promise.all([
      fetchFeed(user.id),
      fetchNotifications(user.id),
    ]);

    return { user, feed, notifications };
  } catch (error) {
    console.error('Dashboard load failed:', error);
    throw error; // re-throw to propagate
  } finally {
    setLoading(false); // always runs
  }
}

// An async function always returns a Promise
const result = await loadDashboard('user-1');

// Sequential vs. parallel
// Sequential — each waits for the previous (slower)
const a = await fetchA();
const b = await fetchB();

// Parallel — both run at the same time (faster)
const [a, b] = await Promise.all([fetchA(), fetchB()]);
```

### Common patterns

```javascript
// Async IIFE — for top-level await in older environments
(async () => {
  const data = await fetchData();
  render(data);
})();

// Async event handler
button.addEventListener('click', async (e) => {
  e.preventDefault();
  const result = await submitForm(formData);
  showSuccess(result);
});

// Async in React
async function handleSubmit(data) {
  setLoading(true);
  try {
    await api.post('/users', data);
    navigate('/success');
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

// Error handling per-request vs. global
async function fetchWithFallback(url, fallback) {
  try {
    return await fetch(url).then(r => r.json());
  } catch {
    return fallback; // ES2019 optional catch binding — no 'error' variable needed
  }
}
```

### Use cases

- API calls in React components and custom hooks
- Sequential async operations where each step depends on the previous
- Combining with `Promise.all` for parallel requests with clean syntax
- Form submission handlers

### Pros

- Reads like synchronous code — dramatically easier to follow
- `try`/`catch`/`finally` for familiar error handling
- Debugger steps through `await` expressions naturally
- `async` functions always return a promise — consistent behavior

### Cons

- Forgetting `await` produces silent bugs (you get a Promise instead of a value)
- Sequential `await` inside loops is slow — use `Promise.all` for parallel work
- `await` can only be used inside `async` functions (except top-level await in ES modules)
- Error handling requires explicit `try`/`catch` — easy to forget

---

## 11. Optional Chaining (`?.`)

### What it solves

Accessing deeply nested properties required verbose guard checks. Optional chaining short-circuits to `undefined` if any part of the chain is `null` or `undefined`.

```javascript
// ❌ Defensive property access — verbose
const city = user && user.address && user.address.city;
const zip  = user && user.address && user.address.zip && user.address.zip.toString();

// ✅ Optional chaining
const city = user?.address?.city;
const zip  = user?.address?.zip?.toString();

// Method calls
const name = user?.getName?.();

// Array access
const first = arr?.[0];

// In callbacks
function processUser(user) {
  const formattedName = user?.profile?.formatName?.() ?? 'Unknown';
  return formattedName;
}

// Real-world React
function UserProfile({ user }) {
  return (
    <div>
      <img src={user?.avatar?.url ?? '/default-avatar.png'} alt={user?.name} />
      <p>{user?.address?.city ?? 'Location unknown'}</p>
    </div>
  );
}
```

### Use cases

- Accessing API responses where fields may be absent
- Optional callbacks in component props
- Accessing DOM elements that may not exist yet
- Working with optional third-party library features

### Pros

- Eliminates defensive `&&` chains
- Short-circuits immediately — no TypeError for deeply nested access
- Works with method calls, array subscripts, and property access

### Cons

- Can mask real bugs — a missing property may indicate a logic error, not an expected absence
- Overuse makes it harder to reason about where data is guaranteed to exist
- IDE autocomplete may not work as well through deep optional chains

---

## 12. Nullish Coalescing (`??`)

### What it solves

The `||` operator returns the right side for any falsy value — including `0`, `''`, and `false`, which are often valid values. `??` only falls back when the left side is `null` or `undefined`.

```javascript
// ❌ || treats all falsy values as missing
const count    = userCount || 10; // wrong if userCount is 0
const label    = title || 'Untitled'; // wrong if title is ''
const enabled  = isEnabled || true; // wrong if isEnabled is false

// ✅ ?? only falls back on null/undefined
const count    = userCount ?? 10;  // 0 is preserved
const label    = title ?? 'Untitled'; // '' is preserved
const enabled  = isEnabled ?? true; // false is preserved

// Combine with optional chaining
const city     = user?.address?.city ?? 'Unknown city';
const timeout  = config?.network?.timeout ?? 3000;

// Logical nullish assignment (ES2021)
// Only assigns if the left side is null or undefined
user.preferences ??= {};
config.timeout   ??= 5000;
```

### Use cases

- Default values for `0`, `false`, and `''` that are valid values
- Combining with optional chaining for safe deeply-nested access with fallbacks
- Configuration defaults where `0` and `false` are meaningful values

### Pros

- Semantically precise — only catches `null` and `undefined`
- Prevents subtle bugs where `0` or `false` was a valid value but got replaced by `||`
- `??=` assignment is concise for initializing missing properties

### Cons

- Requires understanding the distinction between falsy values and null/undefined
- Cannot be combined with `||` or `&&` without parentheses — causes a syntax error

---

## 13. Destructuring with Rest / Spread in Objects (ES2018)

### What it solves

ES2015 introduced rest/spread for arrays. ES2018 extended it to objects, enabling the clean "pick some, keep the rest" pattern.

```javascript
// Object rest — extract some, collect the rest
const { id, password, ...safeUser } = fullUserRecord;
// safeUser contains everything except id and password — safe to send to client

// Useful in React for passing props through
function Wrapper({ className, style, ...childProps }) {
  return (
    <div className={`wrapper ${className}`} style={style}>
      <Child {...childProps} />  {/* all other props forwarded */}
    </div>
  );
}

// Object spread for immutable updates (most common React pattern)
const nextState = {
  ...state,
  count: state.count + 1,
  lastUpdated: new Date(),
};
```

---

## 14. `Symbol`

### What it solves

Symbols are unique, immutable primitive values — guaranteed never to collide with any other value. They enable truly private-ish object keys and well-known hooks into JavaScript's built-in behaviors.

```javascript
// Every Symbol is unique
const s1 = Symbol('id');
const s2 = Symbol('id');
s1 === s2; // false — always

// As unique object keys — won't collide with string keys
const ID     = Symbol('id');
const SECRET = Symbol('secret');

const user = {
  name: 'Alice',
  [ID]:     'usr_123',
  [SECRET]: 'token_abc',
};

user[ID];        // 'usr_123'
user['id'];      // undefined — string 'id' is not the Symbol
Object.keys(user); // ['name'] — Symbols don't appear in enumeration

// Well-known Symbols — customize built-in behavior
class Range {
  constructor(start, end) {
    this.start = start;
    this.end   = end;
  }

  // Make the class iterable with Symbol.iterator
  [Symbol.iterator]() {
    let current = this.start;
    const end   = this.end;
    return {
      next() {
        return current <= end
          ? { value: current++, done: false }
          : { done: true };
      },
    };
  }
}

for (const n of new Range(1, 5)) {
  console.log(n); // 1, 2, 3, 4, 5
}

[...new Range(1, 3)]; // [1, 2, 3]
```

### Use cases

- Unique keys that must not conflict with string keys or other libraries
- Well-known Symbols to hook into iteration (`Symbol.iterator`), type coercion (`Symbol.toPrimitive`), and more
- Library internals where private metadata needs to be stored on objects

### Pros

- Guaranteed uniqueness — zero collision risk
- Symbol-keyed properties are non-enumerable — hidden from `for...in` and `Object.keys`
- Well-known Symbols unlock deep language integration (iterables, async iterables, custom `instanceof`)

### Cons

- Not truly private — accessible via `Object.getOwnPropertySymbols()`
- Cannot be serialized to JSON — `JSON.stringify` ignores Symbol keys
- Overkill for most application code — primarily for library authors

---

## 15. Iterators and Generators

### What it solves

Custom sequences and lazy data generation required complex class implementations. Iterators formalize the iteration protocol; generators provide a simple syntax for producing sequences on demand.

```javascript
// Iterator protocol — any object with a next() method
function makeCounter(start = 0) {
  let count = start;
  return {
    next() {
      return { value: count++, done: false };
    },
    [Symbol.iterator]() { return this; }
  };
}

const counter = makeCounter(1);
counter.next(); // { value: 1, done: false }
counter.next(); // { value: 2, done: false }

// Generator function — yield pauses execution
function* range(start, end, step = 1) {
  for (let i = start; i <= end; i += step) {
    yield i; // pauses here, resumes on next .next() call
  }
}

[...range(1, 10, 2)];   // [1, 3, 5, 7, 9]
[...range(0, 100, 25)]; // [0, 25, 50, 75, 100]

// Infinite sequences — safe because values are pulled lazily
function* naturals() {
  let n = 1;
  while (true) yield n++;
}

function take(n, iter) {
  const result = [];
  for (const value of iter) {
    result.push(value);
    if (result.length >= n) break;
  }
  return result;
}

take(5, naturals()); // [1, 2, 3, 4, 5]

// Async generators (ES2018) — for async data streams
async function* paginate(url) {
  let cursor = null;
  do {
    const res  = await fetch(`${url}?cursor=${cursor}`).then(r => r.json());
    yield res.data;
    cursor = res.nextCursor;
  } while (cursor);
}

for await (const page of paginate('/api/posts')) {
  renderPage(page);
}
```

### Use cases

- Paginated API consumption with async generators
- Lazy sequences (infinite scroll data, range generation)
- Custom data structures that need `for...of` support
- Redux-Saga (generators as async orchestration)

### Pros

- Lazy evaluation — values produced only when needed (memory efficient)
- Infinite sequences are safe and natural
- Async generators handle streaming data elegantly
- `return` and `throw` allow external control of generator execution

### Cons

- Syntax and mental model are unfamiliar to many developers
- Generators are stateful — not pure functions
- Debugging generators can be non-trivial
- `async`/`await` has largely replaced generators for most async use cases

---

## 16. `Map` and `Set`

### What it solves

Plain objects as maps have problems: keys are always strings (or Symbols), inherited properties can pollute lookups, and there's no built-in size or ordered iteration. `Map` and `Set` solve all of these.

```javascript
// Map — key-value store where keys can be ANY type
const map = new Map();

map.set('name', 'Alice');
map.set(42, 'the answer');
map.set({ id: 1 }, 'object as key');

map.get('name');  // 'Alice'
map.get(42);      // 'the answer'
map.size;         // 3
map.has('name');  // true

// Iteration — Maps preserve insertion order
for (const [key, value] of map) {
  console.log(key, value);
}

// Initialize from pairs
const config = new Map([
  ['host', 'localhost'],
  ['port', 3000],
  ['debug', true],
]);

// Convert to object and back
const obj       = Object.fromEntries(config);
const backToMap = new Map(Object.entries(obj));
```

```javascript
// Set — collection of unique values
const set = new Set([1, 2, 3, 2, 1]);
set.size; // 3 — duplicates removed

set.add(4);
set.has(2); // true
set.delete(1);

// Most common use: deduplicate an array
const unique = [...new Set([1, 2, 3, 2, 1, 3])]; // [1, 2, 3]

// Set operations
const a = new Set([1, 2, 3, 4]);
const b = new Set([3, 4, 5, 6]);

const union        = new Set([...a, ...b]);         // {1,2,3,4,5,6}
const intersection = new Set([...a].filter(x => b.has(x))); // {3,4}
const difference   = new Set([...a].filter(x => !b.has(x))); // {1,2}
```

### Use cases

- `Map`: caching computed results keyed by object references, frequency counts, bidirectional lookups
- `Set`: deduplication, tracking visited nodes in graph algorithms, storing unique IDs
- `WeakMap`/`WeakSet`: storing private data tied to object lifetimes (garbage-collection friendly)

### Pros

- `Map` accepts any key type — object references, functions, numbers
- Both have O(1) lookup, insertion, and deletion
- Guaranteed insertion-order iteration
- `Set.has()` is O(1) vs. `Array.includes()` which is O(n)

### Cons

- Cannot be serialized to JSON directly — need `Array.from()` or spread first
- Less familiar than plain objects and arrays to new team members
- `WeakMap`/`WeakSet` are not iterable — different semantics

---

## 17. `Proxy` and `Reflect`

### What it solves

Intercepting and customizing fundamental object operations (property access, assignment, function calls) was impossible without modifying the object itself. `Proxy` wraps an object and intercepts these operations via **traps**.

```javascript
// Proxy — intercept object operations
const handler = {
  get(target, property) {
    console.log(`Getting ${property}`);
    return property in target ? target[property] : `Property '${property}' not found`;
  },

  set(target, property, value) {
    if (typeof value !== 'number') {
      throw new TypeError(`${property} must be a number`);
    }
    target[property] = value;
    return true; // must return true to indicate success
  },
};

const stats = new Proxy({}, handler);
stats.score = 100;    // sets fine
stats.score = 'high'; // TypeError: score must be a number
stats.score;          // logs "Getting score", returns 100
stats.missing;        // "Property 'missing' not found"

// Real-world: reactive state (how Vue 3's reactivity works)
function reactive(obj) {
  return new Proxy(obj, {
    set(target, key, value) {
      target[key] = value;
      triggerUpdate(key, value); // notify subscribers
      return true;
    },
  });
}

// Validation proxy
function withValidation(target, validators) {
  return new Proxy(target, {
    set(obj, prop, value) {
      if (validators[prop] && !validators[prop](value)) {
        throw new Error(`Invalid value for ${prop}: ${value}`);
      }
      obj[prop] = value;
      return true;
    },
  });
}

const user = withValidation({}, {
  age:   (v) => typeof v === 'number' && v >= 0 && v <= 150,
  email: (v) => typeof v === 'string' && v.includes('@'),
});

user.age   = 25;         // fine
user.age   = -5;         // Error: Invalid value for age: -5
user.email = 'alice@example.com'; // fine
```

### Use cases

- Reactivity systems (Vue 3's core mechanism)
- Validation layers on data objects
- Logging and debugging wrappers
- Access control on sensitive objects
- Mocking in tests

### Pros

- Intercepts any fundamental object operation — get, set, delete, construct, apply
- Non-invasive — wraps without modifying the original object
- Powers entire reactive frameworks (Vue 3)

### Cons

- Performance overhead on every intercepted operation
- Debugging is harder — a Proxy looks like the target object but behaves differently
- Not all operations are interceptable in all environments
- Complex nested proxies compound performance and debugging issues

---

## Quick Reference: ES6+ Feature Decision Guide

```
Variable declarations
  └─ always const → reassignment needed → let → legacy code only → var

String construction
  └─ dynamic or multiline → template literal → static → string literal

Object/array transformation
  └─ extract values     → destructuring
  └─ merge / clone      → spread
  └─ collect remainder  → rest

Functions
  └─ callbacks, array methods, need 'this' from parent → arrow function
  └─ object methods, constructors, need own 'this'     → regular function

Async patterns
  └─ single async op       → async/await
  └─ parallel async ops    → Promise.all + await
  └─ all results needed    → Promise.allSettled + await
  └─ streaming/pagination  → async generator

Safe property access
  └─ may be null/undefined        → optional chaining ?.
  └─ need default for null/undefined only → nullish coalescing ??
  └─ need default for any falsy   → logical OR ||

Collections
  └─ unique values        → Set
  └─ key-value, any key   → Map
  └─ plain key-value      → Object
```

---

## Common Interview Questions — ES6 Edition

```
Q: What is the difference between let, const, and var?
A: Scope (block vs. function), hoisting behavior, temporal dead zone,
   and whether rebinding is allowed.

Q: How does arrow function 'this' differ from regular function 'this'?
A: Arrow functions have no own 'this' — they inherit it lexically from
   the enclosing scope. Regular functions bind 'this' at call time.

Q: What is the difference between ?? and ||?
A: ?? only falls back for null/undefined. || falls back for any falsy
   value (0, '', false, null, undefined, NaN).

Q: What is the difference between Promise.all and Promise.allSettled?
A: Promise.all fails fast on first rejection. Promise.allSettled always
   waits for all promises and returns each result with a status field.

Q: What is a generator and when would you use one?
A: A function that can pause (yield) and resume. Use for lazy sequences,
   infinite data, async streams, or orchestrating complex async flows.

Q: What does the spread operator do to nested objects?
A: It creates a shallow copy. Nested objects are still shared references —
   mutating a nested object in the copy also mutates the original.
```

---

> ES6 was not just a syntax update — it was a reimagining of how JavaScript applications are structured. Every feature fills a specific gap that caused real bugs and productivity loss in the years before. Understanding *why* each feature exists makes you a better engineer than simply knowing *how* to use it.
