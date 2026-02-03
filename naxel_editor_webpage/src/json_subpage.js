/**
 * JSON Subpage - Import, export, and edit JSON
 */

/**
 * Initialize the JSON subpage
 */
function initJsonSubpage() {
    const subpage = document.getElementById("subpage-json");
    if (!subpage) return;

    // Check if already initialized
    if (subpage.querySelector(".json-subpage-container")) return;

    // Clear and setup
    subpage.innerHTML = "";

    const container = document.createElement("div");
    container.className = "json-subpage-container";
    container.style.cssText = "display:flex;flex-direction:column;height:100%;padding:10px;gap:10px;";

    // Header
    const header = document.createElement("h3");
    header.textContent = "📄 JSON Editor";
    header.style.cssText = "margin:0;font-size:16px;";
    container.appendChild(header);

    // Button row
    const btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;";

    const buttons = [
        { text: "📥 Load from Scene", action: loadJsonFromScene, color: "#3498db" },
        { text: "📤 Apply to Scene", action: applyJsonToScene, color: "#2ecc71" },
        { text: "💾 Download", action: downloadJson, color: "#9b59b6" },
        { text: "📂 Import File", action: importJsonFile, color: "#e67e22" },
    ];

    buttons.forEach(({ text, action, color }) => {
        const btn = document.createElement("button");
        btn.textContent = text;
        btn.onclick = action;
        btn.style.cssText = `padding:8px 12px;background:${color};color:white;border:none;border-radius:5px;cursor:pointer;font-size:12px;white-space:nowrap;`;
        btnRow.appendChild(btn);
    });
    container.appendChild(btnRow);

    // Export options row
    const exportRow = document.createElement("div");
    exportRow.style.cssText = "display:flex;gap:10px;align-items:center;padding:8px;background:#1a1a2e;border-radius:5px;";

    const exportLabel = document.createElement("span");
    exportLabel.textContent = "Export:";
    exportLabel.style.cssText = "font-size:12px;color:#888;";
    exportRow.appendChild(exportLabel);

    const exportBaseBtn = document.createElement("button");
    exportBaseBtn.textContent = "Base JSON";
    exportBaseBtn.onclick = () => downloadJson(false);
    exportBaseBtn.style.cssText = "padding:6px 10px;background:#4a5568;color:white;border:none;border-radius:3px;cursor:pointer;font-size:11px;";
    exportRow.appendChild(exportBaseBtn);

    const exportPreBtn = document.createElement("button");
    exportPreBtn.textContent = "Preprocessed";
    exportPreBtn.onclick = () => downloadJson(true);
    exportPreBtn.style.cssText = "padding:6px 10px;background:#4a5568;color:white;border:none;border-radius:3px;cursor:pointer;font-size:11px;";
    exportRow.appendChild(exportPreBtn);

    container.appendChild(exportRow);

    // Textarea for JSON editing
    const textarea = document.createElement("textarea");
    textarea.id = "json-editor-textarea";
    textarea.placeholder = "Click 'Load from Scene' to view and edit the current Naxel object as JSON...";
    textarea.style.cssText = `
        flex: 1;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 12px;
        background: #0a0a1a;
        color: #a0ffa0;
        border: 1px solid #4a5568;
        padding: 10px;
        resize: none;
        border-radius: 5px;
        line-height: 1.4;
    `;
    textarea.spellcheck = false;
    container.appendChild(textarea);

    // Status bar
    const statusBar = document.createElement("div");
    statusBar.id = "json-status-bar";
    statusBar.style.cssText = "font-size:11px;color:#888;padding:5px;background:#1a1a2e;border-radius:3px;";
    statusBar.textContent = "Ready";
    container.appendChild(statusBar);

    subpage.appendChild(container);
}

/**
 * Load JSON from current scene
 */
function loadJsonFromScene() {
    const naxel = getMainNaxel();
    if (!naxel) {
        updateJsonStatus("No naxel object found", true);
        return;
    }

    const textarea = document.getElementById("json-editor-textarea");
    if (textarea) {
        textarea.value = JSON.stringify(naxel, null, 2);
        updateJsonStatus(`Loaded ${textarea.value.length} characters`);
    }
}

/**
 * Apply JSON to scene
 */
function applyJsonToScene() {
    const textarea = document.getElementById("json-editor-textarea");
    if (!textarea || !textarea.value.trim()) {
        updateJsonStatus("No JSON to apply", true);
        return;
    }

    try {
        const parsed = JSON.parse(textarea.value);
        window.naxel_objects["main_naxel"] = parsed;
        window.historyManager?.saveState();
        triggerRerender();
        updateJsonStatus("Applied successfully!");
    } catch (e) {
        updateJsonStatus(`Parse error: ${e.message}`, true);
    }
}

/**
 * Download JSON file
 * @param {boolean} preprocessed - Whether to export preprocessed version
 */
function downloadJson(preprocessed = false) {
    const naxel = getMainNaxel();
    if (!naxel) {
        updateJsonStatus("No naxel object to download", true);
        return;
    }

    let jsonData;
    let filename;

    if (preprocessed && typeof export_naxel_preprocessed === "function") {
        jsonData = export_naxel_preprocessed(naxel);
        filename = (naxel.name || "naxel") + "_preprocessed.json";
    } else if (preprocessed) {
        updateJsonStatus("Preprocessed export not available", true);
        return;
    } else {
        jsonData = naxel;
        filename = (naxel.name || "naxel") + ".json";
    }

    const json = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([json], { type: "application/json" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);

    updateJsonStatus(`Downloaded: ${filename}`);
}

/**
 * Import JSON file
 */
function importJsonFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const textarea = document.getElementById("json-editor-textarea");
            if (textarea) {
                textarea.value = evt.target.result;
                updateJsonStatus(`Imported: ${file.name} (${evt.target.result.length} chars)`);
            }
        };
        reader.onerror = () => {
            updateJsonStatus("Failed to read file", true);
        };
        reader.readAsText(file);
    };

    input.click();
}

/**
 * Update JSON status bar
 * @param {string} message - Status message
 * @param {boolean} isError - Whether this is an error
 */
function updateJsonStatus(message, isError = false) {
    const statusBar = document.getElementById("json-status-bar");
    if (statusBar) {
        statusBar.textContent = message;
        statusBar.style.color = isError ? "#e74c3c" : "#888";
    }
}

// Expose functions
window.initJsonSubpage = initJsonSubpage;
window.loadJsonFromScene = loadJsonFromScene;
window.applyJsonToScene = applyJsonToScene;
window.downloadJson = downloadJson;
window.importJsonFile = importJsonFile;
