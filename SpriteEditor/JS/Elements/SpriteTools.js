import { SpriteEditorPart } from "./SpriteEditorPart.js";

export class SpriteTools extends SpriteEditorPart {
  constructor(sprite_editor) {
    super(sprite_editor);
  }

  render() {
    return `
      <h1 id="title">Sprite Editor</h1>
      <div class="toolbox">
        <button id="pen" class="tool-button" data-tool="pen"><img src="icons/pen.svg" alt="Pen"></button>
        <button id="mirror_pen" class="tool-button" data-tool="mirror_pen"><img src="icons/mirror_pen.svg" alt="Mirror Pen"></button>
        <button id="bucket" class="tool-button" data-tool="bucket"><img src="icons/bucket.svg" alt="Bucket"></button>
        <button id="same_color" class="tool-button" data-tool="same_color"><img src="icons/same_color_bucket.svg" alt="Same Color Bucket"></button>
        <button id="eraser" class="tool-button" data-tool="eraser"><img src="icons/eraser.svg" alt="Eraser"></button>
        <button id="stroke" class="tool-button" data-tool="stroke"><img src="icons/stroke.svg" alt="Stroke"></button>
        <button id="rectangle" class="tool-button" data-tool="rectangle"><img src="icons/rectangle.svg" alt="Rectangle"></button>
        <button id="circle" class="tool-button" data-tool="circle"><img src="icons/circle.svg" alt="Circle"></button>
        <button id="move" class="tool-button" data-tool="move"><img src="icons/move.svg" alt="Move"></button>
        <button id="shape" class="tool-button" data-tool="shape"><img src="icons/fill_shape.svg" alt="Shape"></button>
        <button id="rectagle_selection" class="tool-button" data-tool="rectagle_selection"><img src="icons/rectangle_selection.svg" alt="Rectangle Selection"></button>
        <button id="irregular_selection" class="tool-button" data-tool="irregular_selection"><img src="icons/irregular_selection.svg" alt="Irregular Selection"></button>
        <button id="lighting" class="tool-button" data-tool="lighting"><img src="icons/lighting.svg" alt="Lighting"></button>
        <button id="dithering" class="tool-button" data-tool="dithering"><img src="icons/dithering.svg" alt="Dithering"></button>
        <button id="color_picker" class="tool-button" data-tool="color_picker"><img src="icons/color_picker.svg" alt="Color Picker"></button>
      </div>
      <input type="color" id="color_input" name="color_input" value="#000000" />
    `;
  }

  init() {
    // Get the color picker element
    const color_input = document.getElementById("color_input");

    // Add event listener to update stroke color of title when color changes
    color_input.addEventListener("input", () => {
      const title = document.getElementById("title");
      if (title) {
        title.style.webkitTextStrokeColor = color_input.value;
      }
    });
  }
}

customElements.define("sprite-tools", SpriteTools);
