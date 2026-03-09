---
id: react-4
title: Controlled vs Uncontrolled Components
category: React
subcategory: Patterns
difficulty: Easy
pattern: Form Patterns
companies: [Amazon, Microsoft, Meta]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Controlled components use React state as the single source of truth via value + onChange, giving you full control for real-time validation and conditional logic. Uncontrolled components let the DOM manage form data and use refs to read values, reducing boilerplate for simple forms."
similarProblems: [Hooks Internals, Custom Hooks Patterns, HOC vs Render Props vs Hooks]
---

**What is the difference between controlled and uncontrolled components in React?**

This is a fundamental React pattern that relates to how form data is managed.

**Controlled Components:**
A controlled component is one where React controls the form element's value via state. The component's state is the "single source of truth." Every change to the input goes through a React event handler that updates state, which in turn updates the input value.

- The `value` prop is set on the input element.
- An `onChange` handler updates the state.
- React drives what the input displays.

**Pros:** Full control over form data, easy validation, conditional disabling, formatting input, enforcing constraints.

**Cons:** More boilerplate (state + handler for every input).

**Uncontrolled Components:**
An uncontrolled component lets the DOM handle the form data internally. You read values using a `ref` rather than writing event handlers for every state update.

- The `defaultValue` prop sets the initial value (not `value`).
- A `ref` is used to access the current value when needed (e.g., on submit).
- The DOM is the source of truth.

**Pros:** Less code, works well for simple forms, easy integration with non-React code.

**Cons:** Harder to validate in real-time, less control over the input behavior.

**When to use which:**
- Use **controlled** when you need real-time validation, conditional rendering based on input, or formatted inputs (phone number, currency).
- Use **uncontrolled** for simple forms where you only need the value on submit, or when integrating with third-party DOM libraries.

## Examples

**Input:** Form with email validation in real-time
**Output:** Use controlled component to validate on every keystroke
*Controlled components let you run validation logic in the onChange handler before updating state.*


## Solution

```js
import React, { useState, useRef, FormEvent } from 'react';

// ---- Controlled Component ----
function ControlledForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (value: string) => {
    if (!value.includes('@')) {
      setErrors((prev) => ({ ...prev, email: 'Invalid email' }));
    } else {
      setErrors((prev) => {
        const { email, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value); // Real-time validation
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length === 0) {
      console.log('Submitting:', { email, password });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}              {/* React controls the value */}
          onChange={handleEmailChange} {/* Every change goes through React */}
        />
        {errors.email && <span style={{ color: 'red' }}>{errors.email}</span>}
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}

// ---- Uncontrolled Component ----
function UncontrolledForm() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Read values from the DOM via refs
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    console.log('Submitting:', { email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          defaultValue=""              {/* Initial value only */}
          ref={emailRef}               {/* Access DOM node directly */}
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          defaultValue=""
          ref={passwordRef}
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}

// ---- Hybrid approach: Uncontrolled with validation on submit ----
function HybridForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(formRef.current!);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const newErrors: string[] = [];
    if (!email.includes('@')) newErrors.push('Invalid email');
    if (password.length < 8) newErrors.push('Password must be 8+ chars');

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    console.log('Valid submission:', { email, password });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input name="email" type="email" defaultValue="" />
      <input name="password" type="password" defaultValue="" />
      {errors.map((err) => (
        <p key={err} style={{ color: 'red' }}>{err}</p>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
}
```
