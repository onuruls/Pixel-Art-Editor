import { SpriteEditorPart } from "./SpriteEditorPart.js";
import { Util } from "../../../Util/Util.js";

export class SpriteTools extends SpriteEditorPart {
  constructor(sprite_editor) {
    super(sprite_editor);
  }

  render() {
    const palette_html = this.sprite_editor.palettes
      .map(
        (color, i) => `
        <input type="color" class="palette-color" data-index="${i}" value="${color}" 
        data-info='[" Color palette", "SHIFT to set palette to primary color", "CTRL to open color selector"]'>
      `
      )
      .join("");
    return `
    <div class="pixel-size-options" title="Pixel size">
      <button class="pixel-size-option active" id="size_1" data-size="1" data-info='[" 1px size"]'>
        <div class="bg"/>
      </button>
      <button class="pixel-size-option" id="size_2" data-size="2" data-info='[" 2px size"]'>
        <div class="bg"/>
      </button>
      <button class="pixel-size-option" id="size_3" data-size="4" data-info='[" 4px size"]'>
        <div class="bg"/>
      </button>
    </div>

    <div class="toolbox">
      <button
        id="pen"
        class="tool-button active"
        data-tool="pen"
        data-info='["(P) Pen tool"]'
      >
        <img src="img/icons/pen.svg" alt="Pen" />
      </button>
      <button
        id="mirror_pen"
        class="tool-button"
        data-tool="mirror_pen"
        data-info='["(M) Mirror Pen", "SHIFT for horizontal axis", "CTRL for both axis"]'
      >
        <img src="img/icons/mirror_pen.svg" alt="Mirror Pen" />
      </button>
      <button
        id="bucket"
        class="tool-button"
        data-tool="bucket"
        data-info='["(B) Bucket tool"]'
      >
        <img src="img/icons/bucket.svg" alt="Bucket" />
      </button>
      <button
        id="same_color"
        class="tool-button"
        data-tool="same_color"
        data-info='["(N) Paint all pixels of same color"]'
      >
        <img src="img/icons/same_color_bucket.svg" alt="Same Color Bucket" />
      </button>
      <button
        id="eraser"
        class="tool-button"
        data-tool="eraser"
        data-info='["(E) Eraser"]'
      >
        <img src="img/icons/eraser.svg" alt="Eraser" />
      </button>
      <button
        id="stroke"
        class="tool-button"
        data-tool="stroke"
        data-info='["(S) Stroke", "SHIFT for straight line"]'
      >
        <img src="img/icons/stroke.svg" alt="Stroke" />
      </button>
      <button
        id="rectangle"
        class="tool-button"
        data-tool="rectangle"
        data-info='["(R) Rectangle tool", "SHIFT for square"]'
      >
        <img src="img/icons/rectangle.svg" alt="Rectangle" />
      </button>
      <button
        id="circle"
        class="tool-button"
        data-tool="circle"
        data-info='["(C) Circle tool", "SHIFT for circle"]'
      >
        <img src="img/icons/circle.svg" alt="Circle" />
      </button>
      <button
        id="move"
        class="tool-button"
        data-tool="move"
        data-info='["(V) Move tool"]'
      >
        <img src="img/icons/move.svg" alt="Move" />
      </button>
      <button
        id="shape_selection"
        class="tool-button"
        data-tool="shape_selection"
        data-info='["(Q) Shape Selection"]'
      >
        <img src="img/icons/fill_shape.svg" alt="Shape" />
      </button>
      <button
        id="rectangle_selection"
        class="tool-button"
        data-tool="rectangle_selection"
        data-info='["(T) Rectangle Selection"]'
      >
        <img src="img/icons/rectangle_selection.svg" alt="Rectangle Selection" />
      </button>
      <button
        id="irregular_selection"
        class="tool-button"
        data-tool="irregular_selection"
        data-info='["(I) Irregular Selection"]'
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
        data-info='["(L) Lighten", "SHIFT for darken"]'
      >
        <img src="img/icons/lighting.svg" alt="Lighting" />
      </button>
      <button
        id="dithering"
        class="tool-button"
        data-tool="dithering"
        data-info='["(D) Dithering"]'
      >
        <img src="img/icons/dithering.svg" alt="Dithering" />
      </button>
      <button
        id="color_picker"
        class="tool-button"
        data-tool="color_picker"
        data-info='["(O) Color Picker"]'
      >
        <img src="img/icons/color_picker.svg" alt="Color Picker" />
      </button>
    </div>
    <div class="color-selection">
      <input
        type="color"
        class="color-input"
        id="color_input"
        name="color_input"
        value="#000000"
        data-info='[" Primary color - left mouse button"]'
      />
      <button class="swap-btn">
        <i class="fa-solid fa-right-left"></i>
      </button>
      <input
        type="color"
        class="color-input"
        id="secondary_color_input"
        name="secondary_color_input"
        value="#ffffff"
        data-info='[" Secondary color - right mouse button"]'
      />
    </div>
    <div class="palettes">
      ${palette_html}
    </div>
    `;
  }

