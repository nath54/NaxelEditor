/**
 * Camera Menu - 3D viewport with navigation controls
 */

// Camera state
window.cameraState = {
    distance: 15,
    rotationX: 0.3,
    rotationY: 0.5,
    targetX: 0,
    targetY: 0,
    targetZ: 0,
};

/**
 * Create the camera menu
 */
function create_camera_menu() {
    const container = document.createElement("div");
    container.className = "camera-menu";
    container.style.cssText = "display:flex;flex-direction:column;height:100%;padding:10px;gap:5px;";

    // Row
    const row = document.createElement("div");
    row.style.cssText = "display:flex;gap:5px;margin-bottom:5px;";
    container.appendChild(row);

    // 3D preview canvas
    const previewContainer = document.createElement("div");
    previewContainer.style.cssText = "flex-grow: 0.25; background:#0a0a1a;border-radius:5px;overflow:hidden;min-height:50px;max-height:100px;aspect-ratio:1/1; margin-right: 15px;";

    const previewCanvas = document.createElement("canvas");
    previewCanvas.id = "camera-preview-canvas";
    previewCanvas.style.cssText = "width:100%;height:100%;";
    previewContainer.appendChild(previewCanvas);
    row.appendChild(previewContainer);

    const naxel = getMainNaxel();
    const camera = naxel?.camera || {};

    const row_col = document.createElement("div");
    row_col.style.cssText = "display:flex;flex-direction:column;gap:5px;margin-top: auto; margin-bottom: auto; flex-grow: 1;";
    row.appendChild(row_col);

    // Distance control
    const distanceRow = createSlider(
        "Distance:",
        "camera-distance",
        1, 50,
        camera.distance || window.naxelConfig?.defaultCameraDistance || 15,
        1
    );
    row_col.appendChild(distanceRow);

    // Rotation X (pitch)
    const rotXRow = createSlider(
        "Pitch (X):",
        "camera-rot-x",
        -1.5, 1.5,
        camera.rotation_x || 0.3,
        0.1
    );
    row_col.appendChild(rotXRow);

    // Rotation Y (yaw)
    const rotYRow = createSlider(
        "Yaw (Y):",
        "camera-rot-y",
        -3.14, 3.14,
        camera.rotation_y || 0.5,
        0.1
    );
    row_col.appendChild(rotYRow);

    // Target
    const row_target = document.createElement("div");
    row_target.style.cssText = "display:flex;gap:5px;margin-bottom:5px;";
    container.appendChild(row_target);

    // Target position
    const targetHeader = document.createElement("div");
    targetHeader.textContent = "Target Position:";
    targetHeader.style.cssText = "margin-top:5px;font-size:12px;color:#888;";
    row_target.appendChild(targetHeader);

    const targetRow = document.createElement("div");
    targetRow.style.cssText = "display:flex;gap:5px;margin-bottom:5px;";

    ["x", "y", "z"].forEach(axis => {
        const input = document.createElement("input");
        input.type = "number";
        input.id = `camera-target-${axis}`;
        input.value = camera[`target_${axis}`] || 0;
        input.step = 0.5;
        input.style.cssText = "flex:1;padding:4px;background:#1a1a2e;color:white;border:1px solid #4a5568;border-radius:5px;";
        input.onchange = () => updateCameraFromInputs();
        targetRow.appendChild(input);
    });
    row_target.appendChild(targetRow);

    // Action buttons
    const actionsRow = document.createElement("div");
    actionsRow.style.cssText = "display:flex;gap:8px;";

    const applyBtn = document.createElement("button");
    applyBtn.textContent = "Apply";
    applyBtn.style.cssText = "flex:1;padding:10px;background:#3498db;color:white;border:none;border-radius:5px;cursor:pointer;";
    applyBtn.onclick = () => applyCameraSettings();
    actionsRow.appendChild(applyBtn);

    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Reset";
    resetBtn.style.cssText = "flex:1;padding:10px;background:#4a5568;color:white;border:none;border-radius:5px;cursor:pointer;";
    resetBtn.onclick = () => resetCamera();
    actionsRow.appendChild(resetBtn);

    const centerBtn = document.createElement("button");
    centerBtn.textContent = "Auto-Center";
    centerBtn.style.cssText = "flex:1;padding:5px;background:#2ecc71;color:white;border:none;border-radius:5px;cursor:pointer;";
    centerBtn.onclick = () => autoCenterCamera();
    actionsRow.appendChild(centerBtn);

    container.appendChild(actionsRow);

    // Initialize preview after DOM is rendered
    // Use double requestAnimationFrame for reliable timing
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            initCameraPreview();
            setupCameraInputListeners();
        });
    });

    return container;
}

