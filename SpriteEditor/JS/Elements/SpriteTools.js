import { SpriteEditorPart } from "./SpriteEditorPart.js";

export class SpriteTools extends SpriteEditorPart {
  constructor(sprite_editor) {
    super(sprite_editor);
  }

  render() {
    return `
      <h1 id="title"}">Sprite Editor</h1>
      <ul>
        <li>
          <input type="radio" id="pen" name="tools" checked />
          <label for="pen">Pen</label>
        </li>
        <li>
          <input type="radio" id="mirror_pen" name="tools" />
          <label for="mirror_pen">Mirror Pen</label>
        </li>
        <li>
          <input type="radio" id="bucket" name="tools" />
          <label for="bucket">Bucket</label>
        </li>
        <li>
          <input type="radio" id="same_color" name="tools" />
          <label for="same_color">Same Color</label>
        </li>
        <li>
          <input type="radio" id="eraser" name="tools" />
          <label for="eraser">Eraser</label>
        </li>
        <li>
          <input type="radio" id="stroke" name="tools" />
          <label for="stroke">Stroke</label>
        </li>
        <li>
          <input type="radio" id="rectangle" name="tools" />
          <label for="rectangle">Rectangle</label>
        </li>
        <li>
          <input type="radio" id="circle" name="tools" />
          <label for="circle">Circle</label>
        </li>
        <li>
          <input type="radio" id="move" name="tools" />
          <label for="move">Move</label>
        </li>
        <li>
          <input type="radio" id="shape" name="tools" />
          <label for="shape">Shape</label>
        </li>
        <li>
          <input type="radio" id="rectagle_selection" name="tools" />
          <label for="rectagle_selection">Rectagle Selection</label>
        </li>
        <li>
          <input type="radio" id="irregular_selection" name="tools" />
          <label for="irregular_selection">Irregular Selection</label>
        </li>
        <li>
          <input type="radio" id="light" name="tools" />
          <label for="light">Lighting</label>
        </li>
        <li>
          <input type="radio" id="dithering" name="tools" />
          <label for="dithering">Dithering</label>
        </li>
        <li>
          <input type="radio" id="color_picker" name="tools" />
          <label for="color_picker">Color Picker</label>
        </li>
      </ul>
      <input type="color" id="color_input" name="color_input" value="#000000" />
    `;
  }

  init() {
    // Get the color picker element
    const colorInput = document.getElementById("color_input");

    // Add event listener to update stroke color of title when color changes
    colorInput.addEventListener("input", () => {
      const title = document.getElementById("title");
      if (title) {
        title.style.webkitTextStrokeColor = colorInput.value;
      }
    });
  }
}

customElements.define("sprite-tools", SpriteTools);
