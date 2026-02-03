/**
 * export_json_base.js - Export naxel objects to JSON format
 * Matches Python Naxel.export_to_dict()
 */

/**
 * Export a parsed naxel object back to JSON format
 * This exports the ORIGINAL data without pre-processing (shapes are preserved as shapes)
 *
 * Note: This function requires the original JSON to preserve shape definitions,
 * since the parsed naxel object only contains the processed grid.
 *
 * @param {object} naxel - Parsed naxel object from loadNaxel()
 * @param {object} originalJson - The original JSON that was used to create the naxel
 * @returns {object} - JSON-compatible object
 */
function exportNaxelToJson(naxel, originalJson) {

    const result = {};

    // --- Metadata ---
    result.name = naxel.name || originalJson.name || 'Untitled';
    result.author = naxel.author || originalJson.author || '';
    result.description = naxel.description || originalJson.description || '';

    if (originalJson.date_created) {
        result.date_created = originalJson.date_created;
    }
    if (originalJson.date_modified) {
        result.date_modified = originalJson.date_modified;
    }
    if (originalJson.tags) {
        result.tags = originalJson.tags;
    }
    if (originalJson.license) {
        result.license = originalJson.license;
    }

    result.is_post_processed = originalJson.is_post_processed || false;

    // --- General Data ---
    result.default_color = naxel.defaultColor.exportToLst();

    // Export color palette
    const paletteExport = {};
    for (const key in naxel.colorPalette) {
        paletteExport[key] = naxel.colorPalette[key].exportToLst();
    }
    result.color_palette = paletteExport;

    if (originalJson.grid_thickness !== undefined) {
        result.grid_thickness = originalJson.grid_thickness;
    }
    if (originalJson.grid_color !== undefined) {
        result.grid_color = originalJson.grid_color;
    }

    // --- Voxel Data ---
    // Preserve original voxel definitions (shapes, dict, list)
    if (originalJson.voxels_dict) {
        result.voxels_dict = originalJson.voxels_dict;
    }
    if (originalJson.voxels_list) {
        result.voxels_list = originalJson.voxels_list;
    }
    if (originalJson.voxels_grid) {
        result.voxels_grid = originalJson.voxels_grid;
    }

    // --- Frames (for animations) ---
    if (originalJson.frames) {
        result.frames = originalJson.frames;
    }

    // --- Light Data ---
    if (originalJson.light_emission_dict) {
        result.light_emission_dict = originalJson.light_emission_dict;
    }
    if (originalJson.light_emission_items) {
        result.light_emission_items = originalJson.light_emission_items;
    }

    // --- Environment ---
    const envDict = naxel.environment.exportToDict();
    for (const key in envDict) {
        result[key] = envDict[key];
    }

    // --- Camera ---
    const camDict = naxel.camera.exportToDict();
    for (const key in camDict) {
        result[key] = camDict[key];
    }

    return result;
}

/**
 * Convert a naxel JSON export to a JSON string
 * @param {object} naxel - Parsed naxel object
 * @param {object} originalJson - Original JSON
 * @param {number} indent - Indentation spaces (default: 2)
 * @returns {string} - JSON string
 */
function exportNaxelToJsonString(naxel, originalJson, indent = 2) {
    return JSON.stringify(exportNaxelToJson(naxel, originalJson), null, indent);
}

// Expose to window
window.exportNaxelToJson = exportNaxelToJson;
window.exportNaxelToJsonString = exportNaxelToJsonString;
