/**
 * Grid Menu - 2D Slice Editor with 3D Preview
 * Features: Ghost voxels, shape/light indicators, context menus
 */

// Grid state
window.gridState = {
    axis: "XY",
    slice: 0,
    zoom: 16,
    offset: { x: 0, y: 0 },
    showGhost: true,
    showShapes: true,
    showLights: true,
    longPressTimer: null,
    longPressPos: null,
    isDragging: false,
};

/**
 * Create the grid menu
 */
function create_grid_menu() {
    const container = document.createElement("div");
    container.className = "grid-menu";
    container.style.cssText = "display:flex;flex-direction:column;height:100%;";

    // Main area (grid + 3D preview)
    const mainArea = document.createElement("div");
    mainArea.style.cssText = "display:flex;flex:1;gap:5px;padding:5px;min-height:0;";

    // Grid canvas container
    const gridContainer = document.createElement("div");
    gridContainer.id = "grid-canvas-container";
    gridContainer.style.cssText = "flex:1;display:flex;align-items:center;justify-content:center;background:#0a0a1a;border-radius:5px;overflow:hidden;position:relative;";

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
    preview3D.style.cssText = "background:#0a0a1a;border-radius:5px;border:1px solid #4a5568;";
    previewContainer.appendChild(preview3D);

    const sliceLabel = document.createElement("div");
    sliceLabel.id = "slice-label";
    sliceLabel.style.cssText = "text-align:center;font-size:12px;color:#888;";
    sliceLabel.textContent = "Z = 0";
    previewContainer.appendChild(sliceLabel);

    mainArea.appendChild(previewContainer);
    container.appendChild(mainArea);

    // Controls bar
    const controls = document.createElement("div");
    controls.className = "grid-controls";
    controls.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;padding:10px;background:#1a1a2e;align-items:center;";

    // Axis buttons
    const axisGroup = document.createElement("div");
    axisGroup.style.cssText = "display:flex;gap:3px;";
    ["XY", "XZ", "YZ"].forEach(axis => {
        const btn = document.createElement("button");
        btn.textContent = axis;
        btn.className = "grid-axis-btn" + (axis === "XY" ? " active" : "");
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
    prevBtn.className = "grid-nav-btn";
    prevBtn.onclick = () => changeSlice(-1);

    const sliceInput = document.createElement("input");
    sliceInput.id = "grid-slice-input";
    sliceInput.type = "number";
    sliceInput.value = window.naxelConfig?.defaultSlice || 0;
    sliceInput.style.cssText = "width:50px;text-align:center;padding:5px;background:#0a0a1a;color:white;border:1px solid #4a5568;border-radius:3px;";
    sliceInput.onchange = () => setSlice(parseInt(sliceInput.value) || 0);

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "▶";
    nextBtn.className = "grid-nav-btn";
    nextBtn.onclick = () => changeSlice(1);

    sliceGroup.appendChild(prevBtn);
    sliceGroup.appendChild(sliceInput);
    sliceGroup.appendChild(nextBtn);
    controls.appendChild(sliceGroup);

    // Toggle buttons
    const toggleGroup = document.createElement("div");
    toggleGroup.style.cssText = "display:flex;gap:5px;margin-left:auto;";

    const toggles = [
        { id: "toggle-ghost", icon: "👁️", label: "Ghost", key: "showGhost" },
        { id: "toggle-shapes", icon: "📦", label: "Shapes", key: "showShapes" },
        { id: "toggle-lights", icon: "💡", label: "Lights", key: "showLights" },
    ];

    toggles.forEach(({ id, icon, label, key }) => {
        const btn = document.createElement("button");
        btn.id = id;
        btn.textContent = `${icon}`;
        btn.title = label;
        btn.className = "grid-toggle-btn" + (window.gridState[key] ? " active" : "");
        btn.onclick = () => toggleGridOption(key, id);
        toggleGroup.appendChild(btn);
    });
    controls.appendChild(toggleGroup);

    container.appendChild(controls);

    // Setup event listeners after DOM is rendered
    // Use requestAnimationFrame for better timing than setTimeout
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            initGridCanvas();
            initSlice3DPreview();
        });
    });

    return container;
}

/**
 * Initialize the grid canvas
 */
