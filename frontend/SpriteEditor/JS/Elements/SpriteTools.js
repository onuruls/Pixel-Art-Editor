import { SpriteEditorPart } from "./SpriteEditorPart.js";

export class SpriteTools extends SpriteEditorPart {
  constructor(sprite_editor) {
    super(sprite_editor);
  }

  render() {
    const palette_html = this.sprite_editor.palettes
      .map(
        (color, i) => `
      <input type="color" class="palette-color" data-index="${i}" value="${color}">
    `
      )
      .join("");
    return `
    <div class="pixel-size-options" title="Pixel size">
      <button class="pixel-size-option active" data-size="1">
        1x
      </button>
      <button class="pixel-size-option" data-size="2">
        2x
      </button>
      <button class="pixel-size-option" data-size="4">
        4x
      </button>
    </div>

    <div class="toolbox">
      <button
        id="pen"
        class="tool-button active"
        data-tool="pen"
        title="Pen tool (P)"
      >
        <img src="img/icons/pen.svg" alt="Pen" />
      </button>
      <button
        id="mirror_pen"
        class="tool-button"
        data-tool="mirror_pen"
        title="Mirror pen tool (M)"
      >
        <img src="img/icons/mirror_pen.svg" alt="Mirror Pen" />
      </button>
      <button
        id="bucket"
        class="tool-button"
        data-tool="bucket"
        title="Paint bucket tool (B)"
      >
        <img src="img/icons/bucket.svg" alt="Bucket" />
      </button>
      <button
        id="same_color"
        class="tool-button"
        data-tool="same_color"
        title="Paint all pixels of the same color (C)"
      >
        <img src="img/icons/same_color_bucket.svg" alt="Same Color Bucket" />
      </button>
      <button
        id="eraser"
        class="tool-button"
        data-tool="eraser"
        title="Eraser tool (E)"
      >
        <img src="img/icons/eraser.svg" alt="Eraser" />
      </button>
      <button
        id="stroke"
        class="tool-button"
        data-tool="stroke"
        title="Stroke tool (S)"
      >
        <img src="img/icons/stroke.svg" alt="Stroke" />
      </button>
      <button
        id="rectangle"
        class="tool-button"
        data-tool="rectangle"
        title="Rectangle tool (R)"
      >
        <img src="img/icons/rectangle.svg" alt="Rectangle" />
      </button>
      <button
        id="circle"
        class="tool-button"
        data-tool="circle"
        title="Circle tool (O)"
      >
        <img src="img/icons/circle.svg" alt="Circle" />
      </button>
      <button
        id="move"
        class="tool-button"
        data-tool="move"
        title="Move tool (V)"
      >
        <img src="img/icons/move.svg" alt="Move" />
      </button>
      <button
        id="shape_selection"
        class="tool-button"
        data-tool="shape_selection"
        title="Shape Selection (L)"
      >
        <img src="img/icons/fill_shape.svg" alt="Shape" />
      </button>
      <button
        id="rectangle_selection"
        class="tool-button"
        data-tool="rectangle_selection"
        title="Rectangle Selection (T)"
      >
        <img src="img/icons/rectangle_selection.svg" alt="Rectangle Selection" />
      </button>
      <button
        id="irregular_selection"
        class="tool-button"
        data-tool="irregular_selection"
        title="Irregular Selection (I)"
      >
        <img
          src="img/icons/irregular_selection.svg"
          alt="Irregular Selection"
        />
      </button>
      <button
        id="lighting"
        class="tool-button"
        data-tool="lighting"
        title="Lighten (H)"
      >
        <img src="img/icons/lighting.svg" alt="Lighting" />
      </button>
      <button
        id="dithering"
        class="tool-button"
        data-tool="dithering"
        title="Dithering (D)"
      >
        <img src="img/icons/dithering.svg" alt="Dithering" />
      </button>
      <button
        id="color_picker"
        class="tool-button"
        data-tool="color_picker"
        title="Color Picker (K)"
      >
        <img src="img/icons/color_picker.svg" alt="Color Picker" />
      </button>
      <input
        type="color"
        id="color_input"
        name="color_input"
        value="#000000"
      />
    </div>
    <div class="palettes" title="Color palettes (double click to use color)">
      ${palette_html}
    </div>
    `;
  }

  init() {
    const tool_buttons = document.querySelectorAll(".tool-button");
    tool_buttons.forEach((button) => {
      button.addEventListener("click", () => {
        tool_buttons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
      });
    });

    const pixelSizeOptions = document.querySelectorAll(".pixel-size-option");
    pixelSizeOptions.forEach((button) => {
      button.addEventListener("click", () => {
        pixelSizeOptions.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        this.sprite_editor.set_pixel_size(button.dataset.size);
      });
    });

    const palette_colors = this.querySelectorAll(".palette-color");
    palette_colors.forEach((palette) => {
      palette.addEventListener("click", () => {
        const index = palette.getAttribute("data-index");
        this.sprite_editor.palettes[index] = palette.value;
      });
      palette.addEventListener("dblclick", () => {
        palette.style.display = "none";
        setTimeout(() => {
          palette.style.display = "inline-block";
        }, 0);
        const color = palette.value;
        color_input.value = color;
        this.sprite_editor.selected_color =
          this.sprite_editor.hex_to_rgb_array(color);
      });
    });
  }
}

customElements.define("sprite-tools", SpriteTools);
