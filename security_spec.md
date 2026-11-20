# Security Specification & Payload-First TDD (Firestore — Permanent Workspace)

## 1. Data Invariants
1. **Default Deny**: All unmatched paths in Firestore are denied (`allow read, write: if false`).
2. **Scoped Permanent Workspace**: Client access is strictly scoped to the single permanent workspace ID `primary` (`/workspaces/primary`). No arbitrary workspace creation, listing, or cross-tenant enumeration is permitted.
3. **Zero PII in Shared Workspace**: Personal email addresses and private user credentials are NOT stored in Firestore `/workspaces/primary`. Only non-PII workspace display fields (`name`, `avatar`, `timezone`, `role`) are stored.
4. **Master Gate on Subcollections**: Every task (`workspaces/primary/tasks/{taskId}`) and department (`workspaces/primary/departments/{deptId}`) requires the parent `workspaces/primary` document to exist (`exists(...)` / `existsAfter(...)`) and `workspaceId == 'primary'`.
5. **Immutable Identity & Timestamps**: `id`, `workspaceId`, and `createdAt` cannot be modified after creation. `createdAt` must equal `request.time` on create; `updatedAt` must equal `request.time` on create and update.
6. **Strict Schema & Bounds**: Unknown ("ghost") fields are rejected via `keys().hasOnly(...)` and `affectedKeys().hasOnly(...)`. All strings, IDs (`^[a-zA-Z0-9_-]+$`, `<= 128`), dates (`^\d{4}-\d{2}-\d{2}$`), enums, numbers, and arrays (`subtasks.size() <= 50`) are strictly bounded.
7. **Terminal State Locking**: Tasks in terminal state `cancelled` cannot be updated.
8. **Secure List Queries**: `allow list` on `tasks` and `departments` explicitly checks `workspaceId == 'primary' && resource.data.workspaceId == 'primary'`.

## 2. The "Dirty Dozen" Adversarial Payloads (Expected: PERMISSION_DENIED)
1. **Arbitrary Root Collection Write**: Writing to `/users/u1` or `/admins/a1` (blocked by default deny).
2. **Unauthorized Workspace ID**: Creating or reading `/workspaces/other-workspace` (blocked by `workspaceId == 'primary'`).
3. **Workspace Enumeration**: Listing `/workspaces` (`allow list: if false`).
4. **Ghost Field Injection (Shadow Update)**: Updating `workspaces/primary/tasks/t1` with an extra field `{ isAdmin: true }`.
5. **WorkspaceId Spoofing**: Creating `workspaces/primary/tasks/t1` with `workspaceId: "other"`.
6. **ID Poisoning**: Creating `workspaces/primary/tasks/bad$id` or a 200-char task ID exceeding `isValidId()`.
7. **Denial-of-Wallet String Bloat**: Creating a task with a 10,000-character `title` or `description`.
8. **Immutable Field Tampering**: Updating `createdAt` or `workspaceId` on an existing task.
9. **Client Clock Forgery**: Creating a task with a custom past/future `createdAt` instead of `request.time`.
10. **Invalid Enum Injection**: Creating a task with `outline: "Personal"` or `status: "hacked"`.
11. **Unbounded Array / Invalid Subtask Element**: Writing `subtasks` with 51+ entries or malformed first element.
12. **Terminal State Mutation**: Updating a task after its status is `'cancelled'`.
