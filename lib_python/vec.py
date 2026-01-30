from typing import Any, cast


class Vec3:

    def __init__(
        self,
        x: int | float,
        y: int | float,
        z: int | float,
    ) -> None:

        self.x: int | float = x
        self.y: int | float = y
        self.z: int | float = z

    def export_to_str(self) -> str:

        return f"{self.x}, {self.y}, {self.z}"

    def dist(
        self,
        v: "Vec3"
    ) -> float:

        return (self.x - v.x) ** 2 \
             + (self.y - v.y) ** 2 \
             + (self.z - v.z) ** 2

    def check_equal(
        self,
        v: "Vec3"
    ) -> bool:

        #
        return (self.x == v.x) \
           and (self.y == v.y) \
           and (self.z == v.z)

    def __eq__(self, other: Any) -> bool:

        if not isinstance(other, Vec3):
            return False

        return self.check_equal(other)

    def __str__(self) -> str:

        return f"{self.x}_{self.y}_{self.z}"

    def __hash__(self) -> int:

        return hash(self.__str__())


def parse_vec3(data: Any) -> Vec3:
    """
    Parse a Vec3 from various JSON formats.

    Supported formats:
        - list/tuple: [x, y, z]
        - dict: {"x": 0, "y": 1, "z": 2}
        - string: "x,y,z" or "x, y, z"
        - Vec3 instance (pass-through)
    """

    if isinstance(data, Vec3):
        return data

    if isinstance(data, (list, tuple)):

        data_lt: list[int] | tuple[int, ...] = cast(list[int] | tuple[int, ...], data)

        if len(data_lt) >= 3:
            return Vec3(data_lt[0], data_lt[1], data_lt[2])

    if isinstance(data, dict):

        data_dict: dict[str, int] = cast(dict[str, int], data)

        return Vec3(
            data_dict.get("x", 0),
            data_dict.get("y", 0),
            data_dict.get("z", 0)
        )

    if isinstance(data, str):
        parts: list[str] = [p.strip() for p in data.replace("_", ",").split(",")]
        if len(parts) >= 3:
            return Vec3(float(parts[0]), float(parts[1]), float(parts[2]))

    return Vec3(0, 0, 0)