/**
 * Initialize the camera preview canvas
 */
function initCameraPreview() {
    const canvas = document.getElementById("camera-preview-canvas");
    if (!canvas) return;

    // Set canvas size (with fallback for 0 dimensions)
    const container = canvas.parentElement;
    canvas.width = container.clientWidth || 200;
    canvas.height = container.clientHeight || 150;

    // Mouse/touch interaction for rotation
    let isDragging = false;
    let lastX = 0, lastY = 0;

    canvas.addEventListener("mousedown", (e) => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
    });

    canvas.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;

        window.cameraState.rotationY += dx * 0.01;
        window.cameraState.rotationX += dy * 0.01;
        window.cameraState.rotationX = Math.max(-1.5, Math.min(1.5, window.cameraState.rotationX));

        lastX = e.clientX;
        lastY = e.clientY;

        updateCameraInputsFromState();
        renderCameraPreview();
    });

    canvas.addEventListener("mouseup", () => isDragging = false);
    canvas.addEventListener("mouseleave", () => isDragging = false);

    // Touch support
    canvas.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;
        }
    }, { passive: true });

    canvas.addEventListener("touchmove", (e) => {
        if (!isDragging || e.touches.length !== 1) return;

        const dx = e.touches[0].clientX - lastX;
        const dy = e.touches[0].clientY - lastY;

        window.cameraState.rotationY += dx * 0.01;
        window.cameraState.rotationX += dy * 0.01;
        window.cameraState.rotationX = Math.max(-1.5, Math.min(1.5, window.cameraState.rotationX));

        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;

        updateCameraInputsFromState();
        renderCameraPreview();
    }, { passive: true });

    canvas.addEventListener("touchend", () => isDragging = false);

    // Wheel for zoom
    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        window.cameraState.distance += e.deltaY * 0.05;
        window.cameraState.distance = Math.max(1, Math.min(50, window.cameraState.distance));

        const distInput = document.getElementById("camera-distance");
        if (distInput) distInput.value = window.cameraState.distance;

        renderCameraPreview();
    }, { passive: false });

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        renderCameraPreview();
    });
    resizeObserver.observe(container);

    // Initial render
    loadCameraStateFromNaxel();
    renderCameraPreview();
}

/**
 * Load camera state from naxel object
 */
function loadCameraStateFromNaxel() {
    const naxel = getMainNaxel();
    const camera = naxel?.camera || {};

    window.cameraState.distance = camera.distance || 15;
    window.cameraState.rotationX = camera.rotation_x || 0.3;
    window.cameraState.rotationY = camera.rotation_y || 0.5;
    window.cameraState.targetX = camera.target_x || 0;
    window.cameraState.targetY = camera.target_y || 0;
    window.cameraState.targetZ = camera.target_z || 0;
}

/**
 * Setup input listeners for camera controls
 */
