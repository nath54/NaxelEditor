from typing import Optional, Any

from .vec import Vec3


class Pos:

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

    def export_to_dict(self) -> dict[str, Any]:

        arr: list[tuple[str, Optional[Vec3]]] = [
            ("xyz", self.xyz),
            ("shift", self.shift),
            ("scale", self.scale),
            ("rotation", self.rotation),
            ("flip", self.flip),
            ("crop", self.crop),
        ]

        return {
            k: v.export_to_str()

            for k, v in arr

            if v is not None
        }
