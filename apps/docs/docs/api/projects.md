---
sidebar_position: 2
---

# Projects API

Manage relief projects.

## Endpoints

### List projects

```
GET /api/v1/projects
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
      "status": "active | completed | archived",
      "budget": number,
      "createdAt": "ISO 8601"
    }
  ],
  "total": number,
  "page": number
}
```

---

### Get project

```
GET /api/v1/projects/:id
```

**Response `200`** — single project object (see above).

---

### Create project

```
POST /api/v1/projects
```

**Request body**

```json
{
  "name": "string",
  "budget": number,
  "description": "string"
}
```

**Response `201`** — created project object.

---

### Update project

```
PATCH /api/v1/projects/:id
```

**Request body** — any subset of the create body fields.

**Response `200`** — updated project object.

---

### Delete project

```
DELETE /api/v1/projects/:id
```

**Response `204`** — no content.
