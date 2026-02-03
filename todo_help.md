# NaxelEditor - TODO & Implementation Guide

## Project Analysis Summary

The project has a solid foundation with:
- ✅ Complete JSON format specification in README.md
- ✅ Python rendering library (`lib_python/`)
- ✅ JavaScript rendering library (`lib_js_naive/`)
- ✅ Basic webpage structure with navigation and layout system
- ✅ Export functionality (base JSON + preprocessed JSON)

**Missing/Incomplete:**
- ❌ All editing menus are empty stubs
- ❌ JSON subpage is empty
- ❌ View subpage has no camera controls
- ❌ No touch/mobile-optimized controls
- ❌ No undo/redo system
- ❌ Missing shapes in JS library (triangle, circle, cylinder, polygon)

---

## Menu Structure

| Menu | Icon | Purpose |
|------|------|---------|
| **Camera** | 📹 | 3D viewport with navigation controls |
| **Palette** | 🎨 | Color selection grid (Option B design) |
| **Grid** | ✏️ | 2D slice editor with 3D preview + ghost layer |
| **Tools** | 🔧 | Paint, erase, fill, shapes, brushes |
| **Environment** | 🏔️ | Background/skybox settings |
| **Lights** | 💡 | Light algorithm settings |
| **Metadata** | 📰 | Name, author, description |

---

## Global Configuration Variables

```javascript
// Add to src/config.js or top of app_navigation.js

window.naxelConfig = {
    // Grid settings
    ghostSliceOpacity: 0.5,      // Opacity for ghost voxels (0-1)
    defaultSlice: 0,             // Default slice position (origin)
    gridZoom: 16,                // Pixels per voxel in grid view
    
    // Visual indicators
    shapeOriginColor: "#3498db", // Blue border for shape origins
    lightSourceColor: "#f1c40f", // Yellow border for light sources
    
    // Touch settings
    longPressDelay: 500,         // ms before long-press triggers
    
    // Camera
    defaultCameraDistance: 15,
    cameraRotateSpeed: 0.02,
    cameraMoveSpeed: 1,
};
```

---

## 1. Palette Menu - Option B Design

Visual color grid with selection indicator.

### Layout

```
┌─────────────────────────────────────────┐
│ Selected: [████ "skin" ████]            │
├─────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        │
│ │skin │ │hair │ │  1  │ │eyes │        │
│ │█████│ │█████│ │█████│ │█████│        │
│ └─────┘ └─────┘ └─────┘ └─────┘        │
│ ┌─────┐ ┌─────┐ ┌─────┐                │
│ │wood │ │leaf │ │  +  │                │
│ │█████│ │█████│ │     │                │
│ └─────┘ └─────┘ └─────┘                │
├─────────────────────────────────────────┤
│ [Edit Selected] [Delete]                │
└─────────────────────────────────────────┘
```

### Implementation

```javascript
function create_palette_menu() {
    const container = document.createElement("div");
    container.className = "palette-menu";
    container.style.cssText = "display:flex;flex-direction:column;height:100%;padding:10px;gap:10px;";

    // Selected color display
    const selectedDiv = document.createElement("div");
    selectedDiv.id = "palette-selected";
    selectedDiv.style.cssText = "display:flex;align-items:center;gap:10px;padding:10px;background:#1a1a2e;border-radius:5px;";
    selectedDiv.innerHTML = '<span>Selected:</span><div id="palette-selected-preview" style="width:60px;height:30px;border:2px solid white;"></div><span id="palette-selected-name">None</span>';
    container.appendChild(selectedDiv);

    // Color grid
    const colorGrid = document.createElement("div");
    colorGrid.id = "palette-color-grid";
    colorGrid.style.cssText = "display:flex;flex-wrap:wrap;gap:10px;flex:1;overflow-y:auto;align-content:flex-start;";
    container.appendChild(colorGrid);

    // Action buttons
    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;gap:10px;";
    
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit Selected";
    editBtn.className = "palette-btn";
    editBtn.onclick = () => editSelectedColor();
    
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "palette-btn";
    deleteBtn.onclick = () => deleteSelectedColor();
    
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    container.appendChild(actions);

    setTimeout(() => refreshPaletteGrid(), 0);
    return container;
}

window.paletteState = {
    selectedKey: null
};

function refreshPaletteGrid() {
    const grid = document.getElementById("palette-color-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const palette = window.naxel_objects["main_naxel"]?.color_palette || {};

    // Add existing colors
    Object.entries(palette).forEach(([key, color]) => {
        const tile = createColorTile(key, color);
        grid.appendChild(tile);
    });

    // Add "+" button
    const addTile = document.createElement("div");
    addTile.className = "palette-tile palette-add";
    addTile.innerHTML = "<span>+</span>";
    addTile.onclick = () => addNewColor();
    grid.appendChild(addTile);
}

function createColorTile(key, color) {
    const tile = document.createElement("div");
    tile.className = "palette-tile";
    tile.dataset.key = key;
    
    const [r, g, b] = Array.isArray(color) ? color : [color.r, color.g, color.b];
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

function selectPaletteColor(key) {
    window.paletteState.selectedKey = key;
    const color = window.naxel_objects["main_naxel"]?.color_palette?.[key];
    
    // Update selected preview
    const preview = document.getElementById("palette-selected-preview");
    const name = document.getElementById("palette-selected-name");
    if (preview && color) {
        const [r, g, b] = Array.isArray(color) ? color : [color.r, color.g, color.b];
        preview.style.backgroundColor = `rgb(${r},${g},${b})`;
    }
    if (name) {
        name.textContent = typeof key === "string" ? `"${key}"` : key;
    }
    
    // Update grid selection visual
    refreshPaletteGrid();
}

function addNewColor() {
    const naxel = window.naxel_objects["main_naxel"];
    if (!naxel.color_palette) naxel.color_palette = {};
    
    const newKey = `color_${Object.keys(naxel.color_palette).length}`;
    naxel.color_palette[newKey] = [128, 128, 128];
    
    window.historyManager?.saveState();
    refreshPaletteGrid();
    selectPaletteColor(newKey);
}

function editSelectedColor() {
    const key = window.paletteState.selectedKey;
    if (!key) return;
    
    // Show edit popup (color picker + key rename)
    showColorEditPopup(key);
}

function deleteSelectedColor() {
    const key = window.paletteState.selectedKey;
    if (!key) return;
    
    delete window.naxel_objects["main_naxel"].color_palette[key];
    window.paletteState.selectedKey = null;
    window.historyManager?.saveState();
    refreshPaletteGrid();
}
```

