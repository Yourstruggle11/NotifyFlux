# Authorization

- **Roles**
  - `admin`: full tenant-level control (users, service tokens, notifications).
  - `user`: read/mark notifications and view own profile.
  - `service`: may create notifications but cannot read user data.
- **Enforcement**
  - Middleware ensures `req.params.tenantId` matches the JWT tenant.
  - Route guards require roles; user routes verify user access to self-only resources unless admin.
  - Socket connections reject mismatched tenants or missing roles.
- **Principles**
  - Deny by default; explicit allowlists per route.
  - Tenant boundary is strictly enforced in every DB query and room emission.

## Permission matrix (summary)
| Capability | admin | user | service |
| --- | --- | --- | --- |
| Create users | yes | no | no |
| Read own profile | yes | yes | no |
| Create notification | yes | no | yes |
| Read notifications | yes | yes (self) | no |
| Mark all seen | yes | yes (self) | no |
| Emit system event | yes | no | no |
| Seed demo data | yes | no | no |
