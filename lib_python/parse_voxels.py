from typing import Optional, Any, cast


from .vec import Vec3, parse_vec3
from .pos import Pos, parse_pos
from .color import Color
from .color_palette import ColorPalette, parse_color
from .voxel_value import (
    VoxelValue,
    VoxelValueColor,
    VoxelValueFromPalette,
    VoxelValueImportVoxel,
    VoxelValueShapePoint,
    VoxelValueShapeLine,
    VoxelValueShapeTriangle,
    VoxelValueShapeCircle,
    VoxelValueShapeCube,
    VoxelValueShapeRect,
    VoxelValueShapeSphere,
    VoxelValueShapeCylinder,
    VoxelValueShapePolygon,
)


def parse_voxel_value(
    data: Any,
    color_palette: Optional[ColorPalette] = None
) -> VoxelValue:
    """
    Parse a VoxelValue from various JSON formats.

    Supported formats:
        - color data (string/list) -> VoxelValueColor
        - dict with "type" key -> shape-specific VoxelValue
        - palette key reference -> VoxelValueFromPalette
    """

    # Dict with type key -> shape
    if isinstance(data, dict) and "type" in data:

        data_dict: dict[str, Any] = cast(dict[str, Any], data)

        voxel_type: str = data_dict["type"]

        # Resolve color (may be palette reference)
        color_data: Any = data_dict.get("color", [255, 255, 255, 255])

        # Check if color is a palette key
        if isinstance(color_data, str) and color_palette is not None:

            palette_color: Optional[Color] = color_palette.get_color(color_data)

            if palette_color is not None:
                color = palette_color

            else:
                color = parse_color(color_data, color_palette)

        else:
            color = parse_color(color_data, color_palette)

        # Parse based on type
        if voxel_type == "import_voxel":

            return VoxelValueImportVoxel(
                path=data_dict.get("path", ""),
                position=parse_pos(data_dict.get("position", [0, 0, 0]))
            )

        elif voxel_type == "shape_point":

            return VoxelValueShapePoint(
                color=color,
                position=parse_pos(data_dict.get("position", [0, 0, 0]))
            )

        elif voxel_type == "shape_line":

            return VoxelValueShapeLine(
                color=color,
                position=parse_pos(data_dict.get("position", [0, 0, 0])),
                position2=parse_pos(data_dict.get("position2", [0, 0, 0]))
            )

        elif voxel_type == "shape_triangle":

            return VoxelValueShapeTriangle(
                color=color,
                position=parse_pos(data_dict.get("position", [0, 0, 0])),
                position2=parse_pos(data_dict.get("position2", [0, 0, 0])),
                position3=parse_pos(data_dict.get("position3", [0, 0, 0]))
            )

        elif voxel_type == "shape_circle":

            return VoxelValueShapeCircle(
                color=color,
                position=parse_pos(data_dict.get("position", [0, 0, 0])),
                radius=int(data_dict.get("radius", 1)),
                axis=data_dict.get("axis", "z")
            )

        elif voxel_type == "shape_cube":

            return VoxelValueShapeCube(
                color=color,
                position=parse_pos(data_dict.get("position", [0, 0, 0])),
                size=int(data_dict.get("size", 1))
            )

        elif voxel_type == "shape_rect":

            return VoxelValueShapeRect(
                color=color,
                position=parse_pos(data_dict.get("position", [0, 0, 0])),
                position2=parse_pos(data_dict.get("position2", [0, 0, 0]))
            )

        elif voxel_type == "shape_sphere":

            return VoxelValueShapeSphere(
                color=color,
                position=parse_pos(data_dict.get("position", [0, 0, 0])),
                radius=int(data_dict.get("radius", 1))
            )

        elif voxel_type == "shape_cylinder":

            return VoxelValueShapeCylinder(
                color=color,
                position=parse_pos(data_dict.get("position", [0, 0, 0])),
                radius=int(data_dict.get("radius", 1)),
                height=int(data_dict.get("height", 1)),
                axis=data_dict.get("axis", "y")
            )

        elif voxel_type == "shape_polygon":

            polygon_data: list[Any] = data_dict.get("polygon", [])
            polygon: list[Pos] = [parse_pos(p) for p in polygon_data]

            return VoxelValueShapePolygon(
                color=color,
                position=parse_pos(data_dict.get("position", [0, 0, 0])),
                polygon=polygon
            )

    # Simple color data -> VoxelValueColor
    if isinstance(data, (list, tuple)):
        return VoxelValueColor(color=parse_color(data, color_palette))

    # String: could be color name or palette key
    if isinstance(data, str):

        # Check if it's a palette key first
        if color_palette is not None:

            palette_color = color_palette.get_color(data)

            if palette_color is not None:
                return VoxelValueColor(color=palette_color)

        # Otherwise try parsing as color
        return VoxelValueColor(color=parse_color(data, color_palette))

    # Integer palette key
    if isinstance(data, int) and color_palette is not None:
        return VoxelValueFromPalette(palette_key=data)

    return VoxelValue()


def parse_voxels_dict(
    data: dict[str, Any],
    color_palette: Optional[ColorPalette] = None
) -> dict[Vec3, VoxelValue]:
    """
    Parse a voxels_dict from JSON format.

    Expected format: {"x,y,z": color_or_voxel_data, ...}
    """

    result: dict[Vec3, VoxelValue] = {}

    for key, value in data.items():

        vec: Vec3 = parse_vec3(key)
        voxel: VoxelValue = parse_voxel_value(value, color_palette)

        result[vec] = voxel

    return result


def parse_voxels_list(
    data: list[Any],
    color_palette: Optional[ColorPalette] = None
) -> list[VoxelValue]:
    """
    Parse a voxels_list from JSON format.

    Expected format: [voxel_data, ...]
    """

    return [parse_voxel_value(item, color_palette) for item in data]

