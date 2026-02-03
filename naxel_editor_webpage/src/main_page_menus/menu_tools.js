/**
 * Tools Menu - Drawing tools and shapes
 * Compact horizontal layout with two rows
 */

// Tool state
window.toolState = {
    currentTool: "paint",
    brushSize: 1,
    shapeMode: "filled",
    shapeStartPos: null,
};

/**
 * Create the tools menu
 */
function create_tools_menu() {
    const container = document.createElement("div");
    container.className = "tools-menu";
    container.style.cssText = "display:flex;flex-direction:column;height:100%;padding:8px;gap:8px;";

    // Row 1: All tool buttons in a horizontal scrollable row
    const toolsRow = document.createElement("div");
    toolsRow.style.cssText = "display:flex;gap:6px;overflow-x:auto;padding:4px 0;flex-shrink:0;";

    // All tools in one row
    const allTools = [
        { id: "paint", icon: "✏️", label: "Paint" },
        { id: "erase", icon: "🧽", label: "Erase" },
        { id: "fill", icon: "💧", label: "Fill" },
        { id: "eyedropper", icon: "🎯", label: "Pick" },
        { id: "shape_rect", icon: "⬜", label: "Rect" },
        { id: "shape_cube", icon: "📦", label: "Cube" },
        { id: "shape_sphere", icon: "⚪", label: "Sphere" },
        { id: "shape_line", icon: "📏", label: "Line" },
        { id: "shape_circle", icon: "⭕", label: "Circle" },
    ];

    allTools.forEach(({ id, icon, label }) => {
        const btn = document.createElement("button");
        btn.className = "tool-btn" + (id === "paint" ? " active" : "");
        btn.dataset.tool = id;
        btn.title = label;
        btn.style.cssText = "display:flex;flex-direction:column;align-items:center;padding:6px 10px;background:#2d2d44;border:1px solid #4a5568;border-radius:5px;cursor:pointer;min-width:50px;flex-shrink:0;";
        btn.innerHTML = `<span style="font-size:18px;">${icon}</span><span style="font-size:10px;color:#aaa;">${label}</span>`;
        btn.onclick = () => selectTool(id, icon, label);
        toolsRow.appendChild(btn);
    });
    container.appendChild(toolsRow);

    // Row 2: Options in a horizontal scrollable row
    const optionsRow = document.createElement("div");
    optionsRow.style.cssText = "display:flex;gap:12px;overflow-x:auto;padding:4px 0;align-items:center;flex-shrink:0;";

    // Brush size buttons
    const brushGroup = document.createElement("div");
    brushGroup.style.cssText = "display:flex;align-items:center;gap:4px;flex-shrink:0;";
    brushGroup.innerHTML = '<span style="font-size:11px;color:#888;">Size:</span>';
    [1, 2, 3, 5].forEach(size => {
        const btn = document.createElement("button");
        btn.textContent = size;
        btn.className = "brush-size-btn" + (size === 1 ? " active" : "");
        btn.dataset.size = size;
        btn.style.cssText = "padding:4px 8px;background:#2d2d44;border:1px solid #4a5568;border-radius:4px;cursor:pointer;color:white;font-size:12px;";
        btn.onclick = () => setBrushSize(size);
        brushGroup.appendChild(btn);
    });
    optionsRow.appendChild(brushGroup);

    // Shape mode radio
    const modeGroup = document.createElement("div");
    modeGroup.style.cssText = "display:flex;align-items:center;gap:8px;flex-shrink:0;";
    modeGroup.innerHTML = `
        <span style="font-size:11px;color:#888;">Mode:</span>
        <label style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:12px;">
            <input type="radio" name="shape-mode" value="filled" checked style="margin:0;"> Fill
        </label>
        <label style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:12px;">
            <input type="radio" name="shape-mode" value="hollow" style="margin:0;"> Hollow
        </label>
    `;
    modeGroup.querySelectorAll("input").forEach(input => {
        input.onchange = () => setShapeMode(input.value);
    });
    optionsRow.appendChild(modeGroup);

    // Current tool indicator
    const indicator = document.createElement("div");
    indicator.style.cssText = "display:flex;align-items:center;gap:4px;margin-left:auto;padding:4px 8px;background:#1a1a2e;border-radius:4px;flex-shrink:0;";
    indicator.innerHTML = '<span style="color:#888;font-size:11px;">Current:</span> <strong id="current-tool-name" style="font-size:12px;">✏️ Paint</strong>';
    optionsRow.appendChild(indicator);

    container.appendChild(optionsRow);

    return container;
}

/**
 * Select a tool
 */
function selectTool(toolId, icon, label) {
    window.toolState.currentTool = toolId;
    window.toolState.shapeStartPos = null;

    // Update button states
    document.querySelectorAll(".tool-btn").forEach(btn => {
        const isActive = btn.dataset.tool === toolId;
        btn.classList.toggle("active", isActive);
        btn.style.background = isActive ? "#3498db" : "#2d2d44";
        btn.style.borderColor = isActive ? "#3498db" : "#4a5568";
    });

    // Update indicator
    const indicator = document.getElementById("current-tool-name");
    if (indicator) {
        indicator.textContent = `${icon || ""} ${label || toolId}`;
    }

    // Update cursor on grid canvas
    const gridCanvas = document.getElementById("grid-editor-canvas");
    if (gridCanvas) {
        if (toolId === "erase") {
            gridCanvas.style.cursor = "not-allowed";
        } else if (toolId === "eyedropper") {
            gridCanvas.style.cursor = "crosshair";
        } else if (toolId.startsWith("shape_")) {
            gridCanvas.style.cursor = "cell";
        } else {
            gridCanvas.style.cursor = "crosshair";
        }
    }
}

/**
 * Set brush size
 */
function setBrushSize(size) {
    window.toolState.brushSize = size;

    // Update button states
    document.querySelectorAll(".brush-size-btn").forEach(btn => {
        const isActive = parseInt(btn.dataset.size) === size;
        btn.classList.toggle("active", isActive);
        btn.style.background = isActive ? "#3498db" : "#2d2d44";
        btn.style.borderColor = isActive ? "#3498db" : "#4a5568";
    });
}

/**
 * Set shape mode (filled/hollow)
 */
function setShapeMode(mode) {
    window.toolState.shapeMode = mode;
}

/**
 * Get the current tool
 */
function getCurrentTool() {
    return window.toolState.currentTool;
}

// Expose functions
window.selectTool = selectTool;
window.setBrushSize = setBrushSize;
window.setShapeMode = setShapeMode;
window.getCurrentTool = getCurrentTool;
