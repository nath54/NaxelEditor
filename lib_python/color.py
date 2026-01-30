from .utils import clamp, between
from .vec import Vec3

class Color:

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
    ) -> "Color":

        return Color(
            r = int(self.r * value),
            g = int(self.r * value),
            b = int(self.r * value),
            a = self.a
        )

    def add_color(
        self,
        cl: "Color"
    ) -> "Color":

        return Color(
            r = self.r + cl.r,
            g = self.g + cl.g,
            b = self.b + cl.b,
            a = (self.a + cl.a) // 2
        )


class ColorGradient(Color):

    def __init__(
        self,
        colors: list[Color] = [],
        positions: list[Vec3] = [],
    ) -> None:

        self.colors: list[Color] = colors
        self.positions: list[Vec3] = positions

    def color_at_pixel(
        self,
        xyz: Vec3
    ) -> tuple[int, int, int, int]:

        final_color: Color = Color()

        dist_tot: float = 0

        c: Color
        p: Vec3

        for c, p in zip(self.colors, self.positions):

            if xyz.check_equal(p):

                return c.color_at_pixel(xyz)

            d: float = 1 / xyz.dist(p)

            tmp_color = c.mult_factor(d)

            dist_tot += d

            final_color = final_color.add_color(tmp_color)

        if abs(dist_tot) > 1e-6:
            final_color.mult_factor( 1 / dist_tot )

        return final_color.color_at_pixel(xyz)



class ColorZone:

    def __init__(
        self,
        color: Color,
        position1: Vec3,
        position2: Vec3
    ) -> None:

        self.color: Color = color
        self.pos1: Vec3 = position1
        self.pos2: Vec3 = position2

    def check_in_zone(
        self,
        v: Vec3
    ) -> bool:

        return between(v.x, self.pos1.x, self.pos2.x) \
           and between(v.y, self.pos1.y, self.pos2.y) \
           and between(v.z, self.pos1.z, self.pos2.z)


class ColorZones(Color):

    def __init__(
        self,
        default_color: Color = Color(),
        zones: list[ColorZone] = []
    ) -> None:

        self.default_color: Color = default_color
        self.zones: list[ColorZone] = zones

    def color_at_pixel(
        self,
        xyz: Vec3
    ) -> tuple[int, int, int, int]:

        z: ColorZone

        for z in self.zones:

            if z.check_in_zone(xyz):

                return z.color.color_at_pixel(xyz)

        return self.default_color.color_at_pixel(xyz)