### CSS for Palette

```css
/* Add to style.css */

.palette-tile {
    width: 60px;
    height: 60px;
    border: 2px solid #4a5568;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    position: relative;
    transition: transform 0.1s, border-color 0.1s;
}

.palette-tile:hover {
    transform: scale(1.05);
    border-color: #7777ac;
}

.palette-tile.selected {
    border-color: white;
    border-width: 3px;
    box-shadow: 0 0 10px rgba(255,255,255,0.5);
}

.palette-tile-label {
    font-size: 10px;
    background: rgba(0,0,0,0.7);
    padding: 2px 4px;
    border-radius: 3px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.palette-add {
    background: #1a1a2e;
    font-size: 24px;
    align-items: center;
}

.palette-btn {
    flex: 1;
    padding: 10px;
    background: #24243e;
    color: white;
    border: 1px solid #4a5568;
    border-radius: 5px;
    cursor: pointer;
}

.palette-btn:hover {
    background: #383862;
}
```

---

## 2. Grid Menu - Full Design

### Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────────────────────────────────┐  ┌─────────┐ │
│  │                                      │  │   3D    │ │
│  │         2D GRID CANVAS               │  │  Slice  │ │
│  │                                      │  │ Preview │ │
│  │   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │  │         │ │
│  │   ░░░░░💛░░░░░░░░░░░░░░░░░░░░░░░░   │  │  ↗ Y    │ │
│  │   ░░░░░██████████░░░░░░░░░░░░░░░░   │  │  │  ╱X   │ │
│  │   ░░░░░██████████░░░░░░░░░░░░░░░░   │  │  │╱     │ │
│  │   ░░░░🔵██████████░░░░░░░░░░░░░░░   │  │  └──Z   │ │
│  │   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │  │         │ │
│  │                                      │  │ Z = 0   │ │
│  └──────────────────────────────────────┘  └─────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Axis: [XY] [XZ] [YZ]    Slice: [◀] [ 0 ] [▶]          │
│  [👁️ Ghost] [📦 Shapes] [💡 Lights]                     │
└─────────────────────────────────────────────────────────┘
```

### Visual Indicators

| Element | Border Color | Meaning | Interaction |
|---------|-------------|---------|-------------|
| **Shape origin** | 🔵 Blue (`#3498db`) | Shape anchor position | Long-press / Right-click → Edit |
| **Light source** | 💛 Yellow (`#f1c40f`) | Light emission voxel | Long-press / Right-click → Edit |
| **Shape + Light** | Split (blue left, yellow right) | Both present | Context menu with both options |
| **Ghost voxels** | 50% opacity | Slice behind current | Visual reference only |
| **Current voxels** | Solid colors | Current slice | Tap to paint/interact |

### Implementation

