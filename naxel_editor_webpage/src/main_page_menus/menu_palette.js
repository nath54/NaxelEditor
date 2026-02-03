/**
 * Palette Menu - Option B Design
 * Color grid with selection indicator
 */

// Palette state
window.paletteState = {
    selectedKey: null
};

/**
 * Create the palette menu
 */
function create_palette_menu() {
    const container = document.createElement("div");
    container.className = "palette-menu";
    container.style.cssText = "display:flex;flex-direction:column;height:100%;padding:10px;gap:10px;";

    // Selected color display
    const selectedDiv = document.createElement("div");
    selectedDiv.id = "palette-selected";
    selectedDiv.style.cssText = "display:flex;align-items:center;gap:10px;padding:10px;background:#1a1a2e;border-radius:5px;";

    const selectedLabel = document.createElement("span");
    selectedLabel.textContent = "Selected:";
    selectedDiv.appendChild(selectedLabel);

    const selectedPreview = document.createElement("div");
    selectedPreview.id = "palette-selected-preview";
    selectedPreview.style.cssText = "width:60px;height:30px;border:2px solid white;border-radius:3px;background:#808080;";
    selectedDiv.appendChild(selectedPreview);

    const selectedName = document.createElement("span");
    selectedName.id = "palette-selected-name";
    selectedName.textContent = "None";
    selectedDiv.appendChild(selectedName);

    container.appendChild(selectedDiv);

    // Color grid
    const colorGrid = document.createElement("div");
    colorGrid.id = "palette-color-grid";
    colorGrid.style.cssText = "display:flex;flex-wrap:wrap;gap:10px;flex:1;overflow-y:auto;align-content:flex-start;padding:5px;";
    container.appendChild(colorGrid);

    // Action buttons
    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;gap:10px;";

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️ Edit";
    editBtn.className = "palette-action-btn";
    editBtn.onclick = () => editSelectedColor();

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️ Delete";
    deleteBtn.className = "palette-action-btn";
    deleteBtn.onclick = () => deleteSelectedColor();

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    container.appendChild(actions);

    // Initialize
    setTimeout(() => refreshPaletteGrid(), 0);

    return container;
}

/**
 * Refresh the palette color grid
 */
