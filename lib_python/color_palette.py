from typing import Optional

from .color import Color


class ColorPalette:

    def __init__(
        self,
        palette: dict[str | int, Color]
    ) -> None:

        self.palette: dict[str | int, Color] = palette

    def get_color(
        self,
        color_key: str | int
    ) -> Optional[Color]:

        return self.palette.get(color_key, None)
