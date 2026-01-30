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


def parse_pos(data: Any) -> Pos:
    """
    Parse a Pos from various JSON formats.

    Supported formats:
        - list/tuple: [x, y, z] -> Pos with xyz only
        - dict with "xyz" key: {"xyz": [0, 0, 0], "shift": ..., ...}
        - dict without "xyz" key: treated as Vec3
        - Pos instance (pass-through)
    """

    if isinstance(data, Pos):
        return data

    if isinstance(data, (list, tuple)):
        return Pos(xyz=parse_vec3(data))

    if isinstance(data, dict):

        if "xyz" in data:

            return Pos(
                xyz=parse_vec3(data["xyz"]),
                shift=parse_vec3(data["shift"]) if "shift" in data else None,
                scale=parse_vec3(data["scale"]) if "scale" in data else None,
                rotation=parse_vec3(data["rotation"]) if "rotation" in data else None,
                flip=parse_vec3(data["flip"]) if "flip" in data else None,
                crop=parse_vec3(data["crop"]) if "crop" in data else None,
            )

        else:

            return Pos(xyz=parse_vec3(data))

    if isinstance(data, str):
        return Pos(xyz=parse_vec3(data))

    return Pos(xyz=Vec3(0, 0, 0))