function setupCameraInputListeners() {
    const distInput = document.getElementById("camera-distance");
    const rotXInput = document.getElementById("camera-rot-x");
    const rotYInput = document.getElementById("camera-rot-y");

    if (distInput) {
        distInput.oninput = () => {
            window.cameraState.distance = parseFloat(distInput.value);
            document.getElementById("camera-distance-value").textContent = distInput.value;
            renderCameraPreview();
        };
    }

    if (rotXInput) {
        rotXInput.oninput = () => {
            window.cameraState.rotationX = parseFloat(rotXInput.value);
            document.getElementById("camera-rot-x-value").textContent = parseFloat(rotXInput.value).toFixed(1);
            renderCameraPreview();
        };
    }

    if (rotYInput) {
        rotYInput.oninput = () => {
            window.cameraState.rotationY = parseFloat(rotYInput.value);
            document.getElementById("camera-rot-y-value").textContent = parseFloat(rotYInput.value).toFixed(1);
            renderCameraPreview();
        };
    }
}

/**
 * Update camera inputs from state
 */
function updateCameraInputsFromState() {
    const distInput = document.getElementById("camera-distance");
    const rotXInput = document.getElementById("camera-rot-x");
    const rotYInput = document.getElementById("camera-rot-y");

    if (distInput) {
        distInput.value = window.cameraState.distance;
        const distVal = document.getElementById("camera-distance-value");
        if (distVal) distVal.textContent = window.cameraState.distance.toFixed(0);
    }

    if (rotXInput) {
        rotXInput.value = window.cameraState.rotationX;
        const rotXVal = document.getElementById("camera-rot-x-value");
        if (rotXVal) rotXVal.textContent = window.cameraState.rotationX.toFixed(1);
    }

    if (rotYInput) {
        rotYInput.value = window.cameraState.rotationY;
        const rotYVal = document.getElementById("camera-rot-y-value");
        if (rotYVal) rotYVal.textContent = window.cameraState.rotationY.toFixed(1);
    }
}

/**
 * Update camera state from inputs
 */
function updateCameraFromInputs() {
    const tx = document.getElementById("camera-target-x");
    const ty = document.getElementById("camera-target-y");
    const tz = document.getElementById("camera-target-z");

    if (tx) window.cameraState.targetX = parseFloat(tx.value) || 0;
    if (ty) window.cameraState.targetY = parseFloat(ty.value) || 0;
    if (tz) window.cameraState.targetZ = parseFloat(tz.value) || 0;

    renderCameraPreview();
}

/**
 * Render camera preview (simplified wireframe view)
 */
function renderCameraPreview() {
    const canvas = document.getElementById("camera-preview-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { distance, rotationX, rotationY, targetX, targetY, targetZ } = window.cameraState;

    // Clear
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) / 4;

    // Simple 3D to 2D projection
    function project(x, y, z) {
        // Rotate around Y
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        // Rotate around X
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const y1 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        // Perspective
        const fov = distance;
        const screenX = cx + (x1 / (z2 / fov + 1)) * scale;
        const screenY = cy - (y1 / (z2 / fov + 1)) * scale;

        return { x: screenX, y: screenY, z: z2 };
    }

    // Draw grid
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    for (let i = -5; i <= 5; i++) {
        const p1 = project(i, 0, -5);
        const p2 = project(i, 0, 5);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const p3 = project(-5, 0, i);
        const p4 = project(5, 0, i);
        ctx.beginPath();
        ctx.moveTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.stroke();
    }

    // Draw axes
    const origin = project(0, 0, 0);

    // X axis (red)
    const xEnd = project(3, 0, 0);
    ctx.strokeStyle = "#e74c3c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(xEnd.x, xEnd.y);
    ctx.stroke();
    ctx.fillStyle = "#e74c3c";
    ctx.fillText("X", xEnd.x + 5, xEnd.y);

    // Y axis (green)
    const yEnd = project(0, 3, 0);
    ctx.strokeStyle = "#2ecc71";
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(yEnd.x, yEnd.y);
    ctx.stroke();
    ctx.fillStyle = "#2ecc71";
    ctx.fillText("Y", yEnd.x + 5, yEnd.y);

    // Z axis (blue)
    const zEnd = project(0, 0, 3);
    ctx.strokeStyle = "#3498db";
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(zEnd.x, zEnd.y);
    ctx.stroke();
    ctx.fillStyle = "#3498db";
    ctx.fillText("Z", zEnd.x + 5, zEnd.y);

    // Draw target marker
    const target = project(targetX, targetY, targetZ);
    ctx.fillStyle = "#f1c40f";
    ctx.beginPath();
    ctx.arc(target.x, target.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw simple cube to represent object
    const naxel = getMainNaxel();
    if (naxel?.voxels_dict && Object.keys(naxel.voxels_dict).length > 0) {
        // Draw a simple bounding box
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 1;

        // Simple unit cube
        const cubeVerts = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ];
        const cubeEdges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        cubeEdges.forEach(([i, j]) => {
            const p1 = project(cubeVerts[i][0], cubeVerts[i][1], cubeVerts[i][2]);
            const p2 = project(cubeVerts[j][0], cubeVerts[j][1], cubeVerts[j][2]);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        });
    }

    // Camera info
    ctx.fillStyle = "#666";
    ctx.font = "10px sans-serif";
    ctx.fillText(`Distance: ${distance.toFixed(1)}`, 10, 15);
    ctx.fillText(`Rotation: (${rotationX.toFixed(2)}, ${rotationY.toFixed(2)})`, 10, 27);
}

