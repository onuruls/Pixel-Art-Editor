var drawingCanvas = document.getElementById("drawingCanvas");
var context = drawingCanvas.getContext("2d");
const resolution_select = document.querySelector("#resolution_select");
var isDrawing = false; // Variable um zu verfolgen, ob du am Zeichnen bist
var usePen = false; // Variable um zu verfolgen, ob der Stift aktiviert ist

drawingCanvas.height = drawingCanvas.getBoundingClientRect().height;
drawingCanvas.width = drawingCanvas.getBoundingClientRect().width;
const canvasHeight = drawingCanvas.scrollHeight;
const canvasWidth = drawingCanvas.scrollHeight;
const targetHeight = 32;
const targetWidth = 32;
const size = 640;
let resolution = 32;
let pixel_size = size / 32;
let color = document.getElementById("colorPicker").value;
resolution_select.addEventListener("change", (event) => {
  resolution = event.target.value;
  pixel_size = size / resolution;
});

// Toggle-Button-Element
var toggleButton = document.getElementById("toggleButton");
const colorPicker = document.getElementById("colorPicker");
toggleButton.addEventListener("click", function () {
  console.log("Stift aktive: ", usePen);
  usePen = !usePen; // Umschalten zwischen aktiviert und deaktiviert
});

colorPicker.addEventListener("change", function (event) {
  color = event.target.value;
});

// Mausklick-Ereignis für das Starten des Zeichnens
drawingCanvas.addEventListener("mousedown", function (event) {
  isDrawing = true;
  draw(event);
});

// Mausbewegungs-Ereignis für das Zeichnen von Linien, wenn die Maus bewegt wird
drawingCanvas.addEventListener("mousemove", function (event) {
  console.log(`Wird gemalt: ${isDrawing}`);
  if (isDrawing) {
    draw(event);
  }
});

// Mausfreigabe-Ereignis zum Beenden des Zeichnens
drawingCanvas.addEventListener("mouseup", function () {
  isDrawing = false;
  context.beginPath(); // Neue Pfad-Anfangsposition für den nächsten Zeichenstrich
});

function draw(event) {
  if (!usePen) return; // Wenn der Stift nicht aktiviert ist, nichts zeichnen
  var rect = drawingCanvas.getBoundingClientRect();
  var mouseX = event.clientX - rect.left;
  var mouseY = event.clientY - rect.top;
  context.lineWidth = 5; // Breite der Linie
  context.lineCap = "round"; // Runde Linienenden für einen weicheren Look
  context.strokeStyle = color; // Farbe der Linie (in diesem Fall Schwarz)
  const x = Math.floor(mouseX / pixel_size) * pixel_size;
  const y = Math.floor(mouseY / pixel_size) * pixel_size;

  context.fillStyle = color;
  context.fillRect(x, y, pixel_size, pixel_size);
}

function resetCanvas() {}

// class SpriteEditor extends HTMLElement {
//   constructor() {
//     super();
//     this.innerHTML = `
//         <sprite-preview></sprite-preview>
//         <sprite-canvas></sprite-canvas>
//         <sprite-tools></sprite-tools>
//     `;
//   }

//   connectedCallback() {
//     this.sprite_preview = customElements.get("sprite-preview");
//     this.sprite_canvas = customElements.get("sprite-canvas");
//     this.sprite_tools = customElements.get("sprite-tools");
//     this.sprite_preview.setSpriteEditor(this);
//     this.sprite_canvas.setSpriteEditor(this);
//     this.sprite_tools.setSpriteEditor(this);
//     console.log("SPRITE_PREVIEW", this.sprite_preview);
//     console.log("SPRITE_CANVAS", this.sprite_canvas);
//     console.log("SPRITE_TOOLS", this.sprite_tools);
//   }
// }

// class SpriteEditorPart extends HTMLElement {
//   constructor() {
//     super();
//   }

//   /**
//    *
//    * @param {SpriteEditor} spriteEditor
//    */
//   setSpriteEditor(spriteEditor) {
//     this.spriteEditor = spriteEditor;
//   }

//   connectedCallback() {
//     this.innerHTML = this.render();
//   }
// }

// class SpritePreview extends SpriteEditorPart {
//   constructor() {
//     super();
//   }

//   render() {
//     return `
//       <p>PreView</p>
//     `;
//   }
// }

// class SpriteCanvas extends SpriteEditorPart {
//   constructor() {
//     super();
//   }

//   render() {
//     return `
//       <div class="canvas-wrapper">
//         <canvas id="drawingCanvas"></canvas>
//       </div>
//     `;
//   }
// }

// class SpriteTools extends SpriteEditorPart {
//   constructor() {
//     super();
//   }

//   render() {
//     return `
//       <select name="resolution" id="resolution_select">
//         <option value="32">32x32</option>
//         <option value="64">64x64</option>
//         <option value="128">128x128</option>
//       </select>
//       <button id="pen" tabindex="1">Pen</button>
//       <input type="color" id="colorPicker" value="#000000">
//     `;
//   }
// }

// customElements.define("sprite-editor", SpriteEditor);
// customElements.define("sprite-preview", SpritePreview);
// customElements.define("sprite-canvas", SpriteCanvas);
// customElements.define("sprite-tools", SpriteTools);
