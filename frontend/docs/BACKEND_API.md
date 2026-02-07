# Backend API for Elections & Candidates

To store candidates (and their images) on your backend instead of localStorage, set the backend base URL and implement this API.

## Configuration

In the frontend project root, create or edit `.env`:

```env
VITE_API_URL=https://your-backend.example.com
```

(No trailing slash. Omit or leave empty to use local-only storage.)

## Endpoint: Add candidate (with image)

**Request**

- **Method:** `POST`
- **URL:** `/api/elections/:electionId/candidates`
- **Content-Type:** `multipart/form-data`

**Form fields**

| Field        | Type   | Required | Description              |
|-------------|--------|----------|--------------------------|
| `name`      | string | Yes      | Candidate name           |
| `description` | string | No     | Short description/party   |
| `image`     | file   | Yes      | Image file (e.g. JPG, PNG) |

**Response (e.g. 201 Created)**

JSON body with the created candidate. The frontend accepts either shape:

```json
{
  "candidate": {
    "id": "c-1",
    "name": "Jane Doe",
    "description": "Independent",
    "imageUrl": "https://your-backend.example.com/uploads/candidates/abc123.jpg"
  }
}
```

or:

```json
{
  "id": "c-1",
  "name": "Jane Doe",
  "description": "Independent",
  "imageUrl": "https://your-backend.example.com/uploads/candidates/abc123.jpg"
}
```

- `id`: unique candidate id (string)
- `name`: candidate name
- `description`: optional
- `imageUrl`: **required** – public URL where the uploaded image can be loaded (e.g. after storing the file on disk or S3 and returning its URL)

**Backend implementation notes**

1. Validate `electionId` and that the election exists and is in Draft.
2. Validate `name` and `image` are present; validate `image` is an allowed image type/size.
3. Store the uploaded file (e.g. in `uploads/`, or cloud storage) and generate a public URL.
4. Persist the candidate (id, name, description, imageUrl) and associate it with the election.
5. Return the candidate object (with `imageUrl`) in the response as above.

## Optional: Read elections from backend

If you want the frontend to load elections from the backend instead of localStorage, you can implement:

- `GET /api/elections?includeDraft=true|false` → returns array of elections (each with `id`, `name`, `description`, `status`, `startAt`, `endsAt`, `candidates[]`, etc.).
- `GET /api/elections/:id` → returns one election.

The frontend module `src/lib/api.js` exposes `fetchElectionsFromBackend` and `fetchElectionFromBackend` for future use when you switch the app to use the backend as the source of truth.
