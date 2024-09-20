const app_colors = {
  canvas_line_color: "rgba(68, 68, 68, 1)",
  color_palette_default: "rgba(164, 165, 166, 1)",
  hover_color: "rgba(180, 240, 213, 0.5)",
  selection_color: "rgba(196, 252, 250, 0.48)",
  primary_color_default: "rgba(0, 0, 0, 1)",
  secondary_color_default: "rgba(255, 255, 255, 1)",
};

export function get_color(key) {
  if (app_colors.hasOwnProperty(key)) {
    return app_colors[key];
  } else {
    throw new Error(
      `Die Farbe "${key}" ist nicht im Objekt "app_colors" definiert.`
    );
  }
}
