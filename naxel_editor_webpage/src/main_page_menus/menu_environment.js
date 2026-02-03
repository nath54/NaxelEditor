/**
 * Environment Menu - Background and skybox settings
 */

/**
 * Create the environment menu
 */
function create_environment_menu() {
    const container = document.createElement("div");
    container.className = "environment-menu";
    container.style.cssText = "display:flex;flex-direction:column;height:100%;padding:10px;gap:15px;overflow-y:auto;";

    // Header
    const header = document.createElement("h3");
    header.textContent = "🏔️ Environment";
    header.style.cssText = "margin:0 0 10px 0;font-size:16px;";
    container.appendChild(header);

    // Environment type selector
    const typeSection = document.createElement("div");
    typeSection.style.cssText = "margin-bottom:15px;";

    const typeLabel = document.createElement("div");
    typeLabel.textContent = "Type:";
    typeLabel.style.cssText = "margin-bottom:8px;font-size:12px;color:#888;";
    typeSection.appendChild(typeLabel);

    const typeContainer = document.createElement("div");
    typeContainer.style.cssText = "display:flex;gap:15px;";

    const naxel = getMainNaxel();
    const currentType = naxel?.environment_type || "color";

    const colorLabel = document.createElement("label");
    colorLabel.style.cssText = "display:flex;align-items:center;gap:5px;cursor:pointer;";
    colorLabel.innerHTML = `<input type="radio" name="env-type" value="color" ${currentType === "color" ? "checked" : ""}> Solid Color`;
    colorLabel.querySelector("input").onchange = () => setEnvironmentType("color");
    typeContainer.appendChild(colorLabel);

    const skyboxLabel = document.createElement("label");
    skyboxLabel.style.cssText = "display:flex;align-items:center;gap:5px;cursor:pointer;";
    skyboxLabel.innerHTML = `<input type="radio" name="env-type" value="skybox" ${currentType === "skybox" ? "checked" : ""}> Skybox`;
    skyboxLabel.querySelector("input").onchange = () => setEnvironmentType("skybox");
    typeContainer.appendChild(skyboxLabel);

    typeSection.appendChild(typeContainer);
    container.appendChild(typeSection);

    // Options container
    const optionsDiv = document.createElement("div");
    optionsDiv.id = "env-options";
    container.appendChild(optionsDiv);

    // Apply button
    const applyBtn = document.createElement("button");
    applyBtn.textContent = "Apply Changes";
    applyBtn.style.cssText = "padding:10px;background:#3498db;color:white;border:none;border-radius:5px;cursor:pointer;margin-top:auto;";
    applyBtn.onclick = () => applyEnvironmentChanges();
    container.appendChild(applyBtn);

    // Initialize options
    setTimeout(() => refreshEnvironmentOptions(), 0);

    return container;
}

/**
 * Refresh environment options based on type
 */
