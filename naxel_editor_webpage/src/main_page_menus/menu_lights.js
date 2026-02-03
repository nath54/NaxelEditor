/**
 * Lights Menu - Light algorithm and sources management
 */

/**
 * Create the lights menu
 */
function create_lights_menu() {
    const container = document.createElement("div");
    container.className = "lights-menu";
    container.style.cssText = "display:flex;flex-direction:column;height:100%;padding:10px;gap:15px;overflow-y:auto;";

    // Header
    const header = document.createElement("h3");
    header.textContent = "💡 Lighting";
    header.style.cssText = "margin:0 0 10px 0;font-size:16px;";
    container.appendChild(header);

    const naxel = getMainNaxel();

    // Algorithm selector
    const algoSection = document.createElement("div");
    algoSection.style.cssText = "margin-bottom:15px;";

    const algoLabel = document.createElement("label");
    algoLabel.textContent = "Algorithm:";
    algoLabel.style.cssText = "display:block;margin-bottom:5px;font-size:12px;color:#888;";
    algoSection.appendChild(algoLabel);

    const algoSelect = document.createElement("select");
    algoSelect.id = "light-algorithm";
    algoSelect.style.cssText = "width:100%;padding:8px;background:#1a1a2e;color:white;border:1px solid #4a5568;border-radius:5px;";
    algoSelect.innerHTML = `
        <option value="none" ${naxel?.light_algorithm === "none" || !naxel?.light_algorithm ? "selected" : ""}>None</option>
        <option value="simple_diffusion" ${naxel?.light_algorithm === "simple_diffusion" ? "selected" : ""}>Simple Diffusion</option>
    `;
    algoSelect.onchange = () => updateLightAlgorithm();
    algoSection.appendChild(algoSelect);
    container.appendChild(algoSection);

    // Diffusion strength
    const diffusionRow = createSlider(
        "Diffusion Strength:",
        "light-diffusion",
        0, 2,
        naxel?.light_diffusion_strength || 1,
        0.1
    );
    container.appendChild(diffusionRow);

    // Divider
    const divider = document.createElement("hr");
    divider.style.cssText = "border:none;border-top:1px solid #4a5568;margin:10px 0;";
    container.appendChild(divider);

    // Light sources header
    const sourcesHeader = document.createElement("div");
    sourcesHeader.style.cssText = "display:flex;justify-content:space-between;align-items:center;";

    const sourcesTitle = document.createElement("strong");
    sourcesTitle.textContent = "Light Sources";
    sourcesHeader.appendChild(sourcesTitle);

    container.appendChild(sourcesHeader);

    // Info text
    const infoText = document.createElement("p");
    infoText.style.cssText = "font-size:11px;color:#888;margin:5px 0 10px 0;";
    infoText.textContent = "Light sources are shown with yellow borders in the Grid view. Long-press or right-click on the grid to add/edit lights.";
    container.appendChild(infoText);

    // Light sources list
    const lightsList = document.createElement("div");
    lightsList.id = "light-sources-list";
    lightsList.style.cssText = "flex:1;overflow-y:auto;";
    container.appendChild(lightsList);

    // Apply button
    const applyBtn = document.createElement("button");
    applyBtn.textContent = "Apply Algorithm Settings";
    applyBtn.style.cssText = "padding:10px;background:#3498db;color:white;border:none;border-radius:5px;cursor:pointer;margin-top:10px;";
    applyBtn.onclick = () => applyLightSettings();
    container.appendChild(applyBtn);

    // Initialize list
    setTimeout(() => refreshLightsList(), 0);

    return container;
}

/**
 * Refresh the light sources list
 */
function refreshLightsList() {
    const list = document.getElementById("light-sources-list");
    if (!list) return;

    const naxel = getMainNaxel();
    const lights = naxel?.light_emission_dict || {};

    list.innerHTML = "";

    const lightKeys = Object.keys(lights);

    if (lightKeys.length === 0) {
        const emptyMsg = document.createElement("p");
        emptyMsg.style.cssText = "color:#666;font-size:12px;text-align:center;padding:20px;";
        emptyMsg.textContent = "No light sources defined.";
        list.appendChild(emptyMsg);
        return;
    }

    lightKeys.forEach(posStr => {
        const emission = lights[posStr];

        const item = document.createElement("div");
        item.className = "light-source-item";
        item.style.cssText = "background:#1a1a2e;padding:10px;border-radius:5px;margin-bottom:8px;border-left:3px solid #f1c40f;";

        const posRow = document.createElement("div");
        posRow.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;";

        const posLabel = document.createElement("span");
        posLabel.textContent = `💡 (${posStr})`;
        posLabel.style.cssText = "font-weight:bold;";
        posRow.appendChild(posLabel);

        const goToBtn = document.createElement("button");
        goToBtn.textContent = "Go To";
        goToBtn.style.cssText = "padding:3px 8px;font-size:11px;background:#24243e;color:white;border:1px solid #4a5568;border-radius:3px;cursor:pointer;";
        goToBtn.onclick = () => goToLightPosition(posStr);
        posRow.appendChild(goToBtn);

        item.appendChild(posRow);

        const emissionRow = document.createElement("div");
        emissionRow.style.cssText = "font-size:11px;color:#888;";
        emissionRow.textContent = `Emission: R=${emission[0]?.toFixed(2)}, G=${emission[1]?.toFixed(2)}, B=${emission[2]?.toFixed(2)}`;
        item.appendChild(emissionRow);

        const actionsRow = document.createElement("div");
        actionsRow.style.cssText = "display:flex;gap:5px;margin-top:8px;";

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.style.cssText = "flex:1;padding:5px;font-size:11px;background:#24243e;color:white;border:1px solid #4a5568;border-radius:3px;cursor:pointer;";
        editBtn.onclick = () => editLightFromList(posStr);
        actionsRow.appendChild(editBtn);

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.style.cssText = "flex:1;padding:5px;font-size:11px;background:#24243e;color:#e74c3c;border:1px solid #4a5568;border-radius:3px;cursor:pointer;";
        removeBtn.onclick = () => removeLightFromList(posStr);
        actionsRow.appendChild(removeBtn);

        item.appendChild(actionsRow);
        list.appendChild(item);
    });
}