function initGridCanvas() {
    const canvas = document.getElementById("grid-editor-canvas");
    if (!canvas) return;

    // Resize to fit container (with fallback for 0 dimensions)
    const container = canvas.parentElement;
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;
    canvas.width = Math.max(width - 10, 100);
    canvas.height = Math.max(height - 10, 100);

    // Mouse events
    canvas.addEventListener("click", handleGridClick);
    canvas.addEventListener("contextmenu", handleGridRightClick);
    canvas.addEventListener("mousemove", handleGridMouseMove);

    // Touch events for long-press
    canvas.addEventListener("touchstart", handleGridTouchStart, { passive: false });
    canvas.addEventListener("touchend", handleGridTouchEnd);
    canvas.addEventListener("touchmove", handleGridTouchMove, { passive: false });

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
        const w = container.clientWidth || 300;
        const h = container.clientHeight || 300;
        canvas.width = Math.max(w - 10, 100);
        canvas.height = Math.max(h - 10, 100);
        refreshGridView();
    });
    resizeObserver.observe(container);

    refreshGridView();
}

/**
 * Refresh the grid view
 */
function refreshGridView() {
    const canvas = document.getElementById("grid-editor-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { axis, slice, zoom, showGhost, showShapes, showLights } = window.gridState;
    const ghostOpacity = window.naxelConfig?.ghostSliceOpacity || 0.5;

    // Clear
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const naxel = getMainNaxel();
    if (!naxel) return;

    // Draw grid lines
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += zoom) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += zoom) {
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
    updateSliceLabel();

    // Update 3D preview
    refreshSlice3DPreview();
}

/**
 * Draw voxels for a specific slice
 */
function drawSliceVoxels(ctx, naxel, axis, slice, zoom) {
    const voxels = naxel.voxels_dict || {};
    const palette = naxel.color_palette || {};

    Object.entries(voxels).forEach(([posStr, colorRef]) => {
        const [x, y, z] = posStr.split(",").map(Number);
        let drawX, drawY, sliceMatch;

        if (axis === "XY") { drawX = x; drawY = y; sliceMatch = z === slice; }
        else if (axis === "XZ") { drawX = x; drawY = z; sliceMatch = y === slice; }
        else { drawX = y; drawY = z; sliceMatch = x === slice; }

        if (sliceMatch) {
            // Resolve color from palette if it's a string
            let rgb;
            if (typeof colorRef === "string") {
                rgb = palette[colorRef] || [128, 128, 128];
            } else if (Array.isArray(colorRef)) {
                rgb = colorRef;
            } else if (colorRef && typeof colorRef === "object") {
                rgb = [colorRef.r || 128, colorRef.g || 128, colorRef.b || 128];
            } else {
                rgb = [128, 128, 128];
            }

            ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
            ctx.fillRect(drawX * zoom + 1, drawY * zoom + 1, zoom - 2, zoom - 2);
        }
    });
}

/**
 * Draw shape origin indicators
 */
function drawShapeOrigins(ctx, naxel, axis, slice, zoom) {
    const shapes = naxel.voxels_list || [];
    const borderColor = window.naxelConfig?.shapeOriginColor || "#3498db";

    shapes.forEach(shape => {
        if (!shape.position) return;
        const pos = parseVec3Editor(shape.position);
        let drawX, drawY, sliceMatch;

        if (axis === "XY") { drawX = pos.x; drawY = pos.y; sliceMatch = pos.z === slice; }
        else if (axis === "XZ") { drawX = pos.x; drawY = pos.z; sliceMatch = pos.y === slice; }
        else { drawX = pos.y; drawY = pos.z; sliceMatch = pos.x === slice; }

        if (sliceMatch) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 3;
            ctx.strokeRect(drawX * zoom + 2, drawY * zoom + 2, zoom - 4, zoom - 4);
        }
    });
}

/**
 * Draw light source indicators
 */
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
            ctx.lineWidth = 2;
            // Slightly smaller to show alongside shape borders
            ctx.strokeRect(drawX * zoom + 4, drawY * zoom + 4, zoom - 8, zoom - 8);
        }
    });
}

/**
 * Update the slice label
 */
function updateSliceLabel() {
    const label = document.getElementById("slice-label");
    if (label) {
        const { axis, slice } = window.gridState;
        const axisLetter = axis === "XY" ? "Z" : axis === "XZ" ? "Y" : "X";
        label.textContent = `${axisLetter} = ${slice}`;
    }
}

/**
 * Initialize 3D slice preview
 */
function initSlice3DPreview() {
    refreshSlice3DPreview();
}

/**
 * Refresh the 3D slice preview
 */
