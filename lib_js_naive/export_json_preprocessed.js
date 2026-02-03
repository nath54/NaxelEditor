/**
 * export_json_preprocessed.js - Export pre-processed naxel objects to JSON
 * Matches Python Naxel.export_to_dict_preprocessed()
 *
 * This exports the naxel with all shapes expanded to individual voxels.
 * The resulting JSON can be used for faster rendering as it requires no shape processing.
 */

/**
 * Export a parsed naxel object with all shapes expanded to individual voxels
 *
 * @param {object} naxel - Parsed naxel object from loadNaxel()
 * @param {object} originalJson - Optional, the original JSON for metadata preservation
 * @returns {object} - JSON-compatible object with voxels_dict containing all processed voxels
 */
function exportNaxelPreprocessedToJson(naxel, originalJson = {}) {

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

    // Mark as post-processed
    result.is_post_processed = true;

    // --- General Data ---
    result.default_color = naxel.defaultColor.exportToLst();

    // Empty palette since colors are now resolved
    result.color_palette = {};

    if (originalJson.grid_thickness !== undefined) {
        result.grid_thickness = originalJson.grid_thickness;
    }
    if (originalJson.grid_color !== undefined) {
        result.grid_color = originalJson.grid_color;
    }

    // --- Processed Voxel Data ---
    // Export the processed grid as voxels_dict
    result.voxels_dict = naxel.grid.exportToDict();

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
 * Convert a pre-processed naxel export to a JSON string
 * @param {object} naxel - Parsed naxel object
 * @param {object} originalJson - Optional, original JSON for metadata
 * @param {number} indent - Indentation spaces (default: 2)
 * @returns {string} - JSON string
 */
function exportNaxelPreprocessedToJsonString(naxel, originalJson = {}, indent = 2) {
    return JSON.stringify(exportNaxelPreprocessedToJson(naxel, originalJson), null, indent);
}

// Expose to window
window.exportNaxelPreprocessedToJson = exportNaxelPreprocessedToJson;
window.exportNaxelPreprocessedToJsonString = exportNaxelPreprocessedToJsonString;
