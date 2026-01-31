/**
 * lib_naxel.js - Entry point and public API
 * Per README: window.naxel_objects, render_naxel(), render_all_naxels()
 */

// Initialize global storage
window.naxel_objects = window.naxel_objects || {};

/**
 * Render a naxel object to a specific HTML element
 * @param {string} key - Key in window.naxel_objects
 * @param {string} nodeId - ID of the HTML element
 */
function render_naxel(key, nodeId) {
    const json = window.naxel_objects[key];
    if (!json) {
        console.error(`Naxel object with key "${key}" not found`);
        return;
    }

    const element = document.getElementById(nodeId);
    if (!element) {
        console.error(`Element with id "${nodeId}" not found`);
        return;
    }

    // Parse naxel
    const naxel = loadNaxel(json);

    // Create canvas
    let canvas = element.querySelector('canvas.naxel-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'naxel-canvas';
        element.appendChild(canvas);
    }

    // Render
    const renderer = new NaiveRenderer(naxel);
    renderer.render(canvas);
}

/**
 * Render all elements with data-naxel attribute
 */
function render_all_naxels() {
    const elements = document.querySelectorAll('[data-naxel]');

    elements.forEach((element, index) => {
        const key = element.getAttribute('data-naxel');
        if (!key) return;

        // Ensure element has an ID
        if (!element.id) {
            element.id = `naxel-container-${index}`;
        }

        // Check if animated
        const animated = element.hasAttribute('data-naxel-animated');

        if (animated) {
            render_naxel_animated(key, element.id);
        } else {
            render_naxel(key, element.id);
        }
    });
}

/**
 * Render a naxel object with animated rotation around the scene
 * @param {string} key - Key in window.naxel_objects
 * @param {string} nodeId - ID of the HTML element
 * @param {object} options - Animation options
 */
function render_naxel_animated(key, nodeId, options = {}) {
    const json = window.naxel_objects[key];
    if (!json) {
        console.error(`Naxel object with key "${key}" not found`);
        return null;
    }

    const element = document.getElementById(nodeId);
    if (!element) {
        console.error(`Element with id "${nodeId}" not found`);
        return null;
    }

    // Parse naxel
    const naxel = loadNaxel(json);

    // Create canvas
    let canvas = element.querySelector('canvas.naxel-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'naxel-canvas';
        element.appendChild(canvas);
    }

    // Render with animation
    const renderer = new NaiveRenderer(naxel);
    renderer.startRotation(canvas, options);

    return renderer; // Return renderer so user can stop animation
}

// Expose to window
window.render_naxel = render_naxel;
window.render_naxel_animated = render_naxel_animated;
window.render_all_naxels = render_all_naxels;

// Auto-render on DOMContentLoaded if desired
document.addEventListener('DOMContentLoaded', () => {
    // Optional: auto-render can be enabled by setting window.naxel_autorender = true
    if (window.naxel_autorender) {
        render_all_naxels();
    }
});
