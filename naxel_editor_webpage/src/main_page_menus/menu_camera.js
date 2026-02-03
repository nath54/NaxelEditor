/**
 * Camera Menu - 3D viewport with navigation controls
 * Uses tmp_naxel with the naive naxel library for rendering
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

    // Row for preview and controls
    const row = document.createElement("div");
    row.style.cssText = "display:flex;gap:10px;margin-bottom:5px;flex:1;min-height:0;";
    container.appendChild(row);

    // 3D preview using naxel library (data-naxel div)
    const previewContainer = document.createElement("div");
    previewContainer.setAttribute("data-naxel", "tmp_naxel");
    previewContainer.className = "camera-preview-naxel";
    previewContainer.style.cssText = "background:#0a0a1a;border-radius:5px;overflow:hidden;aspect-ratio:1/1; max-height: 150px;margin:auto;";
    row.appendChild(previewContainer);

    // Controls column
    const row_col = document.createElement("div");
    row_col.style.cssText = "display:flex;flex-direction:column;gap:5px;justify-content:center;min-width:180px;";
    row.appendChild(row_col);

    const naxel = getMainNaxel();
    const camera = naxel?.camera || {};

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

    // Target position row
    const row_target = document.createElement("div");
    row_target.style.cssText = "display:flex;gap:5px;align-items:center;";
    row_col.appendChild(row_target);

    const targetHeader = document.createElement("div");
    targetHeader.textContent = "Target:";
    targetHeader.style.cssText = "font-size:12px;color:#888;";
    row_target.appendChild(targetHeader);

    ["x", "y", "z"].forEach(axis => {
        const input = document.createElement("input");
        input.type = "number";
        input.id = `camera-target-${axis}`;
        input.value = camera[`target_${axis}`] || 0;
        input.step = 0.5;
        input.style.cssText = "flex:1;padding:4px;background:#1a1a2e;color:white;border:1px solid #4a5568;border-radius:5px;max-width:60px;";
        input.onchange = () => updateTmpNaxelCamera();
        row_target.appendChild(input);
    });

    // Action buttons
    const actionsRow = document.createElement("div");
    actionsRow.style.cssText = "display:flex;gap:8px;margin-top:5px;";

    const applyBtn = document.createElement("button");
    applyBtn.textContent = "Apply";
    applyBtn.style.cssText = "flex:1;padding:8px;background:#3498db;color:white;border:none;border-radius:5px;cursor:pointer;";
    applyBtn.onclick = () => applyCameraSettings();
    actionsRow.appendChild(applyBtn);

    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Reset";
    resetBtn.style.cssText = "flex:1;padding:8px;background:#4a5568;color:white;border:none;border-radius:5px;cursor:pointer;";
    resetBtn.onclick = () => resetCamera();
    actionsRow.appendChild(resetBtn);

    const centerBtn = document.createElement("button");
    centerBtn.textContent = "Auto-Center";
    centerBtn.style.cssText = "flex:1;padding:8px;background:#2ecc71;color:white;border:none;border-radius:5px;cursor:pointer;";
    centerBtn.onclick = () => autoCenterCamera();
    actionsRow.appendChild(centerBtn);

    row_col.appendChild(actionsRow);

    // Initialize after DOM is rendered
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            initCameraMenu();
            setupCameraInputListeners();
        });
    });

    return container;
}

/**
 * Initialize the camera menu - sync tmp_naxel with main_naxel and render
 */
function initCameraMenu() {
    // Load camera state from main naxel
    loadCameraStateFromNaxel();

    // Sync tmp_naxel with main_naxel data but with camera state
    syncTmpNaxel();

    // Render the tmp_naxel preview
    renderTmpNaxelPreview();
}

/**
 * Sync tmp_naxel with main_naxel but apply current camera state
 */
function syncTmpNaxel() {
    const mainNaxel = getMainNaxel();
    if (!mainNaxel) return;

    // Copy main naxel data to tmp_naxel
    window.naxel_objects["tmp_naxel"] = JSON.parse(JSON.stringify(mainNaxel));

    // Apply current camera state to tmp_naxel
    updateTmpNaxelCamera();
}

/**
 * Update tmp_naxel camera from current state and re-render
 */