function refreshPaletteGrid() {
    const grid = document.getElementById("palette-color-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const naxel = getMainNaxel();
    const palette = naxel?.color_palette || {};

    // Add existing colors
    Object.entries(palette).forEach(([key, color]) => {
        const tile = createColorTile(key, color);
        grid.appendChild(tile);
    });

    // Add "+" button
    const addTile = document.createElement("div");
    addTile.className = "palette-tile palette-add";
    addTile.innerHTML = "<span style='font-size:24px;'>+</span>";
    addTile.onclick = () => addNewColor();
    grid.appendChild(addTile);
}

/**
 * Create a color tile for the palette grid
 */
function createColorTile(key, color) {
    const tile = document.createElement("div");
    tile.className = "palette-tile";
    tile.dataset.key = key;

    const [r, g, b] = Array.isArray(color) ? color : [color.r || 0, color.g || 0, color.b || 0];
    tile.style.backgroundColor = `rgb(${r},${g},${b})`;

    // Key label
    const label = document.createElement("span");
    label.className = "palette-tile-label";
    label.textContent = typeof key === "string" ? `"${key}"` : key;
    tile.appendChild(label);

    // Selection indicator
    if (window.paletteState.selectedKey === key) {
        tile.classList.add("selected");
    }

    tile.onclick = () => selectPaletteColor(key);

    return tile;
}

/**
 * Select a color from the palette
 */
function selectPaletteColor(key) {
    window.paletteState.selectedKey = key;

    const naxel = getMainNaxel();
    const color = naxel?.color_palette?.[key];

    // Update selected preview
    const preview = document.getElementById("palette-selected-preview");
    const nameEl = document.getElementById("palette-selected-name");

    if (preview && color) {
        const [r, g, b] = Array.isArray(color) ? color : [color.r || 0, color.g || 0, color.b || 0];
        preview.style.backgroundColor = `rgb(${r},${g},${b})`;
    }
    if (nameEl) {
        nameEl.textContent = typeof key === "string" ? `"${key}"` : key;
    }

    // Update grid selection visual
    refreshPaletteGrid();
}

/**
 * Add a new color to the palette
 */
function addNewColor() {
    const naxel = getMainNaxel();
    if (!naxel.color_palette) naxel.color_palette = {};

    // Generate unique key
    let keyNum = Object.keys(naxel.color_palette).length;
    let newKey = `color_${keyNum}`;
    while (naxel.color_palette[newKey] !== undefined) {
        keyNum++;
        newKey = `color_${keyNum}`;
    }

    naxel.color_palette[newKey] = [128, 128, 128];

    window.historyManager?.saveState();
    refreshPaletteGrid();
    selectPaletteColor(newKey);
}

/**
 * Edit the selected color
 */
function editSelectedColor() {
    const key = window.paletteState.selectedKey;
    if (!key) {
        alert("Please select a color first");
        return;
    }

    showColorEditPopup(key);
}

/**
 * Show color edit popup
 */
function showColorEditPopup(key) {
    const naxel = getMainNaxel();
    const color = naxel?.color_palette?.[key];
    if (!color) return;

    // Create popup overlay
    const overlay = document.createElement("div");
    overlay.id = "color-edit-overlay";
    overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:1000;";

    // Popup content
    const popup = document.createElement("div");
    popup.style.cssText = "background:#24243e;padding:20px;border-radius:10px;min-width:250px;";

    popup.innerHTML = `
        <h3 style="margin-bottom:15px;">Edit Color</h3>
        <div style="margin-bottom:15px;">
            <label style="display:block;margin-bottom:5px;">Key:</label>
            <input type="text" id="edit-color-key" value="${typeof key === 'string' ? '"' + key + '"' : key}" 
                   style="width:100%;padding:8px;background:#1a1a2e;color:white;border:1px solid #4a5568;border-radius:5px;">
            <small style="color:#888;">Use "quotes" for string keys</small>
        </div>
        <div style="margin-bottom:15px;">
            <label style="display:block;margin-bottom:5px;">Color:</label>
            <input type="color" id="edit-color-value" value="${rgbToHex(color)}" 
                   style="width:100%;height:50px;border:none;cursor:pointer;">
        </div>
        <div style="display:flex;gap:10px;">
            <button id="edit-color-save" style="flex:1;padding:10px;background:#3498db;color:white;border:none;border-radius:5px;cursor:pointer;">Save</button>
            <button id="edit-color-cancel" style="flex:1;padding:10px;background:#4a5568;color:white;border:none;border-radius:5px;cursor:pointer;">Cancel</button>
        </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Event handlers
    document.getElementById("edit-color-save").onclick = () => {
        const newKeyRaw = document.getElementById("edit-color-key").value.trim();
        const newColorHex = document.getElementById("edit-color-value").value;

        // Parse key (with or without quotes)
        let newKey;
        if (newKeyRaw.startsWith('"') && newKeyRaw.endsWith('"')) {
            newKey = newKeyRaw.slice(1, -1);
        } else if (!isNaN(parseInt(newKeyRaw))) {
            newKey = parseInt(newKeyRaw);
        } else {
            newKey = newKeyRaw;
        }

        const newColor = hexToRgb(newColorHex);

        // Update palette
        if (newKey !== key) {
            delete naxel.color_palette[key];
        }
        naxel.color_palette[newKey] = newColor;

        window.historyManager?.saveState();
        overlay.remove();
        refreshPaletteGrid();
        selectPaletteColor(newKey);
        triggerRerender();
    };

    document.getElementById("edit-color-cancel").onclick = () => {
        overlay.remove();
    };

    // Close on overlay click
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };
}

/**
 * Delete the selected color
 */
function deleteSelectedColor() {
    const key = window.paletteState.selectedKey;
    if (!key) {
        alert("Please select a color first");
        return;
    }

    if (!confirm(`Delete color "${key}"?`)) return;

    const naxel = getMainNaxel();
    delete naxel.color_palette[key];

    window.paletteState.selectedKey = null;
    window.historyManager?.saveState();
    refreshPaletteGrid();

    // Clear selected preview
    const preview = document.getElementById("palette-selected-preview");
    const nameEl = document.getElementById("palette-selected-name");
    if (preview) preview.style.backgroundColor = "#808080";
    if (nameEl) nameEl.textContent = "None";

    triggerRerender();
}

/**
 * Get the currently selected palette color
 * @returns {Array|null} [r, g, b] or null
 */
function getSelectedPaletteColor() {
    const key = window.paletteState.selectedKey;
    if (!key) return null;

    const naxel = getMainNaxel();
    const color = naxel?.color_palette?.[key];
    if (!color) return null;

    return Array.isArray(color) ? color : [color.r || 0, color.g || 0, color.b || 0];
}

// Expose functions
window.refreshPaletteGrid = refreshPaletteGrid;
window.selectPaletteColor = selectPaletteColor;
window.getSelectedPaletteColor = getSelectedPaletteColor;
