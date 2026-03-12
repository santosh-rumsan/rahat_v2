---
sidebar_position: 3
---

# Users API

Manage staff accounts and role assignments.

## Endpoints

### List users

```
GET /api/v1/users
```

**Query parameters**

| Name | Type | Description |
|------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |
| `role` | string | Filter by role |

**Response `200`**

```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "createdAt": "ISO 8601"
    }
  ],
  "total": number,
  "page": number
}
```

---

### Get user

```
GET /api/v1/users/:id
```

**Response `200`** — single user object (see above).

---

### Create user

```
POST /api/v1/users
```

**Request body**

```json
{
  "name": "string",
  "email": "string",
  "role": "string",
  "password": "string"
}
```

**Response `201`** — created user object.

---

### Update user

```
PATCH /api/v1/users/:id
```

**Request body** — any subset of the create body fields (excluding `password`).

**Response `200`** — updated user object.

---

### Delete user

```
DELETE /api/v1/users/:id
```

**Response `204`** — no content.