  init() {
    const tool_buttons = document.querySelectorAll(".tool-button");
    tool_buttons.forEach((button) => {
      const tool_info_string = button.getAttribute("data-info");
      const tool_info = JSON.parse(tool_info_string);
      Util.create_tool_info(button, tool_info);

      button.addEventListener("click", () => {
        tool_buttons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
      });
    });

    const pixel_size_options = document.querySelectorAll(".pixel-size-option");
    pixel_size_options.forEach((button) => {
      const pixel_info_string = button.getAttribute("data-info");
      const pixel_info = JSON.parse(pixel_info_string);
      Util.create_tool_info(button, pixel_info);
      button.addEventListener("click", () => {
        pixel_size_options.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        this.sprite_editor.set_pixel_size(button.dataset.size);
      });
    });

    const palette_colors = this.querySelectorAll(".palette-color");
    palette_colors.forEach((palette) => {
      const palette_info_string = palette.getAttribute("data-info");
      const palette_info = JSON.parse(palette_info_string);
      Util.create_tool_info(palette, palette_info);
      palette.addEventListener("click", (event) => {
        const index = palette.getAttribute("data-index");
        if (event.ctrlKey) {
          this.sprite_editor.palettes[index] = palette.value;
        } else if (event.shiftKey) {
          this.hide_color_input(palette);
          const color = this.sprite_editor.selected_color;
          const hex_color = this.sprite_editor.rgb_array_to_hex(color);
          this.sprite_editor.palettes[index] = hex_color;
          palette.value = hex_color;
        } else {
          this.hide_color_input(palette);
          const color = palette.value;
          color_input.value = color;
          this.sprite_editor.selected_color =
            this.sprite_editor.hex_to_rgb_array(color);
        }
      });

      palette.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        const color = palette.value;
        const secondary_color_input = document.querySelector(
          "#secondary_color_input"
        );
        secondary_color_input.value = color;
        this.sprite_editor.secondary_color =
          this.sprite_editor.hex_to_rgb_array(color);
      });
    });

    const swap_button = document.querySelector(".swap-btn");
    const primary_color_input = document.querySelector("#color_input");
    const secondary_color_input = document.querySelector(
      "#secondary_color_input"
    );

    const primary_color_info = JSON.parse(
      primary_color_input.getAttribute("data-info")
    );
    primary_color_info.push(` ${primary_color_input.value}`);

    const secondary_color_info = JSON.parse(
      secondary_color_input.getAttribute("data-info")
    );
    secondary_color_info.push(` ${secondary_color_input.value}`);

    Util.create_tool_info(primary_color_input, primary_color_info);
    Util.create_tool_info(secondary_color_input, secondary_color_info);

    swap_button.addEventListener("click", () => {
      const primary_color = primary_color_input.value;
      primary_color_input.value = secondary_color_input.value;
      secondary_color_input.value = primary_color;

      this.sprite_editor.selected_color = this.sprite_editor.hex_to_rgb_array(
        primary_color_input.value
      );
      this.sprite_editor.secondary_color = this.sprite_editor.hex_to_rgb_array(
        secondary_color_input.value
      );
    });
  }

  hide_color_input(palette) {
    palette.style.display = "none";
    setTimeout(() => {
      palette.style.display = "inline-block";
    }, 0);
  }
}

customElements.define("sprite-tools", SpriteTools);
