# Santheri Blog — FastAPI Backend

FastAPI backend application connected to Neon.tech serverless PostgreSQL.

## Development with `uv`

```bash
# Synchronize environment and install dependencies
uv sync

# Run server with uv
uv run python main.py
```

## Endpoints

- `GET /api/status` - Neon database connection & post counts
- `GET /api/posts` - List published posts (filterable by `category` and `search`)
- `GET /api/posts/{slug}` - Fetch single post
- `POST /api/posts` - Create post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post
- `POST /api/upload` - Upload image files