function refreshSlice3DPreview() {
    const canvas = document.getElementById("slice-3d-preview");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { axis, slice } = window.gridState;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Clear
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw 3D axes (isometric projection)
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

        // Arrow head
        const angle = Math.atan2(dy, dx);
        ctx.beginPath();
        ctx.moveTo(cx + dx, cy + dy);
        ctx.lineTo(cx + dx - 5 * Math.cos(angle - 0.5), cy + dy - 5 * Math.sin(angle - 0.5));
        ctx.moveTo(cx + dx, cy + dy);
        ctx.lineTo(cx + dx - 5 * Math.cos(angle + 0.5), cy + dy - 5 * Math.sin(angle + 0.5));
        ctx.stroke();

        // Label
        ctx.fillStyle = color;
        ctx.font = "bold 10px sans-serif";
        ctx.fillText(name, cx + dx * 1.3 - 3, cy + dy * 1.3 + 3);
    });

    // Draw slice plane (semi-transparent rectangle)
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    if (axis === "XY") {
        // Horizontal plane
        ctx.moveTo(cx - 20, cy + 5);
        ctx.lineTo(cx + 20, cy + 15);
        ctx.lineTo(cx + 20, cy - 10);
        ctx.lineTo(cx - 20, cy - 20);
    } else if (axis === "XZ") {
        // Vertical plane on Y axis
        ctx.moveTo(cx + 20, cy + 10);
        ctx.lineTo(cx + 20, cy - 20);
        ctx.lineTo(cx - 5, cy - 30);
        ctx.lineTo(cx - 5, cy);
    } else {
        // Vertical plane on X axis
        ctx.moveTo(cx - 20, cy + 10);
        ctx.lineTo(cx - 20, cy - 20);
        ctx.lineTo(cx + 5, cy - 30);
        ctx.lineTo(cx + 5, cy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

/**
 * Handle grid click
 */
function handleGridClick(e) {
    const { cellX, cellY } = getGridCellFromEvent(e);
    const { axis, slice } = window.gridState;

    // Get world position
    let worldX, worldY, worldZ;
    if (axis === "XY") { worldX = cellX; worldY = cellY; worldZ = slice; }
    else if (axis === "XZ") { worldX = cellX; worldY = slice; worldZ = cellY; }
    else { worldX = slice; worldY = cellX; worldZ = cellY; }

    // Paint with current tool
    const tool = window.toolState?.currentTool || "paint";
    const posKey = `${worldX},${worldY},${worldZ}`;
    const naxel = getMainNaxel();

    if (tool === "paint") {
        if (!naxel.voxels_dict) naxel.voxels_dict = {};
        const color = getSelectedPaletteColor() || [128, 128, 128];
        naxel.voxels_dict[posKey] = [...color];
        window.historyManager?.saveState();
    } else if (tool === "erase") {
        if (naxel.voxels_dict) {
            delete naxel.voxels_dict[posKey];
            window.historyManager?.saveState();
        }
    } else if (tool === "eyedropper") {
        const color = naxel.voxels_dict?.[posKey];
        if (color) {
            // Find matching palette color or add it
            console.log("Picked color:", color);
        }
    }

    refreshGridView();
    triggerRerender();
}

/**
 * Handle grid right-click (context menu)
 */
function handleGridRightClick(e) {
    e.preventDefault();
    const { cellX, cellY } = getGridCellFromEvent(e);
    showGridContextMenu(cellX, cellY, e.clientX, e.clientY);
}

/**
 * Handle grid mouse move (for hover effects)
 */
function handleGridMouseMove(e) {
    // Could add hover highlight here
}

/**
 * Handle touch start (for long-press)
 */
function handleGridTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const { cellX, cellY } = getGridCellFromEvent(touch);
    window.gridState.longPressPos = { cellX, cellY, clientX: touch.clientX, clientY: touch.clientY };

    window.gridState.longPressTimer = setTimeout(() => {
        showGridContextMenu(cellX, cellY, touch.clientX, touch.clientY);
    }, window.naxelConfig?.longPressDelay || 500);
}

/**
 * Handle touch end
 */
function handleGridTouchEnd(e) {
    if (window.gridState.longPressTimer) {
        clearTimeout(window.gridState.longPressTimer);

        // If not a long press, treat as click
        if (window.gridState.longPressPos) {
            const { cellX, cellY } = window.gridState.longPressPos;
            handleGridClick({
                target: document.getElementById("grid-editor-canvas"),
                clientX: window.gridState.longPressPos.clientX,
                clientY: window.gridState.longPressPos.clientY
            });
        }
    }
    window.gridState.longPressTimer = null;
    window.gridState.longPressPos = null;
}

/**
 * Handle touch move (cancel long-press)
 */
function handleGridTouchMove(e) {
    if (window.gridState.longPressTimer) {
        clearTimeout(window.gridState.longPressTimer);
        window.gridState.longPressTimer = null;
    }
}

/**
 * Get grid cell coordinates from event
 */
function getGridCellFromEvent(e) {
    const canvas = document.getElementById("grid-editor-canvas");
    if (!canvas) return { cellX: 0, cellY: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.pageX) - rect.left;
    const y = (e.clientY || e.pageY) - rect.top;

    return {
        cellX: Math.floor(x / window.gridState.zoom),
        cellY: Math.floor(y / window.gridState.zoom)
    };
}

/**
 * Show context menu for grid cell
 */
function showGridContextMenu(cellX, cellY, screenX, screenY) {
    // Remove any existing menu
    const existing = document.querySelector(".grid-context-menu");
    if (existing) existing.remove();

    // Get world position
    const { axis, slice } = window.gridState;
    let worldX, worldY, worldZ;
    if (axis === "XY") { worldX = cellX; worldY = cellY; worldZ = slice; }
    else if (axis === "XZ") { worldX = cellX; worldY = slice; worldZ = cellY; }
    else { worldX = slice; worldY = cellX; worldZ = cellY; }

    const posKey = `${worldX},${worldY},${worldZ}`;
    const naxel = getMainNaxel();

    // Check for shape at this origin
    const shapeIndex = naxel.voxels_list?.findIndex(s => {
        const pos = parseVec3Editor(s.position);
        return pos.x === worldX && pos.y === worldY && pos.z === worldZ;
    });
    const shape = shapeIndex >= 0 ? naxel.voxels_list[shapeIndex] : null;

    // Check for light
    const light = naxel.light_emission_dict?.[posKey];

    // Create context menu
    const menu = document.createElement("div");
    menu.className = "grid-context-menu";
    menu.style.cssText = `position:fixed;left:${screenX}px;top:${screenY}px;background:#24243e;border:1px solid #4a5568;border-radius:5px;padding:5px;z-index:1000;min-width:180px;box-shadow:0 4px 12px rgba(0,0,0,0.3);`;

    // Header
    const header = document.createElement("div");
    header.style.cssText = "padding:8px;border-bottom:1px solid #4a5568;font-size:12px;color:#888;";
    header.textContent = `Cell (${worldX}, ${worldY}, ${worldZ})`;
    menu.appendChild(header);

    // Shape section
    if (shape) {
        const shapeSection = document.createElement("div");
        shapeSection.style.cssText = "padding:8px;border-bottom:1px solid #4a5568;";

        const shapeHeader = document.createElement("div");
        shapeHeader.style.cssText = "color:#3498db;margin-bottom:8px;font-weight:bold;";
        shapeHeader.textContent = `🔵 Shape: ${shape.type}`;
        shapeSection.appendChild(shapeHeader);

        const editShapeBtn = document.createElement("button");
        editShapeBtn.textContent = "Edit Shape";
        editShapeBtn.style.cssText = "width:100%;padding:6px;margin:2px 0;background:#1a1a2e;color:white;border:1px solid #4a5568;border-radius:3px;cursor:pointer;";
        editShapeBtn.onclick = () => { editShape(shapeIndex); menu.remove(); };
        shapeSection.appendChild(editShapeBtn);

        const deleteShapeBtn = document.createElement("button");
        deleteShapeBtn.textContent = "Delete Shape";
        deleteShapeBtn.style.cssText = "width:100%;padding:6px;margin:2px 0;background:#1a1a2e;color:#e74c3c;border:1px solid #4a5568;border-radius:3px;cursor:pointer;";
        deleteShapeBtn.onclick = () => { deleteShape(shapeIndex); menu.remove(); };
        shapeSection.appendChild(deleteShapeBtn);

        menu.appendChild(shapeSection);
    }

    // Light section
    if (light) {
        const lightSection = document.createElement("div");
        lightSection.style.cssText = "padding:8px;" + (shape ? "" : "border-bottom:1px solid #4a5568;");

        const lightHeader = document.createElement("div");
        lightHeader.style.cssText = "color:#f1c40f;margin-bottom:8px;font-weight:bold;";
        lightHeader.textContent = `💛 Light Source`;
        lightSection.appendChild(lightHeader);

        const editLightBtn = document.createElement("button");
        editLightBtn.textContent = "Edit Light";
        editLightBtn.style.cssText = "width:100%;padding:6px;margin:2px 0;background:#1a1a2e;color:white;border:1px solid #4a5568;border-radius:3px;cursor:pointer;";
        editLightBtn.onclick = () => { editLight(posKey); menu.remove(); };
        lightSection.appendChild(editLightBtn);

        const removeLightBtn = document.createElement("button");
        removeLightBtn.textContent = "Remove Light";
        removeLightBtn.style.cssText = "width:100%;padding:6px;margin:2px 0;background:#1a1a2e;color:#e74c3c;border:1px solid #4a5568;border-radius:3px;cursor:pointer;";
        removeLightBtn.onclick = () => { removeLight(posKey); menu.remove(); };
        lightSection.appendChild(removeLightBtn);

        menu.appendChild(lightSection);
    }

    // Add light option (if no light exists)
    if (!light) {
        const addSection = document.createElement("div");
        addSection.style.cssText = "padding:8px;";

        const addLightBtn = document.createElement("button");
        addLightBtn.textContent = "💡 Add Light Here";
        addLightBtn.style.cssText = "width:100%;padding:6px;background:#1a1a2e;color:#f1c40f;border:1px solid #4a5568;border-radius:3px;cursor:pointer;";
        addLightBtn.onclick = () => { addLight(posKey); menu.remove(); };
        addSection.appendChild(addLightBtn);

        menu.appendChild(addSection);
    }

    // No shape or light message
    if (!shape && !light) {
        const emptyNote = document.createElement("div");
        emptyNote.style.cssText = "padding:8px;color:#666;font-size:11px;text-align:center;";
        emptyNote.textContent = "Tip: Use Tools menu to add shapes";
        menu.appendChild(emptyNote);
    }

    // Add to document
    document.body.appendChild(menu);

    // Close on click outside
    setTimeout(() => {
        const closeHandler = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener("click", closeHandler);
            }
        };
        document.addEventListener("click", closeHandler);
    }, 10);
}

