/**
 * NaiveRenderer - Canvas-based voxel renderer
 * Matches Python lib_python/renderer_naive.py
 */
class NaiveRenderer {
    constructor(naxel) {
        this.naxel = naxel;
    }

    /**
     * Render to a canvas element
     * @param {HTMLCanvasElement} canvas
     */
    render(canvas) {
        const camera = this.naxel.camera;
        const grid = this.naxel.grid;
        const environment = this.naxel.environment;

        const width = camera.width;
        const height = camera.height;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);

        const marcher = new RayMarcher(grid);

        // Camera transform matrices
        const camPos = camera.position;
        const rotX = camera.rotation.x;
        const rotY = camera.rotation.y;
        const rotZ = camera.rotation.z;

        // Precompute rotation matrix components
        const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
        const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
        const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

        for (let py = 0; py < height; py++) {
            for (let px = 0; px < width; px++) {
                // Pixel position in camera space
                const pixelX = (px - width / 2) * camera.pixelSize;
                const pixelZ = (height / 2 - py) * camera.pixelSize;
                const pixelY = camera.focal;

                // Rotate by camera rotation (ZYX order)
                // X rotation
                let y1 = pixelY * cosX - pixelZ * sinX;
                let z1 = pixelY * sinX + pixelZ * cosX;
                let x1 = pixelX;

                // Y rotation
                let x2 = x1 * cosY + z1 * sinY;
                let z2 = -x1 * sinY + z1 * cosY;
                let y2 = y1;

                // Z rotation
                let x3 = x2 * cosZ - y2 * sinZ;
                let y3 = x2 * sinZ + y2 * cosZ;
                let z3 = z2;

                const direction = new Vec3(x3, y3, z3).normalize();
                const ray = new Ray(camPos, direction);

                // March ray
                const hit = marcher.march(ray, camera.clipStart, camera.clipEnd);

                let color;
                if (hit.hit) {
                    color = hit.color;
                } else {
                    color = this._sampleEnvironment(environment, ray);
                }

                // Write to image data
                const idx = (py * width + px) * 4;
                imageData.data[idx + 0] = color.r;
                imageData.data[idx + 1] = color.g;
                imageData.data[idx + 2] = color.b;
                imageData.data[idx + 3] = color.a;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    _sampleEnvironment(env, ray) {
        if (env instanceof EnvironmentColor) {
            return env.color;
        }

        if (env instanceof EnvironmentSkyBox) {
            // Simple sky/ground based on ray Z direction
            if (ray.direction.z > 0) {
                return env.skyColor;
            } else {
                return env.groundColor;
            }
        }

        return new Color(0, 0, 0, 0);
    }

    /**
     * Calculate scene center and radius from grid bounds
     * @returns {{center: Vec3, radius: number}}
     */
    _calculateSceneCenter() {
        const grid = this.naxel.grid;
        const [min, max] = grid.getBounds();

        const center = new Vec3(
            (min.x + max.x) / 2,
            (min.y + max.y) / 2,
            (min.z + max.z) / 2
        );

        const dx = max.x - min.x;
        const dy = max.y - min.y;
        const dz = max.z - min.z;
        const radius = Math.sqrt(dx * dx + dy * dy + dz * dz) / 2;

        return { center, radius };
    }

    /**
     * Render with camera at specific angle around object
     * @param {HTMLCanvasElement} canvas
     * @param {number} angle - Rotation angle in radians
     * @param {number} distanceFactor - Camera distance multiplier
     * @param {number} elevationAngle - Camera elevation in radians
     */
    renderAtAngle(canvas, angle, distanceFactor = 2.5, elevationAngle = 0.4) {
        const { center, radius } = this._calculateSceneCenter();
        const baseCamera = this.naxel.camera;

        // Calculate camera distance
        const distance = Math.max(radius * distanceFactor, 5) + 3;
        const elevation = radius * Math.sin(elevationAngle) + radius * 0.3;

        // Camera position orbiting around Z axis
        const camX = center.x + distance * Math.cos(angle);
        const camY = center.y + distance * Math.sin(angle);
        const camZ = center.z + elevation;

        // Look direction
        const lookX = center.x - camX;
        const lookY = center.y - camY;
        const lookZ = center.z - camZ;

        // Calculate rotation angles
        const horizontalDist = Math.sqrt(lookX * lookX + lookY * lookY);
        const rotZ = Math.atan2(lookY, lookX) - Math.PI / 2;
        const rotX = -Math.atan2(lookZ, horizontalDist);

        // Create temporary camera
        const tempCamera = new Camera({
            position: new Vec3(camX, camY, camZ),
            rotation: new Vec3(rotX, 0, rotZ),
            focal: Math.max(baseCamera.focal, distance * 0.5),
            clipStart: 0.1,
            clipEnd: distance * 3,
            width: baseCamera.width,
            height: baseCamera.height,
            pixelSize: baseCamera.pixelSize,
        });

        // Temporarily swap camera
        const originalCamera = this.naxel.camera;
        this.naxel.camera = tempCamera;
        this.render(canvas);
        this.naxel.camera = originalCamera;
    }

    /**
     * Start animated rotation around the object
     * @param {HTMLCanvasElement} canvas
     * @param {object} options
     */
    startRotation(canvas, options = {}) {
        const speed = options.speed || 0.02;
        const distanceFactor = options.distanceFactor || 2.5;
        const elevationAngle = options.elevationAngle || 0.4;

        let angle = 0;
        const animate = () => {
            this.renderAtAngle(canvas, angle, distanceFactor, elevationAngle);
            angle += speed;
            if (angle > Math.PI * 2) angle -= Math.PI * 2;
            this._animationId = requestAnimationFrame(animate);
        };

        animate();
    }

    /**
     * Stop animated rotation
     */
    stopRotation() {
        if (this._animationId) {
            cancelAnimationFrame(this._animationId);
            this._animationId = null;
        }
    }
}

// Expose to window
window.NaiveRenderer = NaiveRenderer;
