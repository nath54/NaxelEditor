import numpy as np
from numpy.typing import NDArray
import math

from .vec import Vec3
from .color import Color
from .ray import Ray
from .hit_result import HitResult
from .voxel_grid import VoxelGrid
from .render_math import Vec3NP


class RayMarcher:
    """
    3D DDA (Digital Differential Analyzer) algorithm for efficient voxel traversal.
    Marches a ray through the voxel grid and returns the first hit.
    """

    def __init__(
        self,
        grid: VoxelGrid
    ) -> None:

        self.grid: VoxelGrid = grid

    def march(
        self,
        ray: Ray,
        clip_start: float,
        clip_end: float
    ) -> HitResult:
        """
        March a ray through the voxel grid using 3D DDA algorithm.

        Args:
            ray: The ray to march
            clip_start: Near clipping plane distance
            clip_end: Far clipping plane distance

        Returns:
            HitResult: The intersection result
        """

        if self.grid.is_empty():
            return HitResult.miss()

        # Get grid bounds
        bounds_min, bounds_max = self.grid.get_bounds()

        # Find intersection with bounding box
        t_enter, t_exit = self._intersect_aabb(ray, bounds_min, bounds_max)

        if t_enter > t_exit or t_exit < clip_start or t_enter > clip_end:
            return HitResult.miss()

        # Clamp t_enter to clip_start
        t_start = max(t_enter, clip_start)

        # Get starting position
        start_point: Vec3NP = ray.point_at(t_start + 0.001)

        # Current voxel position
        x: int = int(math.floor(start_point.data[0]))
        y: int = int(math.floor(start_point.data[1]))
        z: int = int(math.floor(start_point.data[2]))

        # Direction components
        dx: float = float(ray.direction.data[0])
        dy: float = float(ray.direction.data[1])
        dz: float = float(ray.direction.data[2])

        # Step direction (-1 or 1)
        step_x: int = 1 if dx >= 0 else -1
        step_y: int = 1 if dy >= 0 else -1
        step_z: int = 1 if dz >= 0 else -1

        # t_delta: how far along the ray we need to travel for each axis step
        t_delta_x: float = abs(1.0 / dx) if abs(dx) > 1e-10 else float('inf')
        t_delta_y: float = abs(1.0 / dy) if abs(dy) > 1e-10 else float('inf')
        t_delta_z: float = abs(1.0 / dz) if abs(dz) > 1e-10 else float('inf')

        # t_max: distance to next voxel boundary for each axis
        t_max_x: float = self._compute_t_max(
            start_point.data[0], dx, step_x
        )
        t_max_y: float = self._compute_t_max(
            start_point.data[1], dy, step_y
        )
        t_max_z: float = self._compute_t_max(
            start_point.data[2], dz, step_z
        )

        # Track current t for distance limiting
        t_current: float = t_start

        # Maximum iterations to prevent infinite loop
        max_iterations: int = int((clip_end - clip_start) * 3) + 1000

        last_axis: int = -1  # 0=x, 1=y, 2=z

        for _ in range(max_iterations):

            # Check if we're still within bounds
            if not self._in_bounds(x, y, z, bounds_min, bounds_max):
                return HitResult.miss()

            # Check if we've exceeded clip_end
            if t_current > clip_end:
                return HitResult.miss()

            # Check for voxel at current position
            color = self.grid.get_voxel(x, y, z)

            if color is not None:

                # Calculate normal based on entry face
                normal: Vec3NP = self._compute_normal(last_axis, step_x, step_y, step_z)

                return HitResult.create_hit(
                    t=t_current,
                    position=Vec3(x, y, z),
                    color=color,
                    normal=normal
                )

            # Advance to next voxel using DDA
            if t_max_x < t_max_y:

                if t_max_x < t_max_z:

                    x += step_x
                    t_current = t_max_x
                    t_max_x += t_delta_x
                    last_axis = 0

                else:

                    z += step_z
                    t_current = t_max_z
                    t_max_z += t_delta_z
                    last_axis = 2

            else:

                if t_max_y < t_max_z:

                    y += step_y
                    t_current = t_max_y
                    t_max_y += t_delta_y
                    last_axis = 1

                else:

                    z += step_z
                    t_current = t_max_z
                    t_max_z += t_delta_z
                    last_axis = 2

        return HitResult.miss()

    def _compute_t_max(
        self,
        pos: float,
        direction: float,
        step: int
    ) -> float:
        """
        Compute initial t_max for a given axis.
        """

        if abs(direction) < 1e-10:
            return float('inf')

        if step > 0:
            boundary: float = math.floor(pos) + 1.0
        else:
            boundary = math.floor(pos)

        return (boundary - pos) / direction

    def _in_bounds(
        self,
        x: int,
        y: int,
        z: int,
        bounds_min: Vec3,
        bounds_max: Vec3
    ) -> bool:
        """
        Check if a position is within the grid bounds.
        """

        return (
            x >= bounds_min.x and x < bounds_max.x and
            y >= bounds_min.y and y < bounds_max.y and
            z >= bounds_min.z and z < bounds_max.z
        )

    def _compute_normal(
        self,
        axis: int,
        step_x: int,
        step_y: int,
        step_z: int
    ) -> Vec3NP:
        """
        Compute the surface normal based on entry axis.
        """

        if axis == 0:
            return Vec3NP(np.array([-step_x, 0, 0], dtype=np.float32))
        elif axis == 1:
            return Vec3NP(np.array([0, -step_y, 0], dtype=np.float32))
        elif axis == 2:
            return Vec3NP(np.array([0, 0, -step_z], dtype=np.float32))
        else:
            return Vec3NP(np.array([0, 1, 0], dtype=np.float32))

    def _intersect_aabb(
        self,
        ray: Ray,
        bounds_min: Vec3,
        bounds_max: Vec3
    ) -> tuple[float, float]:
        """
        Calculate ray-AABB intersection using slab method.

        Returns:
            Tuple of (t_enter, t_exit) distances
        """

        origin = ray.origin.data
        direction = ray.direction.data

        t_min: float = float('-inf')
        t_max: float = float('inf')

        for i in range(3):

            if abs(direction[i]) < 1e-10:

                # Ray parallel to slab
                min_val = [bounds_min.x, bounds_min.y, bounds_min.z][i]
                max_val = [bounds_max.x, bounds_max.y, bounds_max.z][i]

                if origin[i] < min_val or origin[i] > max_val:
                    return (float('inf'), float('-inf'))

            else:

                min_val = [bounds_min.x, bounds_min.y, bounds_min.z][i]
                max_val = [bounds_max.x, bounds_max.y, bounds_max.z][i]

                t1: float = (min_val - origin[i]) / direction[i]
                t2: float = (max_val - origin[i]) / direction[i]

                if t1 > t2:
                    t1, t2 = t2, t1

                t_min = max(t_min, t1)
                t_max = min(t_max, t2)

        return (t_min, t_max)