/**
 * Edit a shape
 */
function editShape(shapeIndex) {
    const naxel = getMainNaxel();
    const shape = naxel.voxels_list?.[shapeIndex];
    if (!shape) return;

    alert(`Edit shape: ${shape.type}\nPosition: ${JSON.stringify(shape.position)}\n\n(Full editor coming soon)`);
}

/**
 * Delete a shape
 */
function deleteShape(shapeIndex) {
    const naxel = getMainNaxel();
    if (!naxel.voxels_list || shapeIndex < 0) return;

    naxel.voxels_list.splice(shapeIndex, 1);
    window.historyManager?.saveState();
    refreshGridView();
    triggerRerender();
}

/**
 * Edit a light source
 */
function editLight(posKey) {
    const naxel = getMainNaxel();
    const light = naxel.light_emission_dict?.[posKey];
    if (!light) return;

    const newValue = prompt(`Light emission (R,G,B):\nCurrent: ${light.join(", ")}`, light.join(", "));
    if (newValue) {
        const parts = newValue.split(",").map(v => parseFloat(v.trim()));
        if (parts.length >= 3) {
            naxel.light_emission_dict[posKey] = parts.slice(0, 3);
            window.historyManager?.saveState();
            refreshGridView();
        }
    }
}

/**
 * Remove a light source
 */
