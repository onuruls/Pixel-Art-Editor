# Pixel Art Editor

A professional web-based tool for creating 2D sprites and designing tile maps for games.

## Features

- **Sprite Editor**: Pixel-perfect drawing, frames, palette management.
- **Map Editor**: Tile mapping, layers, tools (fill, shape), and minimap.
- **Project Management**: Organize assets in a hierarchical folder structure.
- **Portable**: SQLite-backed per-project storage, easy to move or backup.

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES Modules), HTML5 Canvas, CSS.
- **Backend**: Node.js, Express.
- **Database**: SQLite (via Sequelize).
- **Storage**: Local filesystem for media assets.

## Architecture

The application is a full-stack monolith. The **Frontend** is a Single Page Application (SPA) served by the **Backend**.

- **Backend**: REST API managing Projects, Folders, and Files. Stores metadata in SQLite and pixel data as PNGs in a local uploads directory.
- **Frontend**: Talks to the backend via `/api`.

## Quick Start (Local)

1.  **Backend Setup**

    ```bash
    cd backend
    npm install
    npm run dev
    ```

2.  **Access**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Quick Start (Docker)

1.  **Run**

    ```bash
    docker compose up --build
    ```

2.  **Access**
    Open [http://localhost:3000](http://localhost:3000).

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

## License

MIT License.
