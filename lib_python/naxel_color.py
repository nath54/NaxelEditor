from .utils import clamp
from .vec import Vec3

class NaxelColor:

    def __init__(
        self,
        r: int = 0,
        g: int = 0,
        b: int = 0,
        a: int = 255
    ) -> None:

        self.r: int = r
        self.g: int = g
        self.b: int = b
        self.a: int = a

    def color_at_pixel(
        self,
        xyz: Vec3
    ) -> tuple[int, int, int, int]:

        return (
            clamp(self.r, 0, 255),
            clamp(self.g, 0, 255),
            clamp(self.b, 0, 255),
            clamp(self.a, 0, 255)
        )

    def mult_factor(
        self,
        value: float
    ) -> "NaxelColor":

        return NaxelColor(
            r = int(self.r * value),
            g = int(self.r * value),
            b = int(self.r * value),
            a = self.a
        )

    def add_color(
        self,
        cl: "NaxelColor"
    ) -> "NaxelColor":

        return NaxelColor(
            r = self.r + cl.r,
            g = self.g + cl.g,
            b = self.b + cl.b,
            a = (self.a + cl.a) // 2
        )


class NaxelColorGradient(NaxelColor):

    def __init__(
        self,
        colors: list[NaxelColor],
        positions: list[Vec3],
    ) -> None:

        self.colors: list[NaxelColor] = colors
        self.positions: list[Vec3] = positions

    def color_at_pixel(
        self,
        xyz: Vec3
    ) -> tuple[int, int, int, int]:

        final_color: NaxelColor = NaxelColor()

        dist_tot: float = 0

        c: NaxelColor
        p: Vec3

        for c, p in zip(self.colors, self.positions):

            if xyz.check_equal(p):

                return c.color_at_pixel(xyz)

            d: float = 1 / xyz.dist(p)

            tmp_color = c.mult_factor(d)

            dist_tot += d

            final_color = final_color.add_color(tmp_color)

        final_color.mult_factor( 1 / dist_tot )

        return final_color.color_at_pixel(xyz)
