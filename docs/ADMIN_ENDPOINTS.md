# Admin API Endpoints

MediBridge exposes a small admin surface for super-admin user approval workflows.

## Endpoints

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| `GET` | `/api/admin/pending-users` | `SUPER_ADMIN` | List users with `verificationStatus: PENDING` |
| `PATCH` | `/api/admin/users/:id/approve` | `SUPER_ADMIN` | Approve a pending user (`verificationStatus` → `APPROVED`, `isVerified` → `true`) |

## Response shapes

### `GET /api/admin/pending-users`

```json
{
  "success": true,
  "count": 2,
  "data": [/* User documents without password */]
}
```

### `PATCH /api/admin/users/:id/approve`

```json
{
  "success": true,
  "message": "User approved",
  "data": {/* updated User */}
}
```

## Frontend integration

- **Service:** `client/src/features/admin/services/admin.service.ts`
- **Hook:** `usePendingUsers`
- **UI:** `PendingUsersPanel` on the Users page (`/users`) for `SUPER_ADMIN` only

## Notes

- Doctor self-registration is auto-approved; pending users are typically hospital admins and referral coordinators awaiting super-admin review.
- No additional `PATCH /admin/*` routes exist beyond user approval at this time.