```javascript
function create_grid_menu() {
    const container = document.createElement("div");
    container.className = "grid-menu";
    container.style.cssText = "display:flex;flex-direction:column;height:100%;";

    // Main area (grid + 3D preview)
    const mainArea = document.createElement("div");
    mainArea.style.cssText = "display:flex;flex:1;gap:5px;padding:5px;min-height:0;";

    // Grid canvas container
    const gridContainer = document.createElement("div");
    gridContainer.style.cssText = "flex:1;display:flex;align-items:center;justify-content:center;background:#0a0a1a;border-radius:5px;overflow:hidden;";
    
    const gridCanvas = document.createElement("canvas");
    gridCanvas.id = "grid-editor-canvas";
    gridCanvas.style.cssText = "cursor:crosshair;";
    gridContainer.appendChild(gridCanvas);
    mainArea.appendChild(gridContainer);

    // 3D slice preview (top-right)
    const previewContainer = document.createElement("div");
    previewContainer.style.cssText = "width:100px;display:flex;flex-direction:column;gap:5px;";
    
    const preview3D = document.createElement("canvas");
    preview3D.id = "slice-3d-preview";
    preview3D.width = 100;
    preview3D.height = 100;
    preview3D.style.cssText = "background:#0a0a1a;border-radius:5px;";
    previewContainer.appendChild(preview3D);
    
    const sliceLabel = document.createElement("div");
    sliceLabel.id = "slice-label";
    sliceLabel.style.cssText = "text-align:center;font-size:12px;";
    sliceLabel.textContent = "Z = 0";
    previewContainer.appendChild(sliceLabel);
    
    mainArea.appendChild(previewContainer);
    container.appendChild(mainArea);

    // Controls bar
    const controls = document.createElement("div");
    controls.className = "grid-controls";
    controls.style.cssText = "display:flex;flex-wrap:wrap;gap:5px;padding:10px;background:#1a1a2e;";

    // Axis buttons
    const axisGroup = document.createElement("div");
    axisGroup.style.cssText = "display:flex;gap:3px;";
    ["XY", "XZ", "YZ"].forEach(axis => {
        const btn = document.createElement("button");
        btn.textContent = axis;
        btn.className = "grid-axis-btn";
        btn.dataset.axis = axis;
        btn.onclick = () => setGridAxis(axis);
        axisGroup.appendChild(btn);
    });
    controls.appendChild(axisGroup);

    // Slice navigation
    const sliceGroup = document.createElement("div");
    sliceGroup.style.cssText = "display:flex;align-items:center;gap:3px;";
    
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "◀";
    prevBtn.onclick = () => changeSlice(-1);
    
    const sliceInput = document.createElement("input");
    sliceInput.id = "grid-slice-input";
    sliceInput.type = "number";
    sliceInput.value = window.naxelConfig.defaultSlice;
    sliceInput.style.cssText = "width:50px;text-align:center;";
    sliceInput.onchange = () => setSlice(parseInt(sliceInput.value) || 0);
    
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "▶";
    nextBtn.onclick = () => changeSlice(1);
    
    sliceGroup.appendChild(prevBtn);
    sliceGroup.appendChild(sliceInput);
    sliceGroup.appendChild(nextBtn);
    controls.appendChild(sliceGroup);

    // Toggle buttons
    const toggleGroup = document.createElement("div");
    toggleGroup.style.cssText = "display:flex;gap:5px;margin-left:auto;";
    
    const toggles = [
        { id: "toggle-ghost", icon: "👁️", label: "Ghost", default: true },
        { id: "toggle-shapes", icon: "📦", label: "Shapes", default: true },
        { id: "toggle-lights", icon: "💡", label: "Lights", default: true },
    ];
    
    toggles.forEach(({ id, icon, label, default: defaultVal }) => {
        const btn = document.createElement("button");
        btn.id = id;
        btn.textContent = `${icon} ${label}`;
        btn.className = defaultVal ? "toggle-btn active" : "toggle-btn";
        btn.onclick = () => toggleGridOption(id);
        toggleGroup.appendChild(btn);
    });
    controls.appendChild(toggleGroup);

    container.appendChild(controls);

    // Setup event listeners
    setTimeout(() => {
        initGridCanvas();
        initSlice3DPreview();
    }, 0);

    return container;
}

// Grid state
window.gridState = {
    axis: "XY",
    slice: 0,
    zoom: window.naxelConfig?.gridZoom || 16,
    offset: { x: 0, y: 0 },
    showGhost: true,
    showShapes: true,
    showLights: true,
    longPressTimer: null,
    longPressPos: null,
};

function initGridCanvas() {
    const canvas = document.getElementById("grid-editor-canvas");
    if (!canvas) return;

    // Resize to fit container
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Event listeners
    canvas.addEventListener("click", handleGridClick);
    canvas.addEventListener("contextmenu", handleGridRightClick);
    
    // Touch events for long-press
    canvas.addEventListener("touchstart", handleGridTouchStart);
    canvas.addEventListener("touchend", handleGridTouchEnd);
    canvas.addEventListener("touchmove", handleGridTouchMove);

    refreshGridView();
}

function refreshGridView() {
    const canvas = document.getElementById("grid-editor-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { axis, slice, zoom, showGhost, showShapes, showLights } = window.gridState;
    const ghostOpacity = window.naxelConfig?.ghostSliceOpacity || 0.5;

    // Clear
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const naxel = window.naxel_objects["main_naxel"];
    if (!naxel) return;

    // Draw grid lines
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += zoom) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += zoom) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Draw ghost voxels (slice behind)
    if (showGhost) {
        ctx.globalAlpha = ghostOpacity;
        drawSliceVoxels(ctx, naxel, axis, slice - 1, zoom);
        ctx.globalAlpha = 1.0;
    }

    // Draw current slice voxels
    drawSliceVoxels(ctx, naxel, axis, slice, zoom);

    // Draw shape origins (blue borders)
    if (showShapes) {
        drawShapeOrigins(ctx, naxel, axis, slice, zoom);
    }

    // Draw light sources (yellow borders)
    if (showLights) {
        drawLightSources(ctx, naxel, axis, slice, zoom);
    }

    // Update slice label
    const label = document.getElementById("slice-label");
    if (label) {
        const axisLetter = axis === "XY" ? "Z" : axis === "XZ" ? "Y" : "X";
        label.textContent = `${axisLetter} = ${slice}`;
    }
}

function drawSliceVoxels(ctx, naxel, axis, slice, zoom) {
    const voxels = naxel.voxels_dict || {};
    
    Object.entries(voxels).forEach(([posStr, color]) => {
        const [x, y, z] = posStr.split(",").map(Number);
        let drawX, drawY, sliceMatch;

        if (axis === "XY") { drawX = x; drawY = y; sliceMatch = z === slice; }
        else if (axis === "XZ") { drawX = x; drawY = z; sliceMatch = y === slice; }
        else { drawX = y; drawY = z; sliceMatch = x === slice; }

        if (sliceMatch) {
            const [r, g, b] = Array.isArray(color) ? color : [color.r || 0, color.g || 0, color.b || 0];
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(drawX * zoom + 1, drawY * zoom + 1, zoom - 2, zoom - 2);
        }
    });
}

function drawShapeOrigins(ctx, naxel, axis, slice, zoom) {
    const shapes = naxel.voxels_list || [];
    const borderColor = window.naxelConfig?.shapeOriginColor || "#3498db";
    
    shapes.forEach(shape => {
        if (!shape.position) return;
        const pos = parseVec3(shape.position);
        let drawX, drawY, sliceMatch;

        if (axis === "XY") { drawX = pos.x; drawY = pos.y; sliceMatch = pos.z === slice; }
        else if (axis === "XZ") { drawX = pos.x; drawY = pos.z; sliceMatch = pos.y === slice; }
        else { drawX = pos.y; drawY = pos.z; sliceMatch = pos.x === slice; }

        if (sliceMatch) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 3;
            ctx.strokeRect(drawX * zoom, drawY * zoom, zoom, zoom);
        }
    });
}

function drawLightSources(ctx, naxel, axis, slice, zoom) {
    const lights = naxel.light_emission_dict || {};
    const borderColor = window.naxelConfig?.lightSourceColor || "#f1c40f";
    
    Object.keys(lights).forEach(posStr => {
        const [x, y, z] = posStr.split(",").map(Number);
        let drawX, drawY, sliceMatch;

        if (axis === "XY") { drawX = x; drawY = y; sliceMatch = z === slice; }
        else if (axis === "XZ") { drawX = x; drawY = z; sliceMatch = y === slice; }
        else { drawX = y; drawY = z; sliceMatch = x === slice; }

        if (sliceMatch) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 3;
            // Offset slightly if shape border exists
            ctx.strokeRect(drawX * zoom + 2, drawY * zoom + 2, zoom - 4, zoom - 4);
        }
    });
}

// Long-press / Right-click handling
function handleGridTouchStart(e) {
    const touch = e.touches[0];
    const pos = getGridCellFromEvent(touch);
    window.gridState.longPressPos = pos;
    
    window.gridState.longPressTimer = setTimeout(() => {
        showGridContextMenu(pos.cellX, pos.cellY, touch.clientX, touch.clientY);
    }, window.naxelConfig?.longPressDelay || 500);
}

function handleGridTouchEnd(e) {
    clearTimeout(window.gridState.longPressTimer);
}

function handleGridTouchMove(e) {
    clearTimeout(window.gridState.longPressTimer);
}

function handleGridRightClick(e) {
    e.preventDefault();
    const pos = getGridCellFromEvent(e);
    showGridContextMenu(pos.cellX, pos.cellY, e.clientX, e.clientY);
}

function getGridCellFromEvent(e) {
    const canvas = document.getElementById("grid-editor-canvas");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return {
        cellX: Math.floor(x / window.gridState.zoom),
        cellY: Math.floor(y / window.gridState.zoom)
    };
}

function showGridContextMenu(cellX, cellY, screenX, screenY) {
    // Get world position
    const { axis, slice } = window.gridState;
    let worldX, worldY, worldZ;
    if (axis === "XY") { worldX = cellX; worldY = cellY; worldZ = slice; }
    else if (axis === "XZ") { worldX = cellX; worldY = slice; worldZ = cellY; }
    else { worldX = slice; worldY = cellX; worldZ = cellY; }
    
    const posKey = `${worldX},${worldY},${worldZ}`;
    const naxel = window.naxel_objects["main_naxel"];
    
    // Check for shape at this origin
    const shape = naxel.voxels_list?.find(s => {
        const pos = parseVec3(s.position);
        return pos.x === worldX && pos.y === worldY && pos.z === worldZ;
    });
    
    // Check for light
    const light = naxel.light_emission_dict?.[posKey];
    
    // Create context menu
    const menu = document.createElement("div");
    menu.className = "grid-context-menu";
    menu.style.cssText = `position:fixed;left:${screenX}px;top:${screenY}px;background:#24243e;border:1px solid #4a5568;border-radius:5px;padding:5px;z-index:1000;min-width:150px;`;
    
    // Header
    const header = document.createElement("div");
    header.style.cssText = "padding:5px;border-bottom:1px solid #4a5568;font-size:12px;color:#888;";
    header.textContent = `Cell (${worldX}, ${worldY}, ${worldZ})`;
    menu.appendChild(header);
    
    // Shape section
    if (shape) {
        const shapeSection = document.createElement("div");
        shapeSection.style.cssText = "padding:5px;border-bottom:1px solid #4a5568;";
        shapeSection.innerHTML = `
            <div style="color:#3498db;margin-bottom:5px;">🔵 Shape: ${shape.type}</div>
            <button onclick="editShape('${posKey}')" style="width:100%;margin:2px 0;">Edit</button>
            <button onclick="deleteShape('${posKey}')" style="width:100%;margin:2px 0;">Delete</button>
        `;
        menu.appendChild(shapeSection);
    }
    
    // Light section
    if (light) {
        const lightSection = document.createElement("div");
        lightSection.style.cssText = "padding:5px;";
        lightSection.innerHTML = `
            <div style="color:#f1c40f;margin-bottom:5px;">💛 Light Source</div>
            <button onclick="editLight('${posKey}')" style="width:100%;margin:2px 0;">Edit</button>
            <button onclick="removeLight('${posKey}')" style="width:100%;margin:2px 0;">Remove</button>
        `;
        menu.appendChild(lightSection);
    }
    
    // No shape or light
    if (!shape && !light) {
        const emptySection = document.createElement("div");
        emptySection.style.cssText = "padding:10px;color:#888;text-align:center;";
        emptySection.textContent = "Empty cell";
        menu.appendChild(emptySection);
    }
    
    // Close on click outside
    document.body.appendChild(menu);
    setTimeout(() => {
        document.addEventListener("click", function closeMenu() {
            menu.remove();
            document.removeEventListener("click", closeMenu);
        });
    }, 0);
}

