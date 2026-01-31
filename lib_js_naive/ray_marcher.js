/**
 * RayMarcher - 3D DDA voxel traversal
 * Matches Python lib_python/ray_marcher.py
 */
class RayMarcher {
    constructor(grid) {
        this.grid = grid;
    }

    /**
     * March ray through grid and find first hit
     * @param {Ray} ray
     * @param {number} clipStart
     * @param {number} clipEnd
     * @returns {HitResult}
     */
    march(ray, clipStart, clipEnd) {
        const [boundsMin, boundsMax] = this.grid.getBounds();

        // Ray-AABB intersection
        const tEntry = this._intersectAABB(ray, boundsMin, boundsMax);
        if (tEntry === null) {
            return HitResult.miss();
        }

        // Start position
        const tStart = Math.max(tEntry, clipStart);
        if (tStart >= clipEnd) {
            return HitResult.miss();
        }

        const startPos = ray.pointAt(tStart + 0.001);
        let x = Math.floor(startPos.x);
        let y = Math.floor(startPos.y);
        let z = Math.floor(startPos.z);

        // Direction signs
        const stepX = ray.direction.x >= 0 ? 1 : -1;
        const stepY = ray.direction.y >= 0 ? 1 : -1;
        const stepZ = ray.direction.z >= 0 ? 1 : -1;

        // Delta T for each axis
        const tDeltaX = Math.abs(1.0 / (ray.direction.x || 1e-10));
        const tDeltaY = Math.abs(1.0 / (ray.direction.y || 1e-10));
        const tDeltaZ = Math.abs(1.0 / (ray.direction.z || 1e-10));

        // Initial T to next cell boundary
        let tMaxX = tDeltaX * (stepX > 0 ? (x + 1 - startPos.x) : (startPos.x - x));
        let tMaxY = tDeltaY * (stepY > 0 ? (y + 1 - startPos.y) : (startPos.y - y));
        let tMaxZ = tDeltaZ * (stepZ > 0 ? (z + 1 - startPos.z) : (startPos.z - z));

        let t = tStart;
        const maxIterations = 1000;

        for (let i = 0; i < maxIterations; i++) {
            // Check bounds
            if (x < boundsMin.x || x >= boundsMax.x ||
                y < boundsMin.y || y >= boundsMax.y ||
                z < boundsMin.z || z >= boundsMax.z) {
                break;
            }

            // Check voxel
            const color = this.grid.getVoxel(x, y, z);
            if (color !== null) {
                return HitResult.createHit(
                    t,
                    new Vec3(x, y, z),
                    color,
                    null
                );
            }

            // Advance to next cell
            if (tMaxX < tMaxY) {
                if (tMaxX < tMaxZ) {
                    x += stepX;
                    t = tStart + tMaxX;
                    tMaxX += tDeltaX;
                } else {
                    z += stepZ;
                    t = tStart + tMaxZ;
                    tMaxZ += tDeltaZ;
                }
            } else {
                if (tMaxY < tMaxZ) {
                    y += stepY;
                    t = tStart + tMaxY;
                    tMaxY += tDeltaY;
                } else {
                    z += stepZ;
                    t = tStart + tMaxZ;
                    tMaxZ += tDeltaZ;
                }
            }

            if (t > clipEnd) break;
        }

        return HitResult.miss();
    }

    _intersectAABB(ray, min, max) {
        let tMin = -Infinity;
        let tMax = Infinity;

        for (const axis of ['x', 'y', 'z']) {
            const origin = ray.origin[axis];
            const dir = ray.direction[axis];
            const bMin = min[axis];
            const bMax = max[axis];

            if (Math.abs(dir) < 1e-10) {
                if (origin < bMin || origin > bMax) return null;
            } else {
                let t1 = (bMin - origin) / dir;
                let t2 = (bMax - origin) / dir;
                if (t1 > t2) [t1, t2] = [t2, t1];
                tMin = Math.max(tMin, t1);
                tMax = Math.min(tMax, t2);
                if (tMin > tMax) return null;
            }
        }

        return tMin > 0 ? tMin : 0;
    }
}

// Expose to window
window.RayMarcher = RayMarcher;
