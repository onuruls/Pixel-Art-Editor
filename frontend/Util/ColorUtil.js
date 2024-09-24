export class ColorUtil {
  static canvas_line_color = "rgba(68, 68, 68, 1)";
  static color_palette_default = "rgba(164, 165, 166, 1)";
  static hover_color = "rgba(180, 240, 213, 0.5)";
  static selection_color = "rgba(196, 252, 250, 0.48)";
  static primary_color_default = "rgba(0, 0, 0, 1)";
  static secondary_color_default = "rgba(255, 255, 255, 1)";

  /**
   * Retrieves a color by key from the predefined colors
   * @param {string} key
   * @returns {string}
   * @throws {Error}
   */
  static get_color(key) {
    if (ColorUtil.hasOwnProperty(key)) {
      return ColorUtil[key];
    } else {
      throw new Error(`The color "${key}" is not defined in ColorUtil.`);
    }
  }

  /**
   * Converts an RGBA string to an array of numeric values
   * @param {string} rgba_string
   * @returns {Array<number>}
   */
  static rgba_string_to_array(rgba_string) {
    if (Array.isArray(rgba_string)) {
      return rgba_string;
    }

    if (typeof rgba_string !== "string") {
      console.error(
        `Expected a string, but received a ${typeof rgba_string}:`,
        rgba_string
      );
      return [0, 0, 0, 255];
    }

    const matches = rgba_string.match(/rgba?\(([^)]+)\)/);
    if (!matches) {
      console.error("Invalid RGBA string format:", rgba_string);
      return [0, 0, 0, 255];
    }

    const components = matches[1]
      .split(",")
      .map((component) => parseFloat(component.trim()));
    const [r, g, b, a = 1] = components;
    const alpha = Math.round(a * 255);
    return [r, g, b, alpha];
  }

  /**
   * Converts an array of numeric color values to an RGBA string
   * @param {Array<number>} color_array
   * @returns {string}
   */
  static rgba_array_to_string(color_array) {
    const [r, g, b, a = 255] = color_array;
    const alpha = (a / 255).toFixed(3);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Blends two colors together.
   * @param {string | Array<number>} color1
   * @param {string | Array<number>} color2
   * @param {number} weight
   * @returns {string}
   */
  static blend_colors(color1, color2, weight = 0.5) {
    const c1 = Array.isArray(color1)
      ? color1
      : ColorUtil.rgba_string_to_array(color1);
    const c2 = Array.isArray(color2)
      ? color2
      : ColorUtil.rgba_string_to_array(color2);

    const r = Math.round(c1[0] * weight + c2[0] * (1 - weight));
    const g = Math.round(c1[1] * weight + c2[1] * (1 - weight));
    const b = Math.round(c1[2] * weight + c2[2] * (1 - weight));
    const a = Math.round(c1[3] * weight + c2[3] * (1 - weight));

    return ColorUtil.rgba_array_to_string([r, g, b, a]);
  }

  /**
   * Compares two colors.
   * @param {string | Array<number>} color1
   * @param {string | Array<number>} color2
   * @returns {boolean}
   */
  static compare_colors(color1, color2) {
    if (typeof color1 === "string")
      color1 = ColorUtil.rgba_string_to_array(color1);
    if (typeof color2 === "string")
      color2 = ColorUtil.rgba_string_to_array(color2);

    if (Array.isArray(color1) && Array.isArray(color2)) {
      return (
        color1.length === color2.length &&
        color1.every((v, i) => v === color2[i])
      );
    }
    return false;
  }

  /**
   * Clamps a value between a minimum and maximum.
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Checks if the color is transparent.
   * @param {string | Array<number>} color
   * @returns {boolean}
   */
  static is_transparent(color) {
    let alpha;
    if (typeof color === "string") {
      const colorArray = ColorUtil.rgba_string_to_array(color);
      alpha = colorArray ? colorArray[3] : 255;
    } else if (Array.isArray(color)) {
      alpha = color[3];
    } else {
      return false;
    }
    return alpha === 0;
  }

  /**
   * Converts a hex color string to an RGBA array
   * @param {string} hex_string
   * @returns {Array<number>}
   */
  static hex_to_rgb_array(hex_string) {
    if (!hex_string) {
      console.error("hex_to_rgb_array called with undefined hex_string");
      return [0, 0, 0, 0];
    }
    hex_string = hex_string.replace(/^#/, "");
    const bigint = parseInt(hex_string, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b, 255];
  }

  /**
   * Converts an array of RGB values to a hex color string
   * @param {Array<number>} color_array
   * @returns {string}
   */
  static rgb_array_to_hex(color_array) {
    const [r, g, b] = color_array;
    return `#${((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
  }

  /**
   * Adjusts the brightness of a color
   * @param {string | Array<number>} color
   * @param {number} amount
   * @returns {string | Array<number>}
   */
  static adjust_brightness(color, amount) {
    let color_array;
    if (Array.isArray(color)) {
      color_array = color;
    } else if (typeof color === "string") {
      color_array = ColorUtil.rgba_string_to_array(color);
    } else {
      console.error(
        `Expected a string or array, but received a ${typeof color}:`,
        color
      );
      return color;
    }

    if (!color_array) return color;

    const [r, g, b, a] = color_array;
    const new_r = ColorUtil.clamp(r + amount, 0, 255);
    const new_g = ColorUtil.clamp(g + amount, 0, 255);
    const new_b = ColorUtil.clamp(b + amount, 0, 255);

    const new_color_array = [new_r, new_g, new_b, a];

    return Array.isArray(color)
      ? new_color_array
      : ColorUtil.rgba_array_to_string(new_color_array);
  }
}