// 3D Slice Preview (indicator only, no interaction)
function initSlice3DPreview() {
    refreshSlice3DPreview();
}

function refreshSlice3DPreview() {
    const canvas = document.getElementById("slice-3d-preview");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { axis, slice } = window.gridState;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw 3D axes
    const axisLength = 30;
    
    // Isometric-ish projection
    const axes = {
        X: { dx: 25, dy: 10, color: "#e74c3c" },  // Red
        Y: { dx: -25, dy: 10, color: "#2ecc71" }, // Green
        Z: { dx: 0, dy: -30, color: "#3498db" },  // Blue
    };

    // Draw axes
    Object.entries(axes).forEach(([name, { dx, dy, color }]) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + dx, cy + dy);
        ctx.stroke();
        
        // Label
        ctx.fillStyle = color;
        ctx.font = "10px sans-serif";
        ctx.fillText(name, cx + dx * 1.2 - 3, cy + dy * 1.2 + 3);
    });

    // Draw slice plane (semi-transparent rectangle)
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1;

    ctx.beginPath();
    if (axis === "XY") {
        // Flat plane on Z
        ctx.moveTo(cx - 20, cy + 5);
        ctx.lineTo(cx + 20, cy + 15);
        ctx.lineTo(cx + 20, cy - 5);
        ctx.lineTo(cx - 20, cy - 15);
    } else if (axis === "XZ") {
        // Vertical plane on Y
        ctx.moveTo(cx + 20, cy + 10);
        ctx.lineTo(cx + 20, cy - 20);
        ctx.lineTo(cx - 5, cy - 25);
        ctx.lineTo(cx - 5, cy + 5);
    } else {
        // Vertical plane on X
        ctx.moveTo(cx - 20, cy + 10);
        ctx.lineTo(cx - 20, cy - 20);
        ctx.lineTo(cx + 5, cy - 25);
        ctx.lineTo(cx + 5, cy + 5);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function setGridAxis(axis) {
    window.gridState.axis = axis;
    refreshGridView();
    refreshSlice3DPreview();
    
    // Update button states
    document.querySelectorAll(".grid-axis-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.axis === axis);
    });
}

