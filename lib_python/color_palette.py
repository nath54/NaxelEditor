from typing import Optional, Any, cast

from .color import Color
from .colors_names import COLORS_DICT

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


def parse_color(
    data: Any,
    color_palette: Optional[ColorPalette] = None
) -> Color:
    """
    Parse a Color from various JSON formats.

    Supported formats:
        - list/tuple: [r, g, b] or [r, g, b, a]
        - hex string: "#RRGGBB" or "#RRGGBBAA"
        - color name: "red", "blue", etc.
        - palette key (if color_palette provided)
        - Color instance (pass-through)
    """

    if isinstance(data, Color):
        return data

    # List/tuple format: [r, g, b] or [r, g, b, a]
    if isinstance(data, list):

        data_list: list[int] = cast(list[int], data)

        if len(data_list) >= 4:
            return Color(int(data_list[0]), int(data_list[1]), int(data_list[2]), int(data_list[3]))

        elif len(data_list) >= 3:
            return Color(int(data_list[0]), int(data_list[1]), int(data_list[2]), 255)

        return Color()

    if isinstance(data, tuple):

        data_tuple: tuple[int, ...] = cast(tuple[int, ...], data)

        if len(data_tuple) >= 4:
            return Color(int(data_tuple[0]), int(data_tuple[1]), int(data_tuple[2]), int(data_tuple[3]))

        elif len(data_tuple) >= 3:
            return Color(int(data_tuple[0]), int(data_tuple[1]), int(data_tuple[2]), 255)

        return Color()

    # String format
    if isinstance(data, str):

        # Hex format: #RRGGBB or #RRGGBBAA
        if data.startswith("#"):

            hex_str: str = data[1:]

            if len(hex_str) == 6:

                r: int = int(hex_str[0:2], 16)
                g: int = int(hex_str[2:4], 16)
                b: int = int(hex_str[4:6], 16)

                return Color(r, g, b, 255)

            elif len(hex_str) == 8:

                r = int(hex_str[0:2], 16)
                g = int(hex_str[2:4], 16)
                b = int(hex_str[4:6], 16)
                a: int = int(hex_str[6:8], 16)

                return Color(r, g, b, a)

        # Color name lookup
        color_name_lower: str = data.lower()

        if color_name_lower in COLORS_DICT:
            return COLORS_DICT[color_name_lower]

        # Palette lookup if provided
        if color_palette is not None:

            palette_color: Optional[Color] = color_palette.get_color(data)

            if palette_color is not None:
                return palette_color

    # Integer palette key lookup
    if isinstance(data, int) and color_palette is not None:

        palette_color = color_palette.get_color(data)

        if palette_color is not None:
            return palette_color

    return Color()


def parse_color_palette(data: Any) -> ColorPalette:
    """
    Parse a ColorPalette from JSON dict format.

    Supported formats:
        - dict: {"key": color_data, ...} where color_data is any parse_color format
        - ColorPalette instance (pass-through)
    """

    if isinstance(data, ColorPalette):
        return data

    if isinstance(data, dict):

        data_dict: dict[str | int, Any] = cast(dict[str | int, Any], data)

        palette: dict[str | int, Color] = {}

        for key, value in data_dict.items():
            palette[key] = parse_color(value)

        return ColorPalette(palette=palette)

    return ColorPalette(palette={})
