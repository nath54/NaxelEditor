from typing import Optional

from .vec import Vec3


class NaxelPos:

    def __init__(
        self,
        xyz: Vec3,
        shift: Optional[Vec3] = None,
        scale: Optional[Vec3] = None,
        rotation: Optional[Vec3] = None,
        flip: Optional[Vec3] = None,
        crop: Optional[Vec3] = None,
    ) -> None:

        self.xyz: Vec3 = xyz
        self.shift: Optional[Vec3] = shift
        self.scale: Optional[Vec3] = scale
        self.rotation: Optional[Vec3] = rotation
        self.flip: Optional[Vec3] = flip
        self.crop: Optional[Vec3] = crop