function changeSlice(delta) {
    window.gridState.slice += delta;
    document.getElementById("grid-slice-input").value = window.gridState.slice;
    refreshGridView();
}

function setSlice(value) {
    window.gridState.slice = value;
    refreshGridView();
}

function toggleGridOption(id) {
    const btn = document.getElementById(id);
    btn.classList.toggle("active");
    
    if (id === "toggle-ghost") window.gridState.showGhost = btn.classList.contains("active");
    if (id === "toggle-shapes") window.gridState.showShapes = btn.classList.contains("active");
    if (id === "toggle-lights") window.gridState.showLights = btn.classList.contains("active");
    
    refreshGridView();
}
```

---

## 3. Tools Menu

Separate menu for drawing tools and brushes.

### Layout

```
┌─────────────────────────────────────────┐
│ 🔧 TOOLS                                │
├─────────────────────────────────────────┤
│ BASIC                                   │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        │
│ │ ✏️  │ │ 🧽  │ │ 💧  │ │ 🎯  │        │
│ │Paint│ │Erase│ │Fill │ │Pick │        │
│ └─────┘ └─────┘ └─────┘ └─────┘        │
├─────────────────────────────────────────┤
│ SHAPES                                  │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        │
│ │ ⬜  │ │ ⚪  │ │ 📏  │ │ ⭕  │        │
│ │Rect │ │Sphere│ │Line │ │Circle│       │
│ └─────┘ └─────┘ └─────┘ └─────┘        │
├─────────────────────────────────────────┤
│ OPTIONS                                 │
│ Brush Size: [1] [2] [3] [5]             │
│ Shape: ○ Filled  ● Hollow               │
└─────────────────────────────────────────┘
```

### Implementation

```javascript
function create_tools_menu() {
    const container = document.createElement("div");
    container.className = "tools-menu";
    container.style.cssText = "display:flex;flex-direction:column;height:100%;padding:10px;gap:15px;overflow-y:auto;";

    // Basic tools section
    const basicSection = createToolSection("BASIC", [
        { id: "paint", icon: "✏️", label: "Paint" },
        { id: "erase", icon: "🧽", label: "Erase" },
        { id: "fill", icon: "💧", label: "Fill" },
        { id: "eyedropper", icon: "🎯", label: "Pick" },
    ]);
    container.appendChild(basicSection);

    // Shape tools section
    const shapeSection = createToolSection("SHAPES", [
        { id: "shape_rect", icon: "⬜", label: "Rect" },
        { id: "shape_sphere", icon: "⚪", label: "Sphere" },
        { id: "shape_line", icon: "📏", label: "Line" },
        { id: "shape_circle", icon: "⭕", label: "Circle" },
        { id: "shape_cube", icon: "📦", label: "Cube" },
    ]);
    container.appendChild(shapeSection);

    // Options section
    const optionsSection = document.createElement("div");
    optionsSection.innerHTML = `
        <div style="font-size:12px;color:#888;margin-bottom:10px;">OPTIONS</div>
        <div style="margin-bottom:10px;">
            <span>Brush Size: </span>
            <button class="brush-size-btn" data-size="1">1</button>
            <button class="brush-size-btn active" data-size="2">2</button>
            <button class="brush-size-btn" data-size="3">3</button>
            <button class="brush-size-btn" data-size="5">5</button>
        </div>
        <div>
            <label><input type="radio" name="shape-mode" value="filled" checked> Filled</label>
            <label><input type="radio" name="shape-mode" value="hollow"> Hollow</label>
        </div>
    `;
    container.appendChild(optionsSection);

    return container;
}

