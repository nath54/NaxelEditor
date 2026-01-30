from typing import Any


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
