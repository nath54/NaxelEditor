/**
 * Camera - Camera configuration
 * Matches Python lib_python/camera.py
 */
class Camera {
    constructor(options = {}) {
        this.position = options.position || new Vec3(0, 0, 0);
        this.rotation = options.rotation || new Vec3(0, 0, 0);
        this.focal = options.focal || 70;
        this.clipStart = options.clipStart || 0.1;
        this.clipEnd = options.clipEnd || 100;
        this.width = options.width || 64;
        this.height = options.height || 64;
        this.pixelSize = options.pixelSize || 0.4;
    }

    clone() {
        return new Camera({
            position: this.position.clone(),
            rotation: this.rotation.clone(),
            focal: this.focal,
            clipStart: this.clipStart,
            clipEnd: this.clipEnd,
            width: this.width,
            height: this.height,
            pixelSize: this.pixelSize,
        });
    }
}

/**
 * Parse camera from JSON
 * @param {object} json - JSON object
 * @returns {Camera}
 */
function parseCamera(json) {
    return new Camera({
        position: parseVec3(json.camera_position || [0, 0, 0]),
        rotation: parseVec3(json.camera_rotation || [0, 0, 0]),
        focal: json.camera_focal || 70,
        clipStart: json.camera_clip_start || 0.1,
        clipEnd: json.camera_clip_end || 100,
        width: json.camera_width || 64,
        height: json.camera_height || 64,
        pixelSize: json.camera_pixel_size || 0.4,
    });
}

// Expose to window
window.Camera = Camera;
window.parseCamera = parseCamera;