function createToolSection(title, tools) {
    const section = document.createElement("div");
    
    const header = document.createElement("div");
    header.style.cssText = "font-size:12px;color:#888;margin-bottom:10px;";
    header.textContent = title;
    section.appendChild(header);
    
    const grid = document.createElement("div");
    grid.style.cssText = "display:flex;flex-wrap:wrap;gap:10px;";
    
    tools.forEach(({ id, icon, label }) => {
        const btn = document.createElement("button");
        btn.className = "tool-btn";
        btn.dataset.tool = id;
        btn.innerHTML = `<span style="font-size:20px;">${icon}</span><br><span style="font-size:10px;">${label}</span>`;
        btn.style.cssText = "width:60px;height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#1a1a2e;border:2px solid #4a5568;border-radius:8px;color:white;cursor:pointer;";
        btn.onclick = () => selectTool(id);
        grid.appendChild(btn);
    });
    
    section.appendChild(grid);
    return section;
}

window.toolState = {
    currentTool: "paint",
    brushSize: 1,
    shapeMode: "filled",
};

function selectTool(toolId) {
    window.toolState.currentTool = toolId;
    
    document.querySelectorAll(".tool-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.tool === toolId);
        btn.style.borderColor = btn.dataset.tool === toolId ? "#3498db" : "#4a5568";
    });
}
```

---

## 4. Environment Menu

```javascript
function create_environment_menu() {
    const container = document.createElement("div");
    container.className = "environment-menu";
    container.style.cssText = "display:flex;flex-direction:column;height:100%;padding:10px;gap:15px;overflow-y:auto;";

    // Environment type
    const typeSection = document.createElement("div");
    typeSection.innerHTML = `
        <div style="margin-bottom:10px;">
            <label><input type="radio" name="env-type" value="color" checked onchange="setEnvironmentType('color')"> Solid Color</label>
            <label><input type="radio" name="env-type" value="skybox" onchange="setEnvironmentType('skybox')"> Skybox</label>
        </div>
    `;
    container.appendChild(typeSection);

    // Options container
    const optionsDiv = document.createElement("div");
    optionsDiv.id = "env-options";
    container.appendChild(optionsDiv);

    setTimeout(() => refreshEnvironmentOptions(), 0);
    return container;
}

