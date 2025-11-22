# Gateway API Reference

API documentation for the Gateway Service (Port 8000).

## Base URL

```
http://localhost:8000
```

## Overview

The Gateway service acts as the main entry point and orchestrator for the Artistry platform. It coordinates requests between services, manages data persistence, and provides health monitoring.

---

## Endpoints

### Health Check

#### `GET /`

Simple health check endpoint.

**Response:**
```json
{
  "message": "Gateway service is running",
  "status": "healthy"
}
```

**Status Codes:**
- `200 OK` - Service is healthy

---

#### `GET /health`

Detailed health status with service checks.

**Response:**
```json
{
  "status": "healthy",
  "service": "gateway",
  "version": "2.0",
  "timestamp": "2025-11-22T10:30:00Z",
  "dependencies": {
    "mongodb": "connected",
    "detect_service": "available",
    "segment_service": "available",
    "advise_service": "available",
    "generate_service": "available"
  }
}
```

**Status Codes:**
- `200 OK` - All services healthy
- `503 Service Unavailable` - One or more services down

---

### Save Design (Future Feature)

#### `POST /designs/`

Save a complete design workflow result.

**Request:**
```json
{
  "user_id": "user123",
  "original_image": "base64_string_or_url",
  "detected_objects": [...],
  "segmentation_result": {...},
  "advice": [...],
  "generated_image": "base64_string_or_url",
  "prompt": "Modern minimalist bedroom"
}
```

**Response:**
```json
{
  "id": "design_abc123",
  "user_id": "user123",
  "created_at": "2025-11-22T10:30:00Z",
  "url": "/designs/design_abc123"
}
```

**Status Codes:**
- `201 Created` - Design saved successfully
- `400 Bad Request` - Invalid input
- `500 Internal Server Error` - Database error

---

### Get Design (Future Feature)

#### `GET /designs/{design_id}`

Retrieve a saved design by ID.

**Parameters:**
- `design_id` (path) - The design ID

**Response:**
```json
{
  "id": "design_abc123",
  "user_id": "user123",
  "original_image": "https://...",
  "detected_objects": [...],
  "segmentation_result": {...},
  "advice": [...],
  "generated_image": "https://...",
  "prompt": "Modern minimalist bedroom",
  "created_at": "2025-11-22T10:30:00Z"
}
```

**Status Codes:**
- `200 OK` - Design found
- `404 Not Found` - Design not found
- `500 Internal Server Error` - Database error

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "detail": "Error message description",
  "error_code": "SPECIFIC_ERROR_CODE",
  "timestamp": "2025-11-22T10:30:00Z"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `SERVICE_UNAVAILABLE` | 503 | Backend service is down |
| `INVALID_INPUT` | 400 | Malformed request data |
| `NOT_FOUND` | 404 | Resource not found |
| `DATABASE_ERROR` | 500 | MongoDB connection issue |
| `TIMEOUT` | 504 | Request timeout |

---

## Rate Limiting (Future)

```
100 requests per minute per IP
1000 requests per hour per API key
```

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1637582400
```

---

## Authentication (Future)

```http
Authorization: Bearer <jwt_token>
```

---

## CORS Configuration

**Allowed Origins:**
```
http://localhost:5173
http://127.0.0.1:5173
```

**Allowed Methods:**
```
GET, POST, PUT, DELETE, OPTIONS
```

**Allowed Headers:**
```
Content-Type, Authorization
```

---

## Testing

### cURL Examples

**Health Check:**
```bash
curl http://localhost:8000/health
```

**Save Design:**
```bash
curl -X POST http://localhost:8000/designs/ \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "prompt": "Modern bedroom"
  }'
```

### Python Example

```python
import requests

# Health check
response = requests.get("http://localhost:8000/health")
print(response.json())

# Save design
design_data = {
    "user_id": "user123",
    "prompt": "Modern bedroom",
    "detected_objects": [...]
}
response = requests.post(
    "http://localhost:8000/designs/",
    json=design_data
)
print(response.json())
```

### JavaScript Example

```javascript
// Health check
const health = await fetch('http://localhost:8000/health');
const data = await health.json();
console.log(data);

// Save design
const design = {
  user_id: 'user123',
  prompt: 'Modern bedroom'
};

const response = await fetch('http://localhost:8000/designs/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(design)
});
const result = await response.json();
console.log(result);
```

---

## Interactive Documentation

Access Swagger UI at: **http://localhost:8000/docs**

Features:
- Interactive API testing
- Request/response examples
- Schema definitions
- Try it out functionality

---

## Related Services

- [Detect API](./DETECT.md)
- [Segment API](./SEGMENT.md)
- [Advise API](./ADVISE.md)
- [Generate API](./GENERATE.md)

---

**[← Back to API Documentation](./README.md)** | **[← Back to Main Docs](../README.md)**
