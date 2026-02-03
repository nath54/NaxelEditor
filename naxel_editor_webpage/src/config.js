/**
 * Global configuration variables for Naxel Editor
 */

window.naxelConfig = {
    // Grid settings
    ghostSliceOpacity: 0.5,      // Opacity for ghost voxels (0-1)
    defaultSlice: 0,             // Default slice position (origin)
    gridZoom: 16,                // Pixels per voxel in grid view
    gridMinZoom: 8,              // Minimum zoom level
    gridMaxZoom: 64,             // Maximum zoom level

    // Visual indicators
    shapeOriginColor: "#3498db", // Blue border for shape origins
    lightSourceColor: "#f1c40f", // Yellow border for light sources
    selectionColor: "#9b59b6",   // Purple for selection

    // Touch settings
    longPressDelay: 500,         // ms before long-press triggers

    // Camera defaults
    defaultCameraDistance: 15,
    cameraRotateSpeed: 0.02,
    cameraMoveSpeed: 1,

    // History
    maxUndoSteps: 50,
};

// Expose globally
window.naxelConfig = window.naxelConfig;
