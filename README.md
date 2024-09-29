# Pixel Art Editor

Ein 2D-Sprite-Editing-Tool, das die Erstellung von Sprites und deren Zusammensetzung in Karten ermöglicht. Es vereint den SpriteEditor zur Animationserstellung und den MapEditor zur Level- und Szenengestaltung für 2D-Spiele in einer integrierten Umgebung.

## Voraussetzungen

- Node.js
- Live Server Erweiterung (z.B. für Visual Studio Code)

## Backend starten

1. Gehen Sie in das Stammverzeichnis des Projekts.

2. Führen Sie den folgenden Befehl in der Konsole aus, um den Backend-Server zu starten:

   ```bash
   node backend/server.js
   ```

## Frontend starten

1. Starten Sie die Anwendung, indem Sie **Live Server** in Ihrem VS Code starten.

2. Öffnen Sie im Browser das Hauptverzeichnis unter dem Pfad: `frontend/EditorTool`.

Falls sich der Browser nicht automatisch öffnet, navigieren Sie manuell zu:
`http://localhost:{LiveServer-Port}/frontend/EditorTool/`, wobei `{LiveServer-Port}` der von Live Server verwendete Port ist.

Hinweis: Achten Sie darauf, dass Frontend und Server nicht auf demselben Port gestartet werden, um Portkonflikte zu vermeiden.
