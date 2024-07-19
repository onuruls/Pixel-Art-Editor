import { SpriteEditorPart } from "./SpriteEditorPart.js";

export class SpriteTools extends SpriteEditorPart {
  constructor(sprite_editor) {
    super(sprite_editor);
  }

  render() {
    return `
      <h1 id="title">Sprite Editor</h1>
      <div class="toolbox">
        <button id="pen" class="tool-button active" data-tool="pen" title="Pen tool"><img src="img/icons/pen.svg" alt="Pen"></button>
        <button id="mirror_pen" class="tool-button" data-tool="mirror_pen" title="Mirror pen tool"><img src="img/icons/mirror_pen.svg" alt="Mirror Pen"></button>
        <button id="bucket" class="tool-button" data-tool="bucket" title="Paint bucket tool"><img src="img/icons/bucket.svg" alt="Bucket"></button>
        <button id="same_color" class="tool-button" data-tool="same_color" title="Paint all pixels of the same color"><img src="img/icons/same_color_bucket.svg" alt="Same Color Bucket"></button>
        <button id="eraser" class="tool-button" data-tool="eraser" title="Eraser tool"><img src="img/icons/eraser.svg" alt="Eraser"></button>
        <button id="stroke" class="tool-button" data-tool="stroke" title="Stroke tool"><img src="img/icons/stroke.svg" alt="Stroke"></button>
        <button id="rectangle" class="tool-button" data-tool="rectangle" title="Rectangle tool"><img src="img/icons/rectangle.svg" alt="Rectangle"></button>
        <button id="circle" class="tool-button" data-tool="circle" title="Circle tool"><img src="img/icons/circle.svg" alt="Circle"></button>
        <button id="move" class="tool-button" data-tool="move" title="Move tool"><img src="img/icons/move.svg" alt="Move"></button>
        <button id="shape_selection" class="tool-button" data-tool="shape_selection" title="Shape Selection"><img src="img/icons/fill_shape.svg" alt="Shape"></button>
        <button id="rectagle_selection" class="tool-button" data-tool="rectangle_selection" title="Rectangle Selection"><img src="img/icons/rectangle_selection.svg" alt="Rectangle Selection"></button>
        <button id="irregular_selection" class="tool-button" data-tool="irregular_selection" title="Irregular Selection"><img src="img/icons/irregular_selection.svg" alt="Irregular Selection"></button>
        <button id="lighting" class="tool-button" data-tool="lighting" title="Lighten"><img src="img/icons/lighting.svg" alt="Lighting"></button>
        <button id="dithering" class="tool-button" data-tool="dithering" title="Dithering"><img src="img/icons/dithering.svg" alt="Dithering"></button>
        <button id="color_picker" class="tool-button" data-tool="color_picker" title="Color Picker"><img src="img/icons/color_picker.svg" alt="Color Picker"></button>
      </div>
      <div class="pixel-size">
        <div id="pixel-size-options">
          <button class="pixel-size-option active" data-size="1">1x</button>
          <button class="pixel-size-option" data-size="2">2x</button>
          <button class="pixel-size-option" data-size="4">4x</button>
        </div>
      </div>
      <input type="color" id="color_input" name="color_input" value="#000000" />
    `;
  }

  init() {
    const color_input = document.getElementById("color_input");
    color_input.addEventListener("input", () => {
      const title = document.getElementById("title");
      if (title) {
        title.style.webkitTextStrokeColor = color_input.value;
      }
    });

    const toolButtons = document.querySelectorAll(".tool-button");
    toolButtons.forEach((button) => {
      button.addEventListener("click", () => {
        toolButtons.forEach((btn) => btn.classList.remove("active"));
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
  }
}

customElements.define("sprite-tools", SpriteTools);
