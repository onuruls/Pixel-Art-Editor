# Pixel Art Editor

A web-based tool for creating 2D sprites and tile maps for games.

## Features

- **Sprite Editor**: Pixel-perfect drawing, animation frames, and palette management
- **Map Editor**: Tile-based level design with layers and editing tools
- **AI Sprite Generator**: Create pixel-art sprites from text prompts using Stable Diffusion
- **Project Management**: Organize assets in folders within projects

## Tech Stack

- Frontend: Vanilla JavaScript, HTML5 Canvas, CSS
- Backend: Node.js + Express
- Database: SQLite
- AI: Hugging Face Stable Diffusion XL

## Getting Started

**With Docker (recommended):**
```bash
docker compose up --build
```

**Without Docker:**
```bash
cd backend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Examples

**List Projects**

```bash
curl http://localhost:3000/api/projects
```

**Create Project**

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "MyRPG"}'
```

## Configuration

Environment variables can be set in `docker-compose.yml` or a `.env` file (not included by default).

| Variable      | Default | Description                                              |
| ------------- | ------- | -------------------------------------------------------- |
| `PORT`        | `3000`  | Port to listen on.                                       |
| `DATA_DIR`    | `.data` | Directory for DB and Uploads.                            |
| `CORS_ORIGIN` | _Empty_ | Comma-separated allowed origins. CORS disabled if empty. |

## Troubleshooting

**Database Corruption**

If the server fails to start with a database error, reset the database:

```bash
rm backend/.data/database.db
# Then restart the server
```

## Project Structure

```
.
├── backend/            # Node.js Express Server
│   ├── db/             # Database Logic & Services
│   ├── .data/          # Runtime data (ignored by git)
│   └── server.js       # Entry point
├── frontend/           # Vanilla JS Frontend
├── docs/               # Documentation
└── docker-compose.yml  # Docker orchestration
```

## AI Sprite Generator

Uses Stable Diffusion XL to generate pixel-art sprites from text descriptions.

**Setup:**
1. Get a free [Hugging Face](https://huggingface.co) API token
2. Set environment variable: `HF_API_TOKEN=your_token_here`

**Usage:**
Click the AI icon in the Sprite Editor, type what you want ("red dragon", "health potion", etc.), and hit generate.

**API:**
```bash
curl -X POST http://localhost:3000/api/ai/generate-sprite \
  -H "Content-Type: application/json" \
  -d '{"prompt": "red potion bottle", "folderId": 1, "palette": 32}'
```

Options: `prompt` (required), `folderId` (required), `palette` (16/32/64), `removeBackground` (true/false)

> First request may take 30-60s due to model loading on free tier.

## License

MIT License.
