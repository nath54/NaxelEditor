/**
 * Tools Menu - Drawing tools and shapes
 * Separate menu for mobile-friendly tool selection
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
    container.style.cssText = "display:flex;flex-direction:column;height:100%;padding:10px;gap:15px;overflow-y:auto;";

    // Basic tools section
    const basicSection = createToolSection("BASIC TOOLS", [
        { id: "paint", icon: "✏️", label: "Paint", description: "Place voxels" },
        { id: "erase", icon: "🧽", label: "Erase", description: "Remove voxels" },
        { id: "fill", icon: "💧", label: "Fill", description: "Fill area" },
        { id: "eyedropper", icon: "🎯", label: "Pick", description: "Pick color" },
    ]);
    container.appendChild(basicSection);

    // Shape tools section
    const shapeSection = createToolSection("SHAPE TOOLS", [
        { id: "shape_rect", icon: "⬜", label: "Rect", description: "Draw rectangle" },
        { id: "shape_cube", icon: "📦", label: "Cube", description: "Draw 3D cube" },
        { id: "shape_sphere", icon: "⚪", label: "Sphere", description: "Draw sphere" },
        { id: "shape_line", icon: "📏", label: "Line", description: "Draw line" },
        { id: "shape_circle", icon: "⭕", label: "Circle", description: "Draw circle" },
    ]);
    container.appendChild(shapeSection);

    // Options section
    const optionsSection = document.createElement("div");
    optionsSection.className = "tools-options";

    const optionsHeader = document.createElement("div");
    optionsHeader.className = "tools-section-header";
    optionsHeader.textContent = "OPTIONS";
    optionsSection.appendChild(optionsHeader);

    // Brush size
    const brushSizeRow = document.createElement("div");
    brushSizeRow.style.cssText = "margin-bottom:15px;";

    const brushLabel = document.createElement("div");
    brushLabel.textContent = "Brush Size:";
    brushLabel.style.cssText = "margin-bottom:8px;font-size:12px;color:#888;";
    brushSizeRow.appendChild(brushLabel);

    const brushSizes = document.createElement("div");
    brushSizes.style.cssText = "display:flex;gap:5px;";
    [1, 2, 3, 5].forEach(size => {
        const btn = document.createElement("button");
        btn.textContent = size;
        btn.className = "brush-size-btn" + (size === 1 ? " active" : "");
        btn.dataset.size = size;
        btn.onclick = () => setBrushSize(size);
        brushSizes.appendChild(btn);
    });
    brushSizeRow.appendChild(brushSizes);
    optionsSection.appendChild(brushSizeRow);

    // Shape mode
    const shapeModeRow = document.createElement("div");
    shapeModeRow.style.cssText = "margin-bottom:15px;";

    const modeLabel = document.createElement("div");
    modeLabel.textContent = "Shape Mode:";
    modeLabel.style.cssText = "margin-bottom:8px;font-size:12px;color:#888;";
    shapeModeRow.appendChild(modeLabel);

    const modeContainer = document.createElement("div");
    modeContainer.style.cssText = "display:flex;gap:15px;";

    const filledLabel = document.createElement("label");
    filledLabel.style.cssText = "display:flex;align-items:center;gap:5px;cursor:pointer;";
    filledLabel.innerHTML = '<input type="radio" name="shape-mode" value="filled" checked> Filled';
    filledLabel.querySelector("input").onchange = () => setShapeMode("filled");
    modeContainer.appendChild(filledLabel);

    const hollowLabel = document.createElement("label");
    hollowLabel.style.cssText = "display:flex;align-items:center;gap:5px;cursor:pointer;";
    hollowLabel.innerHTML = '<input type="radio" name="shape-mode" value="hollow"> Hollow';
    hollowLabel.querySelector("input").onchange = () => setShapeMode("hollow");
    modeContainer.appendChild(hollowLabel);

    shapeModeRow.appendChild(modeContainer);
    optionsSection.appendChild(shapeModeRow);

    container.appendChild(optionsSection);

    // Current tool indicator
    const currentToolDiv = document.createElement("div");
    currentToolDiv.id = "current-tool-indicator";
    currentToolDiv.style.cssText = "margin-top:auto;padding:10px;background:#1a1a2e;border-radius:5px;text-align:center;";
    currentToolDiv.innerHTML = '<span style="color:#888;">Current:</span> <strong id="current-tool-name">✏️ Paint</strong>';
    container.appendChild(currentToolDiv);

    return container;
}

/**
 * Create a tool section with buttons
 */
function createToolSection(title, tools) {
    const section = document.createElement("div");
    section.className = "tools-section";

    const header = document.createElement("div");
    header.className = "tools-section-header";
    header.textContent = title;
    section.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "tools-grid";

    tools.forEach(({ id, icon, label, description }) => {
        const btn = document.createElement("button");
        btn.className = "tool-btn" + (id === "paint" ? " active" : "");
        btn.dataset.tool = id;
        btn.title = description;

        const iconSpan = document.createElement("span");
        iconSpan.className = "tool-icon";
        iconSpan.textContent = icon;
        btn.appendChild(iconSpan);

        const labelSpan = document.createElement("span");
        labelSpan.className = "tool-label";
        labelSpan.textContent = label;
        btn.appendChild(labelSpan);

        btn.onclick = () => selectTool(id, icon, label);
        grid.appendChild(btn);
    });

    section.appendChild(grid);
    return section;
}

/**
 * Select a tool
 */
function selectTool(toolId, icon, label) {
    window.toolState.currentTool = toolId;
    window.toolState.shapeStartPos = null;

    // Update button states
    document.querySelectorAll(".tool-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.tool === toolId);
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
        btn.classList.toggle("active", parseInt(btn.dataset.size) === size);
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
