# Pixel Art Editor

A web-based tool for creating 2D sprites and tile maps for games.

## Features

- 🎨 **Sprite Editor** — Pixel-perfect drawing with animation frames and palette management
- 🗺️ **Map Editor** — Tile-based level design with layers and editing tools
- 🤖 **AI Sprite Generator** — Create pixel-art sprites from text prompts using Stable Diffusion
- 📁 **Project Management** — Organize assets in folders within projects

## Architecture

```
┌─────────────┐     HTTP/JSON     ┌──────────────────┐
│   Frontend  │ ◄───────────────► │     Backend      │
│  (Vanilla)  │                   │   (Express.js)   │
└─────────────┘                   └────────┬─────────┘
                                           │
                                  ┌────────▼─────────┐
                                  │     SQLite       │
                                  │  + File Storage  │
                                  └──────────────────┘
                                           │
                                  ┌────────▼─────────┐
                                  │  Hugging Face    │
                                  │  Stable Diffusion│
                                  └──────────────────┘
```

- **Frontend**: Vanilla JavaScript, HTML5 Canvas API
- **Backend**: Node.js + Express, Sequelize ORM
- **Database**: SQLite for metadata
- **Storage**: Local filesystem for PNG assets
- **AI**: Hugging Face Stable Diffusion XL (optional)

## Quick Start

### Prerequisites

- Node.js 18+
- Docker (optional, recommended)

### Using Docker (Recommended)

```bash
docker compose up --build
```

Open http://localhost:3000 in your browser.

### Without Docker

```bash
cd backend
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## API Reference

### Projects

**List all projects:**
```bash
curl http://localhost:3000/api/projects
```

**Create a project:**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "MyRPG"}'
```

### Folders

**Get folder contents:**
```bash
curl http://localhost:3000/api/folders/1
```

**Create subfolder:**
```bash
curl -X POST http://localhost:3000/api/projects/folders \
  -H "Content-Type: application/json" \
  -d '{"folder_id": 1, "folder_name": "Characters"}'
```

### AI Sprite Generation

**Generate sprite from prompt:**
```bash
curl -X POST http://localhost:3000/api/ai/generate-sprite \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "red potion bottle",
    "folderId": 1,
    "palette": 32
  }'
```

**Response:**
```json
{
  "file": {
    "id": 5,
    "name": "ai_sprite",
    "url": "/uploads/abc-123.png",
    "folderId": 1,
    "type": "png"
  },
  "meta": {
    "model": "stabilityai/stable-diffusion-xl-base-1.0",
    "generatedAt": "2024-01-15T10:30:00.000Z",
    "palette": 32,
    "size": 64
  }
}
```

### API Parameters

| Parameter          | Type    | Default | Description                         |
| ------------------ | ------- | ------- | ----------------------------------- |
| `prompt`           | string  | —       | Required. Text description          |
| `folderId`         | number  | —       | Required. Target folder ID          |
| `palette`          | number  | 32      | Color count: 16, 32, or 64          |
| `removeBackground` | boolean | false   | Remove background via corner sample |
| `seed`             | number  | random  | Seed for reproducibility            |

## Configuration

### Backend Environment Variables

| Variable        | Default | Description                          |
| --------------- | ------- | ------------------------------------ |
| `PORT`          | 3000    | Server port                          |
| `DATA_DIR`      | .data   | Directory for database and uploads   |
| `CORS_ORIGIN`   | —       | Allowed origins (comma-separated)    |
| `HF_API_TOKEN`  | —       | Hugging Face API token (for AI)      |
| `HF_MODEL_ID`   | sdxl    | Stable Diffusion model ID            |

Create a `.env` file in the `backend/` directory (see `.env.example`):

```env
PORT=3000
HF_API_TOKEN=your_token_here
```

## AI Sprite Generator Setup

The AI feature requires a free Hugging Face API token:

1. Sign up at [huggingface.co](https://huggingface.co)
2. Go to Settings → Access Tokens
3. Create a token with "Read" permission
4. Set it as `HF_API_TOKEN` in your environment

**Note:** First generation may take 30-60s due to model loading on free tier.

## Troubleshooting

### Database Corruption

If the server fails to start with a database error:

```bash
rm backend/.data/database.db
# Then restart
```

The application now auto-recovers from database corruption.

### Docker Permission Issues

If you encounter permission errors with Docker volumes:

```bash
sudo chown -R $USER:$USER backend/.data
```

## Project Structure

```
├── backend/
│   ├── db/                 # Database models & services
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic (HF client, image processing)
│   ├── .data/              # Runtime data (gitignored)
│   │   ├── database.db     # SQLite database
│   │   └── uploads/        # Generated sprites
│   └── server.js           # Entry point
├── frontend/
│   ├── EditorTool/         # Main editor UI
│   ├── SpriteEditor/       # Sprite canvas & tools
│   ├── MapEditor/          # Tilemap editor
│   └── FileArea/           # Project file browser
├── docs/
│   └── features.md         # Feature documentation
├── docker-compose.yml
└── README.md
```

## Authors

- Onur
- Matz
- Markus

## License

MIT License
