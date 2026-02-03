/**
 * Vec3 - 3D Vector class
 * Matches Python lib_python/vec.py
 */
class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(other) {
        return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    sub(other) {
        return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    mul(scalar) {
        return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    div(scalar) {
        return new Vec3(this.x / scalar, this.y / scalar, this.z / scalar);
    }

    dot(other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    cross(other) {
        return new Vec3(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x
        );
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize() {
        const len = this.length();
        if (len < 1e-10) return new Vec3(0, 0, 0);
        return this.div(len);
    }

    clone() {
        return new Vec3(this.x, this.y, this.z);
    }

    /**
     * Export position to string format "x, y, z"
     * Matches Python Vec3.export_to_str()
     * @returns {string}
     */
    exportToStr() {
        return `${this.x}, ${this.y}, ${this.z}`;
    }
}

/**
 * Parse a position from various formats
 * @param {any} value - Position in any supported format
 * @returns {Vec3}
 */
function parseVec3(value) {
    if (value instanceof Vec3) {
        return value;
    }

    if (Array.isArray(value) && value.length >= 3) {
        return new Vec3(value[0], value[1], value[2]);
    }

    if (typeof value === 'object' && value !== null) {
        return new Vec3(
            value.x || 0,
            value.y || 0,
            value.z || 0
        );
    }

    if (typeof value === 'string') {
        // Support formats: "x,y,z", "x y z", "x-y-z", "x_y_z"
        const parts = value.split(/[,\s\-_]+/).map(Number);
        if (parts.length >= 3) {
            return new Vec3(parts[0], parts[1], parts[2]);
        }
    }

    return new Vec3(0, 0, 0);
}

// Expose to window
window.Vec3 = Vec3;
window.parseVec3 = parseVec3;