/**
 * Apply camera settings to naxel object
 */
function applyCameraSettings() {
    const naxel = getMainNaxel();
    if (!naxel.camera) naxel.camera = {};

    naxel.camera.distance = window.cameraState.distance;
    naxel.camera.rotation_x = window.cameraState.rotationX;
    naxel.camera.rotation_y = window.cameraState.rotationY;
    naxel.camera.target_x = window.cameraState.targetX;
    naxel.camera.target_y = window.cameraState.targetY;
    naxel.camera.target_z = window.cameraState.targetZ;

    window.historyManager?.saveState();
    triggerRerender();
}

/**
 * Reset camera to defaults
 */
function resetCamera() {
    window.cameraState.distance = window.naxelConfig?.defaultCameraDistance || 15;
    window.cameraState.rotationX = 0.3;
    window.cameraState.rotationY = 0.5;
    window.cameraState.targetX = 0;
    window.cameraState.targetY = 0;
    window.cameraState.targetZ = 0;

    updateCameraInputsFromState();

    const tx = document.getElementById("camera-target-x");
    const ty = document.getElementById("camera-target-y");
    const tz = document.getElementById("camera-target-z");
    if (tx) tx.value = 0;
    if (ty) ty.value = 0;
    if (tz) tz.value = 0;

    renderCameraPreview();
}

/**
 * Auto-center camera on object
 */
function autoCenterCamera() {
    const naxel = getMainNaxel();
    const voxels = naxel?.voxels_dict || {};
    const keys = Object.keys(voxels);

    if (keys.length === 0) {
        resetCamera();
        return;
    }

    // Calculate center of mass
    let sumX = 0, sumY = 0, sumZ = 0;
    keys.forEach(key => {
        const [x, y, z] = key.split(",").map(Number);
        sumX += x;
        sumY += y;
        sumZ += z;
    });

    window.cameraState.targetX = sumX / keys.length;
    window.cameraState.targetY = sumY / keys.length;
    window.cameraState.targetZ = sumZ / keys.length;

    // Calculate distance based on bounding box
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    keys.forEach(key => {
        const [x, y, z] = key.split(",").map(Number);
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
    });

    const size = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
    window.cameraState.distance = Math.max(5, size * 2);

    updateCameraInputsFromState();

    const tx = document.getElementById("camera-target-x");
    const ty = document.getElementById("camera-target-y");
    const tz = document.getElementById("camera-target-z");
    if (tx) tx.value = window.cameraState.targetX.toFixed(1);
    if (ty) ty.value = window.cameraState.targetY.toFixed(1);
    if (tz) tz.value = window.cameraState.targetZ.toFixed(1);

    renderCameraPreview();
}

// Expose functions
window.renderCameraPreview = renderCameraPreview;
window.applyCameraSettings = applyCameraSettings;
window.resetCamera = resetCamera;
window.autoCenterCamera = autoCenterCamera;
