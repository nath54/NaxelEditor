/**
 * Utility functions for Naxel Editor
 */

/**
 * Convert RGB array or object to hex color string
 * @param {Array|Object} rgb - [r, g, b] or {r, g, b}
 * @returns {string} Hex color like "#ffffff"
 */
function rgbToHex(rgb) {
    if (!rgb) return "#000000";
    const [r, g, b] = Array.isArray(rgb) ? rgb : [rgb.r || 0, rgb.g || 0, rgb.b || 0];
    return "#" + [r, g, b].map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
}

/**
 * Convert hex color string to RGB array
 * @param {string} hex - Hex color like "#ffffff"
 * @returns {Array} [r, g, b]
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
}

/**
 * Parse various position formats to {x, y, z} object
 * @param {Array|Object|string} input - Position in various formats
 * @returns {Object} {x, y, z}
 */
function parseVec3Editor(input) {
    if (Array.isArray(input)) return { x: input[0] || 0, y: input[1] || 0, z: input[2] || 0 };
    if (typeof input === "object" && input !== null) return { x: input.x || 0, y: input.y || 0, z: input.z || 0 };
    if (typeof input === "string") {
        const parts = input.split(/[,\s_\-\.]+/).map(Number);
        return { x: parts[0] || 0, y: parts[1] || 0, z: parts[2] || 0 };
    }
    return { x: 0, y: 0, z: 0 };
}

/**
 * Trigger re-render of all naxel views
 */
function triggerRerender() {
    // Sync tmp_naxel with main_naxel changes
    if (typeof syncTmpNaxel === 'function') {
        syncTmpNaxel();
    }

    if (typeof render_all_naxels === 'function') {
        render_all_naxels();
    }
    if (typeof refreshGridView === 'function') {
        refreshGridView();
    }
    if (typeof renderTmpNaxelPreview === 'function') {
        renderTmpNaxelPreview();
    }
}

/**
 * Get the current main naxel object
 * @returns {Object} The main naxel object
 */
function getMainNaxel() {
    return window.naxel_objects["main_naxel"];
}

/**
 * Create a labeled input row
 * @param {string} label - Label text
 * @param {string} type - Input type or "select" or "textarea"
 * @param {string} id - Element ID
 * @param {Array} options - Options for select element
 * @returns {HTMLElement}
 */
function createLabeledInput(label, type, id, options = null) {
    const row = document.createElement("div");
    row.style.cssText = "display:flex;align-items:center;gap:10px;margin-bottom:10px;";

    const lbl = document.createElement("label");
    lbl.textContent = label;
    lbl.style.cssText = "min-width:100px;";
    row.appendChild(lbl);

    let input;
    if (type === "select" && options) {
        input = document.createElement("select");
        options.forEach(opt => {
            const o = document.createElement("option");
            o.value = opt;
            o.textContent = opt;
            input.appendChild(o);
        });
    } else if (type === "textarea") {
        input = document.createElement("textarea");
        input.rows = 3;
    } else {
        input = document.createElement("input");
        input.type = type;
    }
    input.id = id;
    input.style.cssText = "flex:1;padding:8px;background:#1a1a2e;color:white;border:1px solid #4a5568;border-radius:5px;";
    row.appendChild(input);

    return row;
}

/**
 * Create a slider input with value display
 * @param {string} label - Label text
 * @param {string} id - Element ID
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} value - Initial value
 * @param {number} step - Step value
 * @returns {HTMLElement}
 */
function createSlider(label, id, min, max, value, step = 0.1) {
    const row = document.createElement("div");
    row.style.cssText = "display:flex;align-items:center;gap:5px;margin-bottom:5px;";

    const lbl = document.createElement("label");
    lbl.textContent = label;
    lbl.style.cssText = "min-width:100px;";
    row.appendChild(lbl);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.id = id;
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = value;
    slider.style.cssText = "flex:1;";

    const valueDisplay = document.createElement("span");
    valueDisplay.id = id + "-value";
    valueDisplay.textContent = value;
    valueDisplay.style.cssText = "min-width:40px;text-align:right;";

    slider.oninput = () => {
        valueDisplay.textContent = parseFloat(slider.value).toFixed(1);
    };

    row.appendChild(slider);
    row.appendChild(valueDisplay);
    return row;
}

/**
 * Create a color picker row
 * @param {string} label - Label text
 * @param {string} id - Element ID
 * @param {Array} rgbValue - [r, g, b] color
 * @returns {HTMLElement}
 */
function createColorPicker(label, id, rgbValue) {
    const row = document.createElement("div");
    row.style.cssText = "display:flex;align-items:center;gap:5px;margin-bottom:5px;";

    const lbl = document.createElement("label");
    lbl.textContent = label;
    lbl.style.cssText = "min-width:100px;";
    row.appendChild(lbl);

    const picker = document.createElement("input");
    picker.type = "color";
    picker.id = id;
    picker.value = rgbToHex(rgbValue);
    picker.style.cssText = "width:40px;height:25px;border:none;cursor:pointer;";
    row.appendChild(picker);

    return row;
}

// Expose functions globally
window.rgbToHex = rgbToHex;
window.hexToRgb = hexToRgb;
window.parseVec3Editor = parseVec3Editor;
window.triggerRerender = triggerRerender;
window.getMainNaxel = getMainNaxel;
window.createLabeledInput = createLabeledInput;
window.createSlider = createSlider;
window.createColorPicker = createColorPicker;
