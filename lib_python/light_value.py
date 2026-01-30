
class LightValue:

    def __init__(
        self,
        r: float = 1,
        g: float = 1,
        b: float = 1,
    ) -> None:

        self.r: float = r
        self.g: float = g
        self.b: float = b

    def export_to_lst(self) -> list[float]:

        return [self.r, self.g, self.b]

    def add(self, lv: "LightValue") -> "LightValue":

        return LightValue(
            self.r + lv.r,
            self.g + lv.g,
            self.b + lv.b
        )