function refreshEnvironmentOptions() {
    const naxel = window.naxel_objects["main_naxel"];
    const type = naxel?.environment_type || "color";
    const optionsDiv = document.getElementById("env-options");
    if (!optionsDiv) return;
    
    optionsDiv.innerHTML = "";

    if (type === "color") {
        optionsDiv.innerHTML = `
            <div class="env-option">
                <label>Background Color:</label>
                <input type="color" id="env-color" value="${rgbToHex(naxel?.environment_color || [30, 30, 50])}" onchange="updateEnvColor()">
            </div>
            <div class="env-option">
                <label>Light Emission:</label>
                <input type="range" id="env-emission" min="0" max="2" step="0.1" value="${naxel?.environment_color_light_emission || 1}">
            </div>
        `;
    } else {
        optionsDiv.innerHTML = `
            <div class="env-option">
                <label>Sky Color:</label>
                <input type="color" id="sky-color" value="${rgbToHex(naxel?.sky_color || [135, 206, 235])}">
            </div>
            <div class="env-option">
                <label>Ground Color:</label>
                <input type="color" id="ground-color" value="${rgbToHex(naxel?.ground_color || [100, 80, 60])}">
            </div>
            <div class="env-option">
                <label>Sun Direction:</label>
                <div style="display:flex;gap:5px;">
                    <input type="number" id="sun-x" value="${naxel?.sun_direction?.[0] || 0}" style="width:50px;">
                    <input type="number" id="sun-y" value="${naxel?.sun_direction?.[1] || -1}" style="width:50px;">
                    <input type="number" id="sun-z" value="${naxel?.sun_direction?.[2] || 0}" style="width:50px;">
                </div>
            </div>
            <div class="env-option">
                <label>Sun Emission:</label>
                <input type="range" id="sun-emission" min="0" max="2" step="0.1" value="${naxel?.sun_light_emission || 1}">
            </div>
        `;
    }
}
```

---

## 5. Lights Menu

```javascript
function create_lights_menu() {
    const container = document.createElement("div");
    container.className = "lights-menu";
    container.style.cssText = "display:flex;flex-direction:column;height:100%;padding:10px;gap:15px;overflow-y:auto;";

    container.innerHTML = `
        <div>
            <label>Algorithm:</label>
            <select id="light-algorithm" onchange="updateLightAlgorithm()">
                <option value="none">None</option>
                <option value="simple_diffusion">Simple Diffusion</option>
            </select>
        </div>
        <div>
            <label>Diffusion Strength:</label>
            <input type="range" id="light-diffusion" min="0" max="2" step="0.1" value="1">
            <span id="light-diffusion-value">1.0</span>
        </div>
        <hr style="border-color:#4a5568;">
        <div>
            <strong>Light Sources</strong>
            <p style="font-size:12px;color:#888;">Light sources are shown with yellow borders in the Grid view. Long-press or right-click to edit.</p>
        </div>
        <div id="light-sources-list"></div>
    `;

    setTimeout(() => refreshLightsList(), 0);
    return container;
}

function refreshLightsList() {
    const list = document.getElementById("light-sources-list");
    if (!list) return;
    
    const lights = window.naxel_objects["main_naxel"]?.light_emission_dict || {};
    list.innerHTML = "";
    
    if (Object.keys(lights).length === 0) {
        list.innerHTML = '<p style="color:#888;font-size:12px;">No light sources defined.</p>';
        return;
    }
    
    Object.entries(lights).forEach(([posStr, emission]) => {
        const item = document.createElement("div");
        item.style.cssText = "background:#1a1a2e;padding:10px;border-radius:5px;margin-bottom:5px;";
        item.innerHTML = `
            <div>💡 Position: ${posStr}</div>
            <div style="font-size:12px;color:#888;">Emission: (${emission.join(", ")})</div>
            <button onclick="goToLight('${posStr}')" style="margin-top:5px;">Go To</button>
        `;
        list.appendChild(item);
    });
}

function goToLight(posStr) {
    const [x, y, z] = posStr.split(",").map(Number);
    // Navigate grid to this position
    window.gridState.slice = z; // Assuming XY axis
    document.getElementById("grid-slice-input").value = z;
    refreshGridView();
}
```

---

## 6. Metadata Menu

```javascript
function create_metadata_menu() {
    const container = document.createElement("div");
    container.className = "metadata-menu";
    container.style.cssText = "display:flex;flex-direction:column;height:100%;padding:10px;gap:10px;overflow-y:auto;";

    const fields = [
        { key: "name", label: "Name", type: "text" },
        { key: "author", label: "Author", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "license", label: "License", type: "text" },
        { key: "tags", label: "Tags (comma-separated)", type: "text" },
    ];

    fields.forEach(({ key, label, type }) => {
        const row = document.createElement("div");
        row.style.marginBottom = "10px";

        const lbl = document.createElement("label");
        lbl.textContent = label + ":";
        lbl.style.cssText = "display:block;margin-bottom:3px;font-size:14px;";
        row.appendChild(lbl);

        const input = document.createElement(type === "textarea" ? "textarea" : "input");
        input.id = `metadata-${key}`;
        input.style.cssText = "width:100%;padding:8px;background:#1a1a2e;color:white;border:1px solid #4a5568;border-radius:5px;";
        if (type === "textarea") input.rows = 3;

        input.onchange = () => {
            let value = input.value;
            if (key === "tags") value = value.split(",").map(t => t.trim()).filter(t => t);
            window.naxel_objects["main_naxel"][key] = value;
            window.historyManager?.saveState();
        };

        row.appendChild(input);
        container.appendChild(row);
    });

    setTimeout(() => loadMetadataValues(), 0);
    return container;
}

