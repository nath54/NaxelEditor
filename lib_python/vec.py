
class Vec3:

    def __init__(
        self,
        x: int,
        y: int,
        z: int
    ) -> None:

        self.x: int = x
        self.y: int = y
        self.z: int = z

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
