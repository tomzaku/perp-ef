---
id: react-18
title: "React 19: ref as Prop & forwardRef Removal"
category: React
subcategory: React 19
difficulty: Easy
pattern: Component API Design
companies: [Meta, Google, Microsoft]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "In React 19, function components can accept ref directly as a regular prop — no need for forwardRef(). This simplifies component authoring significantly. forwardRef still works for backwards compatibility but is now considered legacy."
similarProblems: [useImperativeHandle, Component Composition, React 19 use() Hook]
---

**How has ref forwarding changed in React 19? Why was `forwardRef` removed as a requirement?**

In React 18 and earlier, passing a `ref` from a parent to a child's DOM element required wrapping the child component in `React.forwardRef()`. This was necessary because `ref` was a special prop that React intercepted and did not pass through to the component's props.

**React 19 change:** Function components now receive `ref` as a regular prop, just like `className` or `onClick`. You no longer need `forwardRef`.

**Before (React 18):**
```jsx
const Input = forwardRef((props, ref) => <input {...props} ref={ref} />);
```

**After (React 19):**
```jsx
function Input({ ref, ...props }) {
  return <input {...props} ref={ref} />;
}
```

**Why the change?**
- `forwardRef` was a wrapper purely to work around React's special handling of `ref`
- It added ceremony and complexity for a common use case
- TypeScript types were awkward with `forwardRef`
- Consistency: `ref` now behaves like any other prop

**Migration:** `forwardRef` still works in React 19 (backwards compatible) but the React team recommends migrating to the new pattern. A codemod is available.

## Examples

**Input:** A parent component wants to focus a child `<input>` element imperatively
**Output:** The child accepts `ref` as a normal prop and attaches it to the DOM node

## Solution

```jsx
// ============================================
// React 18 — the OLD way (still works in 19)
// ============================================
import { forwardRef, useRef } from 'react';

const LegacyInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function LegacyInput(props, ref) {
    return <input ref={ref} {...props} />;
  }
);

// ============================================
// React 19 — the NEW way (no forwardRef)
// ============================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>;
}

function Input({ ref, ...props }: InputProps) {
  return <input ref={ref} {...props} />;
}

// Usage — identical either way:
function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFocus() {
    inputRef.current?.focus();
  }

  return (
    <div>
      <Input ref={inputRef} placeholder="Search..." />
      <button onClick={handleFocus}>Focus</button>
    </div>
  );
}

// ============================================
// React 19 — with useImperativeHandle (still works)
// ============================================
interface VideoPlayerHandle {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
}

interface VideoPlayerProps {
  ref?: React.Ref<VideoPlayerHandle>;
  src: string;
}

function VideoPlayer({ ref, src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Still use useImperativeHandle to expose a custom API
  useImperativeHandle(ref, () => ({
    play() {
      videoRef.current?.play();
    },
    pause() {
      videoRef.current?.pause();
    },
    seek(time: number) {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
  }));

  return <video ref={videoRef} src={src} />;
}

function VideoApp() {
  const playerRef = useRef<VideoPlayerHandle>(null);

  return (
    <div>
      <VideoPlayer ref={playerRef} src="/movie.mp4" />
      <button onClick={() => playerRef.current?.play()}>Play</button>
      <button onClick={() => playerRef.current?.pause()}>Pause</button>
      <button onClick={() => playerRef.current?.seek(30)}>Skip to 0:30</button>
    </div>
  );
}

// ============================================
// React 19 — ref as callback (still works, cleaner now)
// ============================================
function MeasuredBox() {
  function measureRef(node: HTMLDivElement | null) {
    if (node) {
      const rect = node.getBoundingClientRect();
      console.log('Box dimensions:', rect.width, rect.height);
    }
  }

  return <div ref={measureRef}>Measure me</div>;
}

// ============================================
// Component composition with ref — real-world example
// ============================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
  variant?: 'primary' | 'secondary';
}

// Design system button — accepts ref like a native element
function Button({ ref, variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      ref={ref}
      className={`btn btn-${variant} ${className ?? ''}`}
      {...props}
    />
  );
}

function Form() {
  const submitRef = useRef<HTMLButtonElement>(null);

  // Could programmatically click the submit button
  function triggerSubmit() {
    submitRef.current?.click();
  }

  return (
    <form>
      <input name="email" type="email" />
      <Button ref={submitRef} type="submit" variant="primary">
        Submit
      </Button>
    </form>
  );
}
```

## Explanation

CONCEPT: ref as a Regular Prop in React 19

```
REACT 18 — ref was SPECIAL (intercepted by React):

Parent:  <MyInput ref={inputRef} />
                     │
                     │  React intercepted ref here
                     │  Did NOT pass it to props
                     ▼
MyInput props: { /* no ref! */ }
                     │
              forwardRef needed to
              "tunnel" ref through

─────────────────────────────────────────────

REACT 19 — ref is NORMAL prop:

Parent:  <MyInput ref={inputRef} />
                     │
                     │  React passes ref like any prop
                     ▼
MyInput props: { ref: inputRef, ...otherProps }
                     │
              Just destructure and use it
```

```
MIGRATION GUIDE:

React 18 pattern:
const MyComponent = forwardRef((props, ref) => {
  return <div ref={ref} {...props} />;
});

React 19 pattern:
function MyComponent({ ref, ...props }) {
  return <div ref={ref} {...props} />;
}

TypeScript React 19 pattern:
interface Props {
  ref?: React.Ref<HTMLDivElement>;
  // ... other props
}
function MyComponent({ ref, ...props }: Props) {
  return <div ref={ref} {...props} />;
}
```

KEY RULES:
- React 19: ref is a regular prop — accept it in the props object
- `forwardRef` still works (backwards compat) but is now legacy
- `useImperativeHandle` still works — just use the new prop pattern
- Callback refs still work the same way
- Class components: still use `createRef` and `this.refs` (unchanged)
- The React team provides a codemod to auto-migrate `forwardRef` usage