function loadMetadataValues() {
    const naxel = window.naxel_objects["main_naxel"];
    const fields = ["name", "author", "description", "license", "tags"];
    
    fields.forEach(key => {
        const input = document.getElementById(`metadata-${key}`);
        if (input) {
            let val = naxel?.[key] || "";
            if (Array.isArray(val)) val = val.join(", ");
            input.value = val;
        }
    });
}
```

---

## 7. JSON Subpage

```javascript
function initJsonSubpage() {
    const subpage = document.getElementById("subpage-json");
    if (!subpage || subpage.children.length > 0) return;

    subpage.style.cssText = "display:flex;flex-direction:column;padding:10px;gap:10px;";

    const btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex;gap:10px;flex-wrap:wrap;";

    const buttons = [
        { text: "📥 From Scene", action: loadJsonFromScene },
        { text: "📤 To Scene", action: applyJsonToScene },
        { text: "💾 Download", action: downloadJson },
        { text: "📂 Import", action: importJsonFile },
    ];

    buttons.forEach(({ text, action }) => {
        const btn = document.createElement("button");
        btn.textContent = text;
        btn.onclick = action;
        btn.style.cssText = "padding:10px 15px;background:#24243e;color:white;border:1px solid #4a5568;border-radius:5px;cursor:pointer;";
        btnRow.appendChild(btn);
    });
    subpage.appendChild(btnRow);

    const textarea = document.createElement("textarea");
    textarea.id = "json-editor";
    textarea.style.cssText = "flex:1;font-family:monospace;font-size:12px;background:#1a1a2e;color:#fff;border:1px solid #4a5568;padding:10px;resize:none;border-radius:5px;";
    subpage.appendChild(textarea);
}

function loadJsonFromScene() {
    document.getElementById("json-editor").value = JSON.stringify(window.naxel_objects["main_naxel"], null, 2);
}

function applyJsonToScene() {
    try {
        window.naxel_objects["main_naxel"] = JSON.parse(document.getElementById("json-editor").value);
        render_all_naxels();
        alert("Applied!");
    } catch (e) {
        alert("Invalid JSON: " + e.message);
    }
}

function downloadJson() {
    const json = document.getElementById("json-editor").value || JSON.stringify(window.naxel_objects["main_naxel"], null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (window.naxel_objects["main_naxel"]?.name || "naxel") + ".json";
    a.click();
}

function importJsonFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = e => {
        const reader = new FileReader();
        reader.onload = evt => document.getElementById("json-editor").value = evt.target.result;
        reader.readAsText(e.target.files[0]);
    };
    input.click();
}
```

---

## 8. Undo/Redo System

```javascript
window.historyManager = {
    undoStack: [],
    redoStack: [],
    maxSize: 50,

    saveState() {
        this.undoStack.push(JSON.stringify(window.naxel_objects["main_naxel"]));
        if (this.undoStack.length > this.maxSize) this.undoStack.shift();
        this.redoStack = [];
    },

    undo() {
        if (this.undoStack.length === 0) return;
        this.redoStack.push(JSON.stringify(window.naxel_objects["main_naxel"]));
        window.naxel_objects["main_naxel"] = JSON.parse(this.undoStack.pop());
        render_all_naxels();
        refreshGridView?.();
    },

    redo() {
        if (this.redoStack.length === 0) return;
        this.undoStack.push(JSON.stringify(window.naxel_objects["main_naxel"]));
        window.naxel_objects["main_naxel"] = JSON.parse(this.redoStack.pop());
        render_all_naxels();
        refreshGridView?.();
    }
};

document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        e.shiftKey ? window.historyManager.redo() : window.historyManager.undo();
    }
    if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        window.historyManager.redo();
    }
});
```

---

## 9. Helper Functions

```javascript
// src/utils.js

function rgbToHex(rgb) {
    if (!rgb) return "#000000";
    const [r, g, b] = Array.isArray(rgb) ? rgb : [rgb.r || 0, rgb.g || 0, rgb.b || 0];
    return "#" + [r, g, b].map(x => Math.max(0, Math.min(255, x)).toString(16).padStart(2, "0")).join("");
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
}

function parseVec3(input) {
    if (Array.isArray(input)) return { x: input[0], y: input[1], z: input[2] };
    if (typeof input === "object") return input;
    if (typeof input === "string") {
        const parts = input.split(/[,\s_\-\.]+/).map(Number);
        return { x: parts[0] || 0, y: parts[1] || 0, z: parts[2] || 0 };
    }
    return { x: 0, y: 0, z: 0 };
}
```

---

## 10. Implementation Priority

1. **Config & Utils** - Global variables, helper functions
2. **Grid Menu** - Core editing (with 3D preview, ghost, shape/light borders)
3. **Palette Menu** - Color selection (Option B)
4. **Tools Menu** - Paint/erase/shapes
5. **JSON Subpage** - Import/export
6. **Metadata Menu** - Simple forms
7. **Environment Menu** - Background settings
8. **Lights Menu** - Light algorithm settings
9. **Camera Menu** - 3D viewport
10. **Undo/Redo** - History system
