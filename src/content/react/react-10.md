---
id: react-10
title: Server Components vs Client Components
category: React
subcategory: Architecture
difficulty: Hard
pattern: RSC
companies: [Meta, Vercel, Netflix]
timeComplexity: N/A
spaceComplexity: N/A
keyTakeaway: "Server Components run only on the server, shipping zero JS to the client. They can directly access databases and APIs. Client Components (marked with \"use client\") handle interactivity. The two compose together: Server Components render the data-heavy skeleton, Client Components provide interactive islands. Use the \"donut\" pattern (children prop) to nest server content inside client layouts."
similarProblems: [Suspense and Lazy Loading, React Fiber Architecture, Concurrent Features]
---

**Explain React Server Components (RSC) and how they differ from Client Components.**

React Server Components (RSC) is a new paradigm where components can run exclusively on the server, sending only their rendered output (not their JavaScript) to the client.

**Server Components:**
- Run only on the server. Their code is NEVER sent to the client bundle.
- Can directly access server-side resources: databases, file system, internal APIs.
- Cannot use state (`useState`), effects (`useEffect`), or browser APIs.
- Cannot use event handlers (`onClick`, etc.).
- Are the default in frameworks like Next.js App Router.
- Reduce client-side JavaScript bundle size significantly.

**Client Components:**
- Run on the client (and can also pre-render on the server during SSR).
- Marked with `'use client'` directive at the top of the file.
- Can use all React features: state, effects, event handlers, browser APIs.
- Their JavaScript is included in the client bundle.

**How they work together:**
- Server Components can import and render Client Components.
- Client Components CANNOT import Server Components directly, but can receive them as `children` or other props (the "donut" pattern).
- Data flows from Server Components down to Client Components as serializable props.

**The RSC Wire Format:**
When a Server Component renders, React serializes its output into a special streaming format (not HTML). The client-side React runtime reconstructs the component tree from this format, merging server-rendered sections with client-interactive sections.

**Benefits:**
- Zero-bundle-size components for static/data-fetching parts.
- Direct server resource access without API endpoints.
- Automatic code splitting.
- Streaming and progressive rendering.

**Mental model:** Think of the component tree as a mix of server and client zones. Server Components form the "skeleton" that fetches data and renders static UI. Client Components are "islands" of interactivity within that skeleton.

## Examples

**Input:** Product page with static details and interactive "Add to Cart" button
**Output:** Server Component fetches product data; Client Component handles the cart interaction
*Product data fetching code stays on the server. Only the interactive cart button ships JS to the client.*


## Solution

```js
// ============================================
// Server Component (default in Next.js App Router)
// File: app/products/[id]/page.tsx
// ============================================

// No 'use client' directive = Server Component
// This code NEVER reaches the client bundle

import { db } from '@/lib/database';
import { AddToCartButton } from './AddToCartButton'; // Client Component
import { ProductReviews } from './ProductReviews';   // Server Component

interface PageProps {
  params: { id: string };
}

// Server Component: directly queries the database
async function ProductPage({ params }: PageProps) {
  // Direct database access — no API route needed
  const product = await db.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>

      {/* Client Component for interactivity */}
      <AddToCartButton productId={product.id} price={product.price} />

      {/* Server Component: fetches reviews on the server */}
      <ProductReviews productId={product.id} />
    </div>
  );
}

export default ProductPage;

// ============================================
// Client Component
// File: app/products/[id]/AddToCartButton.tsx
// ============================================
'use client'; // <-- This directive marks it as a Client Component

import { useState } from 'react';

interface AddToCartButtonProps {
  productId: string;
  price: number;
}

export function AddToCartButton({ productId, price }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    await fetch('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
    setIsAdding(false);
  };

  return (
    <div>
      <select
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <p>Total: ${price * quantity}</p>
      <button onClick={handleAddToCart} disabled={isAdding}>
        {isAdding ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  );
}

// ============================================
// Server Component with async data
// File: app/products/[id]/ProductReviews.tsx
// ============================================

// No 'use client' = Server Component
import { db } from '@/lib/database';

async function ProductReviews({ productId }: { productId: string }) {
  // This database query runs on the server only
  const reviews = await db.review.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <section>
      <h2>Reviews ({reviews.length})</h2>
      {reviews.map((review) => (
        <div key={review.id} style={{ borderBottom: '1px solid #eee', padding: 8 }}>
          <strong>{review.author}</strong>
          <span> {'★'.repeat(review.rating)}</span>
          <p>{review.content}</p>
        </div>
      ))}
    </section>
  );
}

export { ProductReviews };

// ============================================
// The "Donut" Pattern: Passing Server Components as children
// ============================================

// Client Component that provides interactive layout
// File: components/InteractiveLayout.tsx
'use client';

import { useState, ReactNode } from 'react';

export function Sidebar({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside style={{ width: isOpen ? 250 : 50 }}>
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Collapse' : 'Expand'}
      </button>
      {isOpen && children} {/* Server-rendered content passed as children */}
    </aside>
  );
}

// Server Component that uses the Client layout
// File: app/layout.tsx
import { Sidebar } from '@/components/InteractiveLayout';
import { db } from '@/lib/database';

async function AppLayout({ children }: { children: ReactNode }) {
  const navItems = await db.navItem.findMany();

  return (
    <div style={{ display: 'flex' }}>
      {/* Client Component wraps server-rendered content */}
      <Sidebar>
        <nav>
          {navItems.map((item) => (
            <a key={item.id} href={item.path}>
              {item.label}
            </a>
          ))}
        </nav>
      </Sidebar>
      <main>{children}</main>
    </div>
  );
}

export default AppLayout;
```