function updateTmpNaxelCamera() {
    const tmpNaxel = window.naxel_objects["tmp_naxel"];
    if (!tmpNaxel) {
        syncTmpNaxel();
        return;
    }

    // Read values from inputs
    const distInput = document.getElementById("camera-distance");
    const rotXInput = document.getElementById("camera-rot-x");
    const rotYInput = document.getElementById("camera-rot-y");
    const targetX = document.getElementById("camera-target-x");
    const targetY = document.getElementById("camera-target-y");
    const targetZ = document.getElementById("camera-target-z");

    if (distInput) window.cameraState.distance = parseFloat(distInput.value) || 15;
    if (rotXInput) window.cameraState.rotationX = parseFloat(rotXInput.value) || 0;
    if (rotYInput) window.cameraState.rotationY = parseFloat(rotYInput.value) || 0;
    if (targetX) window.cameraState.targetX = parseFloat(targetX.value) || 0;
    if (targetY) window.cameraState.targetY = parseFloat(targetY.value) || 0;
    if (targetZ) window.cameraState.targetZ = parseFloat(targetZ.value) || 0;

    // Calculate camera position from distance and rotations (orbiting camera)
    const dist = window.cameraState.distance;
    const rotX = window.cameraState.rotationX;
    const rotY = window.cameraState.rotationY;
    const tx = window.cameraState.targetX;
    const ty = window.cameraState.targetY;
    const tz = window.cameraState.targetZ;

    // Calculate position orbiting around target
    const camX = tx + dist * Math.cos(rotY) * Math.cos(rotX);
    const camY = ty + dist * Math.sin(rotY) * Math.cos(rotX);
    const camZ = tz + dist * Math.sin(rotX);

    // Calculate rotation to look at target
    const lookX = tx - camX;
    const lookY = ty - camY;
    const lookZ = tz - camZ;
    const horizontalDist = Math.sqrt(lookX * lookX + lookY * lookY);
    const camRotZ = Math.atan2(lookY, lookX) - Math.PI / 2;
    const camRotX = -Math.atan2(lookZ, horizontalDist);

    // Apply to tmp_naxel using the correct property names the library expects
    tmpNaxel.camera_position = [camX, camY, camZ];
    tmpNaxel.camera_rotation = [camRotX, 0, camRotZ];
    tmpNaxel.camera_focal = Math.max(20, dist * 0.7);

    // Re-render preview
    renderTmpNaxelPreview();
}

/**
 * Render the tmp_naxel preview using the naxel library
 */
function renderTmpNaxelPreview() {
    // Find the data-naxel div for tmp_naxel
    const previewDivs = document.querySelectorAll('[data-naxel="tmp_naxel"]');

    previewDivs.forEach(div => {
        // Ensure the div has an ID
        if (!div.id) {
            div.id = "camera-preview-naxel-" + Math.random().toString(36).substr(2, 9);
        }

        // Use the naxel library's render function: render_naxel(key, nodeId)
        if (typeof render_naxel === "function") {
            render_naxel("tmp_naxel", div.id);
        } else if (typeof render_all_naxels === "function") {
            // Fallback - re-render all
            render_all_naxels();
        }
    });
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
            const distVal = document.getElementById("camera-distance-value");
            if (distVal) distVal.textContent = distInput.value;
            updateTmpNaxelCamera();
        };
    }

    if (rotXInput) {
        rotXInput.oninput = () => {
            window.cameraState.rotationX = parseFloat(rotXInput.value);
            const rotXVal = document.getElementById("camera-rot-x-value");
            if (rotXVal) rotXVal.textContent = parseFloat(rotXInput.value).toFixed(1);
            updateTmpNaxelCamera();
        };
    }

    if (rotYInput) {
        rotYInput.oninput = () => {
            window.cameraState.rotationY = parseFloat(rotYInput.value);
            const rotYVal = document.getElementById("camera-rot-y-value");
            if (rotYVal) rotYVal.textContent = parseFloat(rotYInput.value).toFixed(1);
            updateTmpNaxelCamera();
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
    const targetX = document.getElementById("camera-target-x");
    const targetY = document.getElementById("camera-target-y");
    const targetZ = document.getElementById("camera-target-z");

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

    if (targetX) targetX.value = window.cameraState.targetX;
    if (targetY) targetY.value = window.cameraState.targetY;
    if (targetZ) targetZ.value = window.cameraState.targetZ;
}

/**
 * Apply camera settings to main naxel object
 */
function applyCameraSettings() {
    const naxel = getMainNaxel();

    // Calculate camera position from distance and rotations (orbiting camera)
    const dist = window.cameraState.distance;
    const rotX = window.cameraState.rotationX;
    const rotY = window.cameraState.rotationY;
    const tx = window.cameraState.targetX;
    const ty = window.cameraState.targetY;
    const tz = window.cameraState.targetZ;

    // Calculate position orbiting around target
    const camX = tx + dist * Math.cos(rotY) * Math.cos(rotX);
    const camY = ty + dist * Math.sin(rotY) * Math.cos(rotX);
    const camZ = tz + dist * Math.sin(rotX);

    // Calculate rotation to look at target
    const lookX = tx - camX;
    const lookY = ty - camY;
    const lookZ = tz - camZ;
    const horizontalDist = Math.sqrt(lookX * lookX + lookY * lookY);
    const camRotZ = Math.atan2(lookY, lookX) - Math.PI / 2;
    const camRotX = -Math.atan2(lookZ, horizontalDist);

    // Apply using the correct property names the library expects
    naxel.camera_position = [camX, camY, camZ];
    naxel.camera_rotation = [camRotX, 0, camRotZ];
    naxel.camera_focal = Math.max(20, dist * 0.7);

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
    updateTmpNaxelCamera();
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
    updateTmpNaxelCamera();
}

// Expose functions
window.renderTmpNaxelPreview = renderTmpNaxelPreview;
window.updateTmpNaxelCamera = updateTmpNaxelCamera;
window.syncTmpNaxel = syncTmpNaxel;
window.applyCameraSettings = applyCameraSettings;
window.resetCamera = resetCamera;
window.autoCenterCamera = autoCenterCamera;
