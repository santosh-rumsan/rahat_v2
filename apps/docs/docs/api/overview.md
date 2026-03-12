---
sidebar_position: 1
---

# API Overview

This section documents the Rahat v2 REST API endpoints. Each page covers one resource group, listing available endpoints with their HTTP method, path, request parameters, and response shape.

## Base URL

```
/api/v1
```

## Authentication

All endpoints require a valid session token passed as a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Response format

Successful responses return JSON with an HTTP `2xx` status. Errors follow this shape:

```json
{
  "error": "string description",
  "statusCode": 400
}
```

## Endpoint groups

| Group | Description |
|-------|-------------|
| [Projects](./projects) | Create, read, update, and delete relief projects |
| [Users](./users) | Manage staff accounts and role assignments |
| [Vendors](./vendors) | Manage vendors participating in distributions |
| [Services](./services) | Configure SMS, IVR, and token distribution services |
| [Fund Management](./fund-management) | Treasury operations, allocations, and transactions |
