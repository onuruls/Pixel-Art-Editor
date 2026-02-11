import { SpriteEditorPart } from "./SpriteEditorPart.js";

/**
 * AI Sprite Panel - Minimal popup for generating AI sprites
 */
export class AiSpritePanel extends SpriteEditorPart {
  constructor(sprite_editor) {
    super(sprite_editor);
    this.is_open = false;
    this.is_loading = false;

    this.toggle_panel = this.toggle_panel.bind(this);
    this.handle_generate = this.handle_generate.bind(this);
    this.handle_keydown = this.handle_keydown.bind(this);
    this.handle_click_outside = this.handle_click_outside.bind(this);
  }

  render() {
    return `
      <style>
        .ai-popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.9);
          background: #1a1a2e;
          border: 2px solid #e94560;
          border-radius: 12px;
          padding: 16px;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease;
          min-width: 320px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        .ai-popup.open {
          opacity: 1;
          visibility: visible;
          transform: translate(-50%, -50%) scale(1);
        }
        .ai-popup-title {
          color: #e94560;
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 12px 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ai-popup-title::before {
          content: '✨';
        }
        .ai-input-row {
          display: flex;
          gap: 8px;
        }
        .ai-prompt-input {
          flex: 1;
          padding: 10px 12px;
          background: rgba(0,0,0,0.4);
          border: 1px solid #0f3460;
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          outline: none;
        }
        .ai-prompt-input:focus {
          border-color: #e94560;
        }
        .ai-prompt-input::placeholder {
          color: #666;
        }
        .ai-submit-btn {
          padding: 10px 16px;
          background: linear-gradient(135deg, #e94560, #c23858);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .ai-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(233,69,96,0.4);
        }
        .ai-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .ai-submit-btn .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .ai-error {
          color: #e94560;
          font-size: 12px;
          margin-top: 8px;
          display: none;
        }
        .ai-error.visible {
          display: block;
        }
        .ai-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 999;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s;
        }
        .ai-overlay.open {
          opacity: 1;
          visibility: visible;
        }
      </style>
      <div class="ai-overlay"></div>
      <div class="ai-popup">
        <p class="ai-popup-title">AI Sprite Generator</p>
        <div class="ai-input-row">
          <input type="text" class="ai-prompt-input" placeholder="Describe your sprite...">
          <button class="ai-submit-btn">Generate</button>
        </div>
        <p class="ai-error"></p>
      </div>
    `;
  }

  init() {
    this.overlay = this.querySelector(".ai-overlay");
    this.popup = this.querySelector(".ai-popup");
    this.prompt_input = this.querySelector(".ai-prompt-input");
    this.submit_btn = this.querySelector(".ai-submit-btn");
    this.error_el = this.querySelector(".ai-error");

    this.submit_btn.addEventListener("click", this.handle_generate);
    this.prompt_input.addEventListener("keydown", this.handle_keydown);
    this.overlay.addEventListener("click", this.handle_click_outside);
  }

  handle_keydown(e) {
    if (e.key === "Enter" && !this.is_loading) {
      this.handle_generate();
    }
    if (e.key === "Escape") {
      this.close();
    }
  }

  handle_click_outside() {
    this.close();
  }

  toggle_panel() {
    if (this.is_open) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.is_open = true;
    this.overlay.classList.add("open");
    this.popup.classList.add("open");
    this.prompt_input.focus();
    this.error_el.classList.remove("visible");
  }

  close() {
    this.is_open = false;
    this.overlay.classList.remove("open");
    this.popup.classList.remove("open");
  }

  show_error(msg) {
    this.error_el.textContent = msg;
    this.error_el.classList.add("visible");
  }

  set_loading(loading) {
    this.is_loading = loading;
    this.submit_btn.disabled = loading;
    this.prompt_input.disabled = loading;
    this.submit_btn.innerHTML = loading 
      ? '<span class="spinner"></span>' 
      : 'Generate';
  }

  /**
   * Gets folder ID - uses current folder or project root folder
   */
  get_folder_id() {
    // Try current folder from file system handler
    const file_area = this.sprite_editor.editor_tool?.file_area;
    if (file_area?.file_system_handler?.current_folder?.id) {
      return file_area.file_system_handler.current_folder.id;
    }
    
    // Fallback: use project's root folder
    const project = this.sprite_editor.editor_tool?.project;
    if (project?.root_folder?.id) {
      return project.root_folder.id;
    }
    
    return null;
  }

  async handle_generate() {
    const prompt = this.prompt_input.value.trim();
    if (!prompt) {
      this.show_error("Please enter a prompt");
      return;
    }

    const folder_id = this.get_folder_id();
    if (!folder_id) {
      this.show_error("Please open a project first");
      return;
    }

    this.set_loading(true);
    this.error_el.classList.remove("visible");

    try {
      const response = await fetch("/api/ai/generate-sprite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          folderId: folder_id,
          palette: 32,
          removeBackground: true,
          fileName: `ai_${Date.now()}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      // Load into canvas
      await this.load_into_canvas(data.file.url);

      // Refresh folder view
      const file_area = this.sprite_editor.editor_tool?.file_area;
      if (file_area?.file_system_handler) {
        await file_area.file_system_handler.read_directory_content();
        file_area.file_view.rebuild_view();
      }

      // Close popup and clear input
      this.prompt_input.value = "";
      this.close();

    } catch (error) {
      this.show_error(error.message);
    } finally {
      this.set_loading(false);
    }
  }

  async load_into_canvas(url) {
    const img = new Image();
    img.crossOrigin = "anonymous";

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, 64, 64);

    const imageData = ctx.getImageData(0, 0, 64, 64);
    const pixels = imageData.data;

    // Build matrix
    const matrix = [];
    for (let y = 0; y < 64; y++) {
      const row = [];
      for (let x = 0; x < 64; x++) {
        const idx = (y * 64 + x) * 4;
        row.push([pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3]]);
      }
      matrix.push(row);
    }

    // Update canvas
    this.sprite_editor.start_action_buffer();

    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const prev = this.sprite_editor.canvas_matrix[y][x];
        const next = matrix[y][x];
        if (prev[0] !== next[0] || prev[1] !== next[1] || prev[2] !== next[2] || prev[3] !== next[3]) {
          this.sprite_editor.canvas_matrix[y][x] = next;
          this.sprite_editor.action_buffer.push({ x: y, y: x, prev_color: prev, color: next });
        }
      }
    }

    this.sprite_editor.end_action_buffer();
    this.sprite_editor.sprite_canvas.drawing_canvas.repaint_canvas();
    this.sprite_editor.update_frame_thumbnail();
  }
}

customElements.define("ai-sprite-panel", AiSpritePanel);
