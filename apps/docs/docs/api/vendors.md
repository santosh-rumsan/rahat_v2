---
sidebar_position: 4
---

# Vendors API

Manage vendors participating in aid distributions.

## Endpoints

### List vendors

```
GET /api/v1/vendors
```

**Query parameters**

| Name | Type | Description |
|------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Response `200`**

```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "phone": "string",
      "status": "active | inactive",
      "createdAt": "ISO 8601"
    }
  ],
  "total": number,
  "page": number
}
```

---

### Get vendor

```
GET /api/v1/vendors/:id
```

**Response `200`** — single vendor object (see above).

---

### Create vendor

```
POST /api/v1/vendors
```

**Request body**

```json
{
  "name": "string",
  "phone": "string",
  "address": "string"
}
```

**Response `201`** — created vendor object.

---

### Update vendor

```
PATCH /api/v1/vendors/:id
```

**Request body** — any subset of the create body fields.

**Response `200`** — updated vendor object.

---

### Delete vendor

```
DELETE /api/v1/vendors/:id
```

**Response `204`** — no content.
