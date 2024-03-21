import { SpriteEditorPart } from "./SpriteEditorPart.js";

export class SpriteTools extends SpriteEditorPart {
  constructor(sprite_editor) {
    super(sprite_editor);
  }

  render() {
    return `
        <input type="color" id="color_picker" name="color_picker" value="#000000">
        <ul>
          <input type="radio" id="pen" name="tools" checked>
          <label for="pen">Pen</label>
      
          <input type="radio" id="mirror_pen" name="tools">
          <label for="mirror_pen">Mirror Pen</label>

          <input type="radio" id="bucket" name="tools" checked>
          <label for="bucket">Bucket</label>

          <input type="radio" id="same_color" name="tools" checked>
          <label for="same_color">Same Color</label>
          
          <input type="radio" id="eraser" name="tools" checked>
          <label for="eraser">Eraser</label>

          <input type="radio" id="stroke" name="tools" checked>
          <label for="stroke">Stroke</label>

          <input type="radio" id="rectangle" name="tools" checked>
          <label for="rectangle">Rectangle</label>

          <input type="radio" id="circle" name="tools" checked>
          <label for="circle">Circle</label>

          <input type="radio" id="move" name="tools" checked>
          <label for="move">Move</label>

          <input type="radio" id="shape" name="tools" checked>
          <label for="shape">Shape</label>

          <input type="radio" id="rectagle_selection" name="tools" checked>
          <label for="rectagle_selection">Rectagle Selection</label>

          <input type="radio" id="irregular_selection" name="tools" checked>
          <label for="irregular_selection">Irregular Selection</label>

          <input type="radio" id="light" name="tools" checked>
          <label for="light">Lighting</label>

          <input type="radio" id="dithering" name="tools" checked>
          <label for="dithering">Dithering</label>

          <input type="radio" id="color_picker" name="tools" checked>
          <label for="color_picker">Color Picker</label>
        </ul>
      `;
  }

  init() {}
}

customElements.define("sprite-tools", SpriteTools);
