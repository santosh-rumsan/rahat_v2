---
sidebar_position: 5
---

# Services API

Configure SMS, IVR, and token distribution services.

## Endpoints

### List services

```
GET /api/v1/services
```

**Response `200`**

```json
{
  "data": [
    {
      "id": "string",
      "type": "sms | ivr | token",
      "name": "string",
      "status": "active | inactive",
      "createdAt": "ISO 8601"
    }
  ]
}
```

---

### Get service

```
GET /api/v1/services/:id
```

**Response `200`** — single service object (see above).

---

### Create service

```
POST /api/v1/services
```

**Request body**

```json
{
  "type": "sms | ivr | token",
  "name": "string",
  "config": {}
}
```

The `config` object shape depends on `type`. Refer to the service-specific configuration guide.

**Response `201`** — created service object.

---

### Update service

```
PATCH /api/v1/services/:id
```

**Request body** — any subset of the create body fields.

**Response `200`** — updated service object.

---

### Delete service

```
DELETE /api/v1/services/:id
```

**Response `204`** — no content.
