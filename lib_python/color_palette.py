from typing import Optional, Any

from .color import Color


class ColorPalette:

    def __init__(
        self,
        palette: dict[str | int, Color]
    ) -> None:

        self.palette: dict[str | int, Color] = palette

    def export_to_dict(self) -> dict[str | int, Any]:

        return {
            k: v.export_to_lst() for k, v in self.palette.items()
        }

    def get_color(
        self,
        color_key: str | int
    ) -> Optional[Color]:

        return self.palette.get(color_key, None)
