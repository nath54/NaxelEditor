from typing import Any, cast

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


def parse_light_value(data: Any) -> LightValue:
    """
    Parse a LightValue from various JSON formats.

    Supported formats:
        - list/tuple: [r, g, b]
        - dict: {"r": 1.0, "g": 1.0, "b": 1.0}
        - LightValue instance (pass-through)
    """

    if isinstance(data, LightValue):
        return data

    if isinstance(data, (list, tuple)):

        data_lt: list[float] | tuple[float, ...] = cast(list[float] | tuple[float, ...], data)

        if len(data_lt) >= 3:

            return LightValue(float(data_lt[0]), float(data_lt[1]), float(data_lt[2]))

    if isinstance(data, dict):

        data_dict: dict[str, float] = cast(dict[str, float], data)

        return LightValue(
            float(data_dict.get("r", 1.0)),
            float(data_dict.get("g", 1.0)),
            float(data_dict.get("b", 1.0))
        )

    return LightValue()
