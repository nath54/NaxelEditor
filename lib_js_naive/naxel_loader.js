/**
 * NaxelLoader - Parse Naxel JSON into data structures
 * Matches Python lib_python/naxel_loader.py
 */

/**
 * Load a Naxel object from JSON
 * @param {object} json - JSON object
 * @returns {object} - Parsed Naxel object
 */
function loadNaxel(json) {
    // Metadata
    const name = json.name || 'Untitled';
    const author = json.author || '';
    const description = json.description || '';

    // General data
    const defaultColor = parseColor(json.default_color || [0, 0, 0, 255]);
    const colorPalette = parseColorPalette(json.color_palette || {});

    // Camera
    const camera = parseCamera(json);

    // Environment
    const environment = parseEnvironment(json);

    // Build voxel grid
    const grid = new VoxelGrid();
    buildVoxelGrid(grid, json, colorPalette);

    return {
        name,
        author,
        description,
        defaultColor,
        colorPalette,
        camera,
        environment,
        grid,
    };
}

/**
 * Parse color palette
 * @param {object} palette
 * @returns {object}
 */
function parseColorPalette(palette) {
    const result = {};
    for (const key in palette) {
        result[key] = parseColor(palette[key]);
    }
    return result;
}

/**
 * Build voxel grid from JSON data
 * @param {VoxelGrid} grid
 * @param {object} json
 * @param {object} palette
 */
function buildVoxelGrid(grid, json, palette) {
    // voxels_dict: { "x,y,z": color }
    if (json.voxels_dict) {
        for (const posStr in json.voxels_dict) {
            const pos = parseVec3(posStr);
            const colorValue = json.voxels_dict[posStr];
            const color = resolveColor(colorValue, palette);
            grid.setVoxel(pos.x, pos.y, pos.z, color);
        }
    }

    // voxels_list: [ { type: "shape_...", ... } ]
    if (json.voxels_list && Array.isArray(json.voxels_list)) {
        for (const shape of json.voxels_list) {
            grid.rasterizeShape(shape, palette);
        }
    }
}

/**
 * Resolve color from value using palette
 * @param {any} value
 * @param {object} palette
 * @returns {Color}
 */
function resolveColor(value, palette) {
    if (typeof value === 'string' && palette[value]) {
        return palette[value].clone();
    }
    return parseColor(value);
}

// Expose to window
window.loadNaxel = loadNaxel;
window.parseColorPalette = parseColorPalette;
window.buildVoxelGrid = buildVoxelGrid;
window.resolveColor = resolveColor;
