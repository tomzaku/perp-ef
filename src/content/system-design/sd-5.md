---
id: sd-5
title: Role-Based Access Control (RBAC)
category: System Design
subcategory: Authentication
difficulty: Medium
pattern: Authorization
companies: [Amazon, Google, Microsoft]
timeComplexity: "O(r * p) where r = user roles, p = permissions per role"
spaceComplexity: O(n) where n = total permissions across all roles
keyTakeaway: RBAC maps users → roles → permissions. Always enforce on the server (frontend checks are for UX only). Support wildcards for admin roles and resource-level grouping.
similarProblems: [ABAC, JWT Claims, Route Guards]
---

**RBAC** assigns permissions to roles, and roles to users. Instead of checking "can user X do action Y on resource Z" directly, you check "does user X have a role that grants permission Y?"

**Components:**
- **Users** — individual accounts
- **Roles** — named sets of permissions (admin, editor, viewer)
- **Permissions** — specific actions (create:post, delete:user, read:analytics)

**Frontend RBAC needs:**
- Route guards (redirect unauthorized users)
- UI element visibility (hide admin buttons from viewers)
- API-level enforcement (server is the source of truth)

Implement an RBAC system with route guards and permission checks.

## Solution

```js
// ════════════════════════════════════════════
// RBAC Permission System
// ════════════════════════════════════════════

class RBAC {
  #roles = new Map();

  defineRole(roleName, permissions) {
    this.#roles.set(roleName, new Set(permissions));
    return this;
  }

  // Check if a role has a specific permission
  hasPermission(roleName, permission) {
    const perms = this.#roles.get(roleName);
    if (!perms) return false;
    // Support wildcard: 'posts:*' matches 'posts:create'
    if (perms.has(permission)) return true;
    if (perms.has('*')) return true;
    const [resource] = permission.split(':');
    return perms.has(resource + ':*');
  }

  // Check if user (with roles) can perform action
  can(userRoles, permission) {
    return userRoles.some(role => this.hasPermission(role, permission));
  }

  getRolePermissions(roleName) {
    return [...(this.#roles.get(roleName) || [])];
  }
}

// Define roles and permissions
const rbac = new RBAC();
rbac
  .defineRole('admin', ['*']) // Admin can do everything
  .defineRole('editor', [
    'posts:create', 'posts:read', 'posts:update', 'posts:delete',
    'comments:create', 'comments:read', 'comments:update', 'comments:delete',
    'media:upload', 'media:read',
  ])
  .defineRole('author', [
    'posts:create', 'posts:read', 'posts:update',
    'comments:create', 'comments:read',
    'media:upload', 'media:read',
  ])
  .defineRole('viewer', [
    'posts:read',
    'comments:read',
    'media:read',
  ]);

// Check permissions
const user = { id: 1, name: 'Alice', roles: ['editor'] };
console.log(rbac.can(user.roles, 'posts:create'));  // true
console.log(rbac.can(user.roles, 'users:delete'));   // false

// ════════════════════════════════════════════
// React Route Guard (conceptual)
// ════════════════════════════════════════════

// function ProtectedRoute({ children, permission }) {
//   const { user } = useAuth();
//   if (!user) return <Navigate to="/login" />;
//   if (permission && !rbac.can(user.roles, permission)) {
//     return <Navigate to="/unauthorized" />;
//   }
//   return children;
// }
//
// <Route path="/admin" element={
//   <ProtectedRoute permission="admin:access">
//     <AdminPanel />
//   </ProtectedRoute>
// } />

// ════════════════════════════════════════════
// Permission-based UI rendering
// ════════════════════════════════════════════

// function usePermission(permission) {
//   const { user } = useAuth();
//   return user ? rbac.can(user.roles, permission) : false;
// }
//
// function PostActions({ post }) {
//   const canEdit = usePermission('posts:update');
//   const canDelete = usePermission('posts:delete');
//   return (
//     <div>
//       {canEdit && <button>Edit</button>}
//       {canDelete && <button>Delete</button>}
//     </div>
//   );
// }

// ════════════════════════════════════════════
// Middleware (server-side enforcement)
// ════════════════════════════════════════════

function requirePermission(permission) {
  return function middleware(req) {
    const userRoles = req.user?.roles || [];
    if (!rbac.can(userRoles, permission)) {
      return { status: 403, error: 'Forbidden: missing permission ' + permission };
    }
    return { status: 200, allowed: true };
  };
}

const check = requirePermission('posts:delete');
console.log(check({ user: { roles: ['viewer'] } }));  // { status: 403, ... }
console.log(check({ user: { roles: ['admin'] } }));   // { status: 200, allowed: true }
```

## ELI5

Imagine a museum with different types of staff badges.

**Without RBAC:**
Every staff member has their own list of what they can do. When they get promoted, you update 50 different places. When someone new joins, you check every permission manually.

**With RBAC:**
Instead of tracking individuals, you track **badge colors** (roles). The badge color determines what doors open.

```
Museum badges:

  🔵 Visitor badge  → can see: exhibits, gift shop, cafeteria
  🟡 Staff badge    → can see: exhibits, backstage, storage
  🔴 Manager badge  → can see: everything + control room + safe

When a new staff member joins:
  Give them a 🟡 Staff badge → automatically gets all staff permissions
  No need to list every single room they can access!

When permissions change:
  Update the 🟡 badge rules → ALL staff members get updated instantly
```

**Frontend RBAC is for UX only** — hiding buttons and redirecting unauthorized routes. The **real enforcement** is always on the server.

```
Frontend: hides the "Delete User" button if you're not an admin
  → But a hacker could still send DELETE /api/users/5 manually!

Server: checks your role on every request
  → Even if the button is hidden, the server says "403 Forbidden"

Both layers work together:
  Frontend = better user experience (no confusing buttons)
  Server   = actual security (can't bypass with DevTools)
```
