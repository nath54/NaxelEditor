import numpy as np
from numpy.typing import NDArray

from .vec import Vec3
from .render_math import Vec3NP


class Ray:
    """
    Represents a ray in 3D space with an origin and a normalized direction.
    Used for ray casting in the voxel renderer.
    """

    def __init__(
        self,
        origin: Vec3NP,
        direction: Vec3NP
    ) -> None:

        self.origin: Vec3NP = origin
        self.direction: Vec3NP = direction

    def point_at(
        self,
        t: float
    ) -> Vec3NP:
        """
        Get a point along the ray at distance t from the origin.

        Args:
            t: Distance along the ray direction

        Returns:
            Vec3NP: Point at origin + t * direction
        """

        return Vec3NP(self.origin.data + t * self.direction.data)

    @staticmethod
    def create_from_points(
        origin: Vec3NP,
        target: Vec3NP
    ) -> "Ray":
        """
        Create a ray from an origin point towards a target point.
        The direction will be automatically normalized.

        Args:
            origin: Starting point of the ray
            target: Point the ray is directed towards

        Returns:
            Ray: A new ray with normalized direction
        """

        direction_data: NDArray[np.float32] = target.data - origin.data

        norm: float = float(np.linalg.norm(direction_data))

        if norm > 1e-10:
            direction_data = direction_data / norm

        return Ray(origin, Vec3NP(direction_data))

