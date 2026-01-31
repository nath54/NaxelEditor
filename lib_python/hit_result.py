from typing import Optional

from .vec import Vec3
from .color import Color
from .render_math import Vec3NP


class HitResult:
    """
    Stores the result of a ray-voxel intersection test.
    """

    def __init__(
        self,
        hit: bool,
        t: float = 0.0,
        position: Optional[Vec3] = None,
        color: Optional[Color] = None,
        normal: Optional[Vec3NP] = None
    ) -> None:

        self.hit: bool = hit
        self.t: float = t
        self.position: Optional[Vec3] = position
        self.color: Optional[Color] = color
        self.normal: Optional[Vec3NP] = normal

    @staticmethod
    def miss() -> "HitResult":
        """
        Create a HitResult representing a ray miss (no intersection).

        Returns:
            HitResult: A miss result with hit=False
        """

        return HitResult(hit=False)

    @staticmethod
    def create_hit(
        t: float,
        position: Vec3,
        color: Color,
        normal: Vec3NP
    ) -> "HitResult":
        """
        Create a HitResult representing a successful ray hit.

        Args:
            t: Distance along the ray to the hit point
            position: Integer voxel position that was hit
            color: Color of the hit voxel
            normal: Surface normal at the hit point

        Returns:
            HitResult: A hit result with all intersection data
        """

        return HitResult(
            hit=True,
            t=t,
            position=position,
            color=color,
            normal=normal
        )

