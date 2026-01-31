/**
 * Color - RGBA color class
 * Matches Python lib_python/color.py
 */
class Color {
    constructor(r = 0, g = 0, b = 0, a = 255) {
        this.r = Math.max(0, Math.min(255, Math.round(r)));
        this.g = Math.max(0, Math.min(255, Math.round(g)));
        this.b = Math.max(0, Math.min(255, Math.round(b)));
        this.a = Math.max(0, Math.min(255, Math.round(a)));
    }

    clone() {
        return new Color(this.r, this.g, this.b, this.a);
    }

    toArray() {
        return [this.r, this.g, this.b, this.a];
    }

    toHex() {
        const toHex = (n) => n.toString(16).padStart(2, '0');
        return `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}`;
    }
}

// Named colors lookup
const NAMED_COLORS = {
    'black': new Color(0, 0, 0),
    'white': new Color(255, 255, 255),
    'red': new Color(255, 0, 0),
    'green': new Color(0, 255, 0),
    'blue': new Color(0, 0, 255),
    'yellow': new Color(255, 255, 0),
    'cyan': new Color(0, 255, 255),
    'magenta': new Color(255, 0, 255),
    'grey': new Color(128, 128, 128),
    'gray': new Color(128, 128, 128),
    'orange': new Color(255, 165, 0),
    'purple': new Color(128, 0, 128),
    'pink': new Color(255, 192, 203),
    'brown': new Color(139, 69, 19),
    'transparent': new Color(0, 0, 0, 0),
};

/**
 * Parse a color from various formats
 * @param {any} value - Color in any supported format
 * @returns {Color}
 */
function parseColor(value) {
    if (value instanceof Color) {
        return value;
    }

    // String: named color or hex
    if (typeof value === 'string') {
        const lower = value.toLowerCase().trim();

        // Check named colors
        if (NAMED_COLORS[lower]) {
            return NAMED_COLORS[lower].clone();
        }

        // Hex color
        if (lower.startsWith('#')) {
            const hex = lower.slice(1);
            if (hex.length === 3) {
                // Short hex: #RGB
                const r = parseInt(hex[0] + hex[0], 16);
                const g = parseInt(hex[1] + hex[1], 16);
                const b = parseInt(hex[2] + hex[2], 16);
                return new Color(r, g, b);
            } else if (hex.length === 6) {
                // Full hex: #RRGGBB
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                return new Color(r, g, b);
            } else if (hex.length === 8) {
                // Hex with alpha: #RRGGBBAA
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                const a = parseInt(hex.slice(6, 8), 16);
                return new Color(r, g, b, a);
            }
        }
    }

    // Integer: grayscale
    if (typeof value === 'number') {
        const v = Math.max(0, Math.min(255, Math.round(value)));
        return new Color(v, v, v);
    }

    // Array: [r, g, b] or [r, g, b, a]
    if (Array.isArray(value)) {
        if (value.length >= 4) {
            return new Color(value[0], value[1], value[2], value[3]);
        } else if (value.length >= 3) {
            return new Color(value[0], value[1], value[2]);
        }
    }

    // Default: black
    return new Color(0, 0, 0);
}

// Expose to window
window.Color = Color;
window.NAMED_COLORS = NAMED_COLORS;
window.parseColor = parseColor;
