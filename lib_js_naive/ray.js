/**
 * Ray - Ray for ray casting
 * Matches Python lib_python/ray.py
 */
class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction.normalize();
    }

    /**
     * Get point along ray at distance t
     * @param {number} t
     * @returns {Vec3}
     */
    pointAt(t) {
        return new Vec3(
            this.origin.x + t * this.direction.x,
            this.origin.y + t * this.direction.y,
            this.origin.z + t * this.direction.z
        );
    }

    /**
     * Create ray from two points
     * @param {Vec3} origin
     * @param {Vec3} target
     * @returns {Ray}
     */
    static fromPoints(origin, target) {
        const dir = target.sub(origin);
        return new Ray(origin, dir);
    }
}

/**
 * HitResult - Ray intersection result
 * Matches Python lib_python/hit_result.py
 */
class HitResult {
    constructor(hit, t = 0, position = null, color = null, normal = null) {
        this.hit = hit;
        this.t = t;
        this.position = position;
        this.color = color;
        this.normal = normal;
    }

    static miss() {
        return new HitResult(false);
    }

    static createHit(t, position, color, normal = null) {
        return new HitResult(true, t, position, color, normal);
    }
}

// Expose to window
window.Ray = Ray;
window.HitResult = HitResult;
