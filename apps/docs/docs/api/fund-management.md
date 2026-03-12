---
sidebar_position: 6
---

# Fund Management API

Treasury operations, project allocations, and transaction history.

## Endpoints

### Get treasury summary

```
GET /api/v1/funds/summary
```

**Response `200`**

```json
{
  "totalFunds": number,
  "allocated": number,
  "disbursed": number,
  "available": number
}
```

---

### List allocations

```
GET /api/v1/funds/allocations
```

**Query parameters**

| Name | Type | Description |
|------|------|-------------|
| `projectId` | string | Filter by project |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Response `200`**

```json
{
  "data": [
    {
      "id": "string",
      "projectId": "string",
      "amount": number,
      "createdAt": "ISO 8601"
    }
  ],
  "total": number,
  "page": number
}
```

---

### Create allocation

```
POST /api/v1/funds/allocations
```

**Request body**

```json
{
  "projectId": "string",
  "amount": number
}
```

**Response `201`** — created allocation object.

---

### List transactions

```
GET /api/v1/funds/transactions
```

**Query parameters**

| Name | Type | Description |
|------|------|-------------|
| `projectId` | string | Filter by project |
| `type` | string | `allocation \| disbursement \| redemption` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Response `200`**

```json
{
  "data": [
    {
      "id": "string",
      "type": "string",
      "amount": number,
      "projectId": "string",
      "createdAt": "ISO 8601"
    }
  ],
  "total": number,
  "page": number
}
```
