/**
 * Metadata Menu - Name, author, description, etc.
 */

/**
 * Create the metadata menu
 */
function create_metadata_menu() {
    const container = document.createElement("div");
    container.className = "metadata-menu";
    container.style.cssText = "display:flex;flex-direction:column;height:100%;padding:10px;gap:10px;overflow-y:auto;";

    // Header
    const header = document.createElement("h3");
    header.textContent = "📰 Metadata";
    header.style.cssText = "margin:0 0 10px 0;font-size:16px;";
    container.appendChild(header);

    const naxel = getMainNaxel();

    // Define fields
    const fields = [
        { key: "name", label: "Name", type: "text", placeholder: "My Naxel Object" },
        { key: "author", label: "Author", type: "text", placeholder: "Your name" },
        { key: "description", label: "Description", type: "textarea", placeholder: "Describe your creation..." },
        { key: "license", label: "License", type: "text", placeholder: "CC-BY, MIT, etc." },
        { key: "tags", label: "Tags", type: "text", placeholder: "tag1, tag2, tag3" },
        { key: "version", label: "Version", type: "text", placeholder: "1.0" },
    ];

    fields.forEach(({ key, label, type, placeholder }) => {
        const row = document.createElement("div");
        row.style.cssText = "margin-bottom:10px;";

        const lbl = document.createElement("label");
        lbl.textContent = label + ":";
        lbl.style.cssText = "display:block;margin-bottom:5px;font-size:12px;color:#888;";
        row.appendChild(lbl);

        let input;
        if (type === "textarea") {
            input = document.createElement("textarea");
            input.rows = 3;
        } else {
            input = document.createElement("input");
            input.type = type;
        }

        input.id = `metadata-${key}`;
        input.placeholder = placeholder;
        input.style.cssText = "width:100%;padding:8px;background:#1a1a2e;color:white;border:1px solid #4a5568;border-radius:5px;box-sizing:border-box;";
        if (type === "textarea") {
            input.style.resize = "vertical";
        }

        // Load current value
        let value = naxel?.[key] || "";
        if (key === "tags" && Array.isArray(value)) {
            value = value.join(", ");
        }
        input.value = value;

        // Save on change
        input.onchange = () => {
            saveMetadataField(key, input.value);
        };

        row.appendChild(input);
        container.appendChild(row);
    });

    // Info section
    const infoSection = document.createElement("div");
    infoSection.style.cssText = "margin-top:auto;padding:10px;background:#1a1a2e;border-radius:5px;";

    const infoHeader = document.createElement("div");
    infoHeader.textContent = "📊 Statistics";
    infoHeader.style.cssText = "font-weight:bold;margin-bottom:10px;";
    infoSection.appendChild(infoHeader);

    const statsDiv = document.createElement("div");
    statsDiv.id = "metadata-stats";
    statsDiv.style.cssText = "font-size:12px;color:#888;";
    infoSection.appendChild(statsDiv);

    container.appendChild(infoSection);

    // Update stats
    setTimeout(() => updateMetadataStats(), 0);

    return container;
}

/**
 * Save a metadata field
 */
function saveMetadataField(key, value) {
    const naxel = getMainNaxel();
    if (!naxel) return;

    if (key === "tags") {
        // Split tags by comma
        value = value.split(",").map(t => t.trim()).filter(t => t);
    }

    naxel[key] = value;
    window.historyManager?.saveState();
}

/**
 * Update metadata statistics
 */
function updateMetadataStats() {
    const statsDiv = document.getElementById("metadata-stats");
    if (!statsDiv) return;

    const naxel = getMainNaxel();
    if (!naxel) {
        statsDiv.textContent = "No object loaded";
        return;
    }

    // Count voxels
    const voxelCount = Object.keys(naxel.voxels_dict || {}).length;

    // Count shapes
    const shapeCount = (naxel.voxels_list || []).length;

    // Count colors
    const colorCount = Object.keys(naxel.color_palette || {}).length;

    // Count lights
    const lightCount = Object.keys(naxel.light_emission_dict || {}).length;

    // Count frames
    const frameCount = (naxel.frames || []).length || 1;

    statsDiv.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;">
            <div>Voxels: <strong>${voxelCount}</strong></div>
            <div>Shapes: <strong>${shapeCount}</strong></div>
            <div>Colors: <strong>${colorCount}</strong></div>
            <div>Lights: <strong>${lightCount}</strong></div>
            <div>Frames: <strong>${frameCount}</strong></div>
        </div>
    `;
}

/**
 * Load metadata values into form (called when switching to this menu)
 */
function loadMetadataValues() {
    const naxel = getMainNaxel();
    if (!naxel) return;

    const fields = ["name", "author", "description", "license", "tags", "version"];

    fields.forEach(key => {
        const input = document.getElementById(`metadata-${key}`);
        if (input) {
            let val = naxel[key] || "";
            if (key === "tags" && Array.isArray(val)) {
                val = val.join(", ");
            }
            input.value = val;
        }
    });

    updateMetadataStats();
}

// Expose functions
window.loadMetadataValues = loadMetadataValues;
window.updateMetadataStats = updateMetadataStats;
