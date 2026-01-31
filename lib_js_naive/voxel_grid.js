/**
 * VoxelGrid - Sparse voxel storage with AABB bounds
 * Matches Python lib_python/voxel_grid.py
 */
class VoxelGrid {
    constructor() {
        this._voxels = new Map(); // key: "x,y,z" -> Color
        this._minBounds = new Vec3(0, 0, 0);
        this._maxBounds = new Vec3(0, 0, 0);
        this._isEmpty = true;
    }

    /**
     * Get color at position
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {Color|null}
     */
    getVoxel(x, y, z) {
        const key = `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
        return this._voxels.get(key) || null;
    }

    /**
     * Set voxel at position
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {Color} color
     */
    setVoxel(x, y, z, color) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        const iz = Math.floor(z);
        const key = `${ix},${iy},${iz}`;
        this._voxels.set(key, color);
        this._updateBounds(ix, iy, iz);
    }

    _updateBounds(x, y, z) {
        if (this._isEmpty) {
            this._minBounds = new Vec3(x, y, z);
            this._maxBounds = new Vec3(x + 1, y + 1, z + 1);
            this._isEmpty = false;
        } else {
            this._minBounds = new Vec3(
                Math.min(this._minBounds.x, x),
                Math.min(this._minBounds.y, y),
                Math.min(this._minBounds.z, z)
            );
            this._maxBounds = new Vec3(
                Math.max(this._maxBounds.x, x + 1),
                Math.max(this._maxBounds.y, y + 1),
                Math.max(this._maxBounds.z, z + 1)
            );
        }
    }

    getBounds() {
        return [this._minBounds, this._maxBounds];
    }

    isEmpty() {
        return this._isEmpty;
    }

    /**
     * Rasterize a shape into the grid
     * @param {object} shape - Shape definition
     * @param {object} palette - Color palette
     */
    rasterizeShape(shape, palette = {}) {
        const type = shape.type;
        const color = this._resolveColor(shape.color, palette);

        if (type === 'shape_point') {
            const pos = parseVec3(shape.position);
            this.setVoxel(pos.x, pos.y, pos.z, color);
        }
        else if (type === 'shape_cube') {
            const pos = parseVec3(shape.position);
            const size = shape.size || 1;
            for (let dx = 0; dx < size; dx++) {
                for (let dy = 0; dy < size; dy++) {
                    for (let dz = 0; dz < size; dz++) {
                        this.setVoxel(pos.x + dx, pos.y + dy, pos.z + dz, color);
                    }
                }
            }
        }
        else if (type === 'shape_rect') {
            const pos1 = parseVec3(shape.position);
            const pos2 = parseVec3(shape.position2);
            const xMin = Math.min(pos1.x, pos2.x), xMax = Math.max(pos1.x, pos2.x);
            const yMin = Math.min(pos1.y, pos2.y), yMax = Math.max(pos1.y, pos2.y);
            const zMin = Math.min(pos1.z, pos2.z), zMax = Math.max(pos1.z, pos2.z);
            for (let x = xMin; x <= xMax; x++) {
                for (let y = yMin; y <= yMax; y++) {
                    for (let z = zMin; z <= zMax; z++) {
                        this.setVoxel(x, y, z, color);
                    }
                }
            }
        }
        else if (type === 'shape_sphere') {
            const center = parseVec3(shape.position);
            const radius = shape.radius || 1;
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dz = -radius; dz <= radius; dz++) {
                        if (dx * dx + dy * dy + dz * dz <= radius * radius) {
                            this.setVoxel(center.x + dx, center.y + dy, center.z + dz, color);
                        }
                    }
                }
            }
        }
        else if (type === 'shape_line') {
            const pos1 = parseVec3(shape.position);
            const pos2 = parseVec3(shape.position2);
            this._rasterizeLine(pos1, pos2, color);
        }
    }

    _rasterizeLine(p1, p2, color) {
        const dx = Math.abs(p2.x - p1.x);
        const dy = Math.abs(p2.y - p1.y);
        const dz = Math.abs(p2.z - p1.z);
        const sx = p1.x < p2.x ? 1 : -1;
        const sy = p1.y < p2.y ? 1 : -1;
        const sz = p1.z < p2.z ? 1 : -1;
        const dm = Math.max(dx, dy, dz);

        let x = Math.floor(p1.x), y = Math.floor(p1.y), z = Math.floor(p1.z);
        this.setVoxel(x, y, z, color);

        if (dm === 0) return;

        const xInc = dx / dm, yInc = dy / dm, zInc = dz / dm;
        let xAcc = 0, yAcc = 0, zAcc = 0;

        for (let i = 0; i < dm; i++) {
            xAcc += xInc; yAcc += yInc; zAcc += zInc;
            if (xAcc >= 0.5) { x += sx; xAcc -= 1; }
            if (yAcc >= 0.5) { y += sy; yAcc -= 1; }
            if (zAcc >= 0.5) { z += sz; zAcc -= 1; }
            this.setVoxel(x, y, z, color);
        }
    }

    _resolveColor(colorValue, palette) {
        if (typeof colorValue === 'string' && palette[colorValue]) {
            return parseColor(palette[colorValue]);
        }
        return parseColor(colorValue);
    }
}

// Expose to window
window.VoxelGrid = VoxelGrid;