function removeLight(posKey) {
    const naxel = getMainNaxel();
    if (naxel.light_emission_dict) {
        delete naxel.light_emission_dict[posKey];
        window.historyManager?.saveState();
        refreshGridView();
    }
}

/**
 * Add a light source
 */
function addLight(posKey) {
    const naxel = getMainNaxel();
    if (!naxel.light_emission_dict) naxel.light_emission_dict = {};

    naxel.light_emission_dict[posKey] = [1.0, 1.0, 1.0];
    window.historyManager?.saveState();
    refreshGridView();
}

/**
 * Set the grid axis
 */
function setGridAxis(axis) {
    window.gridState.axis = axis;

    // Update button states
    document.querySelectorAll(".grid-axis-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.axis === axis);
    });

    refreshGridView();
}

/**
 * Change slice by delta
 */
function changeSlice(delta) {
    window.gridState.slice += delta;
    document.getElementById("grid-slice-input").value = window.gridState.slice;
    refreshGridView();
}

/**
 * Set slice to specific value
 */
function setSlice(value) {
    window.gridState.slice = value;
    refreshGridView();
}

/**
 * Toggle a grid display option
 */
function toggleGridOption(key, btnId) {
    window.gridState[key] = !window.gridState[key];

    const btn = document.getElementById(btnId);
    if (btn) {
        btn.classList.toggle("active", window.gridState[key]);
    }

    refreshGridView();
}

// Expose functions
window.refreshGridView = refreshGridView;
window.setGridAxis = setGridAxis;
window.changeSlice = changeSlice;
window.setSlice = setSlice;