function refreshEnvironmentOptions() {
    const naxel = getMainNaxel();
    const type = naxel?.environment_type || "color";
    const optionsDiv = document.getElementById("env-options");
    if (!optionsDiv) return;

    optionsDiv.innerHTML = "";

    if (type === "color") {
        // Solid color options
        const colorRow = createColorPicker(
            "Background Color:",
            "env-color",
            naxel?.environment_color || [30, 30, 50]
        );
        optionsDiv.appendChild(colorRow);

        const emissionRow = createSlider(
            "Light Emission:",
            "env-emission",
            0, 2,
            naxel?.environment_color_light_emission || 1,
            0.1
        );
        optionsDiv.appendChild(emissionRow);

    } else {
        // Skybox options
        const skyColorRow = createColorPicker(
            "Sky Color:",
            "sky-color",
            naxel?.sky_color || [135, 206, 235]
        );
        optionsDiv.appendChild(skyColorRow);

        const skyEmissionRow = createSlider(
            "Sky Emission:",
            "sky-emission",
            0, 2,
            naxel?.sky_color_light_emission || 0.1,
            0.1
        );
        optionsDiv.appendChild(skyEmissionRow);

        const groundColorRow = createColorPicker(
            "Ground Color:",
            "ground-color",
            naxel?.ground_color || [100, 80, 60]
        );
        optionsDiv.appendChild(groundColorRow);

        const groundEmissionRow = createSlider(
            "Ground Emission:",
            "ground-emission",
            0, 2,
            naxel?.ground_color_light_emission || 0,
            0.1
        );
        optionsDiv.appendChild(groundEmissionRow);

        // Sun direction
        const sunHeader = document.createElement("div");
        sunHeader.textContent = "Sun Settings";
        sunHeader.style.cssText = "margin-top:15px;padding-top:15px;border-top:1px solid #4a5568;font-weight:bold;margin-bottom:10px;";
        optionsDiv.appendChild(sunHeader);

        const sunDir = naxel?.sun_direction || [0, -1, 0];

        const sunDirRow = document.createElement("div");
        sunDirRow.style.cssText = "margin-bottom:10px;";

        const sunDirLabel = document.createElement("label");
        sunDirLabel.textContent = "Direction (X, Y, Z):";
        sunDirLabel.style.cssText = "display:block;margin-bottom:5px;font-size:12px;color:#888;";
        sunDirRow.appendChild(sunDirLabel);

        const sunInputs = document.createElement("div");
        sunInputs.style.cssText = "display:flex;gap:5px;";

        ["x", "y", "z"].forEach((axis, i) => {
            const input = document.createElement("input");
            input.type = "number";
            input.id = `sun-dir-${axis}`;
            input.value = sunDir[i] || 0;
            input.step = 0.1;
            input.style.cssText = "flex:1;padding:8px;background:#1a1a2e;color:white;border:1px solid #4a5568;border-radius:5px;";
            sunInputs.appendChild(input);
        });

        sunDirRow.appendChild(sunInputs);
        optionsDiv.appendChild(sunDirRow);

        const sunEmissionRow = createSlider(
            "Sun Emission:",
            "sun-emission",
            0, 2,
            naxel?.sun_light_emission || 1,
            0.1
        );
        optionsDiv.appendChild(sunEmissionRow);
    }
}

/**
 * Set environment type
 */
function setEnvironmentType(type) {
    const naxel = getMainNaxel();
    naxel.environment_type = type;
    refreshEnvironmentOptions();
}

/**
 * Apply environment changes
 */
function applyEnvironmentChanges() {
    const naxel = getMainNaxel();
    const type = naxel?.environment_type || "color";

    if (type === "color") {
        const colorInput = document.getElementById("env-color");
        const emissionInput = document.getElementById("env-emission");

        if (colorInput) naxel.environment_color = hexToRgb(colorInput.value);
        if (emissionInput) naxel.environment_color_light_emission = parseFloat(emissionInput.value);

    } else {
        const skyColorInput = document.getElementById("sky-color");
        const skyEmissionInput = document.getElementById("sky-emission");
        const groundColorInput = document.getElementById("ground-color");
        const groundEmissionInput = document.getElementById("ground-emission");
        const sunDirX = document.getElementById("sun-dir-x");
        const sunDirY = document.getElementById("sun-dir-y");
        const sunDirZ = document.getElementById("sun-dir-z");
        const sunEmissionInput = document.getElementById("sun-emission");

        if (skyColorInput) naxel.sky_color = hexToRgb(skyColorInput.value);
        if (skyEmissionInput) naxel.sky_color_light_emission = parseFloat(skyEmissionInput.value);
        if (groundColorInput) naxel.ground_color = hexToRgb(groundColorInput.value);
        if (groundEmissionInput) naxel.ground_color_light_emission = parseFloat(groundEmissionInput.value);
        if (sunDirX && sunDirY && sunDirZ) {
            naxel.sun_direction = [
                parseFloat(sunDirX.value),
                parseFloat(sunDirY.value),
                parseFloat(sunDirZ.value)
            ];
        }
        if (sunEmissionInput) naxel.sun_light_emission = parseFloat(sunEmissionInput.value);
    }

    window.historyManager?.saveState();
    triggerRerender();
}

// Expose functions
window.refreshEnvironmentOptions = refreshEnvironmentOptions;
window.setEnvironmentType = setEnvironmentType;
window.applyEnvironmentChanges = applyEnvironmentChanges;