/**
 * Go to light position in grid
 */
function goToLightPosition(posStr) {
    const [x, y, z] = posStr.split(",").map(Number);

    // Set grid to show this position
    const { axis } = window.gridState || { axis: "XY" };

    if (axis === "XY") {
        window.gridState.slice = z;
    } else if (axis === "XZ") {
        window.gridState.slice = y;
    } else {
        window.gridState.slice = x;
    }

    const sliceInput = document.getElementById("grid-slice-input");
    if (sliceInput) sliceInput.value = window.gridState.slice;

    if (typeof refreshGridView === "function") refreshGridView();
}

/**
 * Edit light from list
 */
function editLightFromList(posStr) {
    const naxel = getMainNaxel();
    const emission = naxel?.light_emission_dict?.[posStr];
    if (!emission) return;

    // Create edit popup
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:1000;";

    const popup = document.createElement("div");
    popup.style.cssText = "background:#24243e;padding:20px;border-radius:10px;min-width:280px;";

    popup.innerHTML = `
        <h3 style="margin-bottom:15px;">Edit Light Source</h3>
        <div style="margin-bottom:10px;color:#888;font-size:12px;">Position: ${posStr}</div>
        <div style="margin-bottom:15px;">
            <label style="display:block;margin-bottom:5px;">Emission (R, G, B):</label>
            <div style="display:flex;gap:5px;">
                <input type="number" id="edit-light-r" value="${emission[0]}" step="0.1" min="0" max="10" style="flex:1;padding:8px;background:#1a1a2e;color:white;border:1px solid #4a5568;border-radius:5px;">
                <input type="number" id="edit-light-g" value="${emission[1]}" step="0.1" min="0" max="10" style="flex:1;padding:8px;background:#1a1a2e;color:white;border:1px solid #4a5568;border-radius:5px;">
                <input type="number" id="edit-light-b" value="${emission[2]}" step="0.1" min="0" max="10" style="flex:1;padding:8px;background:#1a1a2e;color:white;border:1px solid #4a5568;border-radius:5px;">
            </div>
        </div>
        <div style="display:flex;gap:10px;">
            <button id="edit-light-save" style="flex:1;padding:10px;background:#3498db;color:white;border:none;border-radius:5px;cursor:pointer;">Save</button>
            <button id="edit-light-cancel" style="flex:1;padding:10px;background:#4a5568;color:white;border:none;border-radius:5px;cursor:pointer;">Cancel</button>
        </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    document.getElementById("edit-light-save").onclick = () => {
        const r = parseFloat(document.getElementById("edit-light-r").value) || 0;
        const g = parseFloat(document.getElementById("edit-light-g").value) || 0;
        const b = parseFloat(document.getElementById("edit-light-b").value) || 0;

        naxel.light_emission_dict[posStr] = [r, g, b];
        window.historyManager?.saveState();

        overlay.remove();
        refreshLightsList();
        if (typeof refreshGridView === "function") refreshGridView();
    };

    document.getElementById("edit-light-cancel").onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

/**
 * Remove light from list
 */
function removeLightFromList(posStr) {
    if (!confirm(`Remove light at ${posStr}?`)) return;

    const naxel = getMainNaxel();
    if (naxel?.light_emission_dict) {
        delete naxel.light_emission_dict[posStr];
        window.historyManager?.saveState();
        refreshLightsList();
        if (typeof refreshGridView === "function") refreshGridView();
    }
}

/**
 * Update light algorithm
 */
function updateLightAlgorithm() {
    const naxel = getMainNaxel();
    const algoSelect = document.getElementById("light-algorithm");
    if (algoSelect) {
        naxel.light_algorithm = algoSelect.value;
    }
}

/**
 * Apply light settings
 */
function applyLightSettings() {
    const naxel = getMainNaxel();

    const algoSelect = document.getElementById("light-algorithm");
    const diffusionInput = document.getElementById("light-diffusion");

    if (algoSelect) naxel.light_algorithm = algoSelect.value;
    if (diffusionInput) naxel.light_diffusion_strength = parseFloat(diffusionInput.value);

    window.historyManager?.saveState();
    triggerRerender();
}

// Expose functions
window.refreshLightsList = refreshLightsList;
window.goToLightPosition = goToLightPosition;
