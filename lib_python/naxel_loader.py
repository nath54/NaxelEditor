from typing import Optional, Any

import os
import json
import argparse

from .vec import Vec3
from .pos import Pos
from .color import Color
from .color_palette import ColorPalette
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
from .light_value import LightValue
from .environment import Environment, EnvironmentColor, EnvironmentSkyBox
from .camera import Camera
from .naxel import Naxel, NaxelDataFrame, NaxelGeneralData
from .colors_names import COLORS_DICT


# =============================================================================
# --- Helper Parsing Functions ---
# =============================================================================


def parse_vec3(data: Any) -> Vec3:
    """
    Parse a Vec3 from various JSON formats.

    Supported formats:
        - list/tuple: [x, y, z]
        - dict: {"x": 0, "y": 1, "z": 2}
        - string: "x,y,z" or "x, y, z"
        - Vec3 instance (pass-through)
    """

    if isinstance(data, Vec3):
        return data

    if isinstance(data, (list, tuple)) and len(data) >= 3:
        return Vec3(data[0], data[1], data[2])

    if isinstance(data, dict):
        return Vec3(
            data.get("x", 0),
            data.get("y", 0),
            data.get("z", 0)
        )

    if isinstance(data, str):
        parts: list[str] = [p.strip() for p in data.replace("_", ",").split(",")]
        if len(parts) >= 3:
            return Vec3(float(parts[0]), float(parts[1]), float(parts[2]))

    return Vec3(0, 0, 0)


def parse_pos(data: Any) -> Pos:
    """
    Parse a Pos from various JSON formats.

    Supported formats:
        - list/tuple: [x, y, z] -> Pos with xyz only
        - dict with "xyz" key: {"xyz": [0, 0, 0], "shift": ..., ...}
        - dict without "xyz" key: treated as Vec3
        - Pos instance (pass-through)
    """

    if isinstance(data, Pos):
        return data

    if isinstance(data, (list, tuple)):
        return Pos(xyz=parse_vec3(data))

    if isinstance(data, dict):

        if "xyz" in data:

            return Pos(
                xyz=parse_vec3(data["xyz"]),
                shift=parse_vec3(data["shift"]) if "shift" in data else None,
                scale=parse_vec3(data["scale"]) if "scale" in data else None,
                rotation=parse_vec3(data["rotation"]) if "rotation" in data else None,
                flip=parse_vec3(data["flip"]) if "flip" in data else None,
                crop=parse_vec3(data["crop"]) if "crop" in data else None,
            )

        else:

            return Pos(xyz=parse_vec3(data))

    if isinstance(data, str):
        return Pos(xyz=parse_vec3(data))

    return Pos(xyz=Vec3(0, 0, 0))


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
    if isinstance(data, (list, tuple)):

        if len(data) >= 4:
            return Color(int(data[0]), int(data[1]), int(data[2]), int(data[3]))

        elif len(data) >= 3:
            return Color(int(data[0]), int(data[1]), int(data[2]), 255)

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

        palette: dict[str | int, Color] = {}

        for key, value in data.items():
            palette[key] = parse_color(value)

        return ColorPalette(palette=palette)

    return ColorPalette(palette={})


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

    if isinstance(data, (list, tuple)) and len(data) >= 3:
        return LightValue(float(data[0]), float(data[1]), float(data[2]))

    if isinstance(data, dict):
        return LightValue(
            float(data.get("r", 1.0)),
            float(data.get("g", 1.0)),
            float(data.get("b", 1.0))
        )

    return LightValue()


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

        voxel_type: str = data["type"]

        # Resolve color (may be palette reference)
        color_data: Any = data.get("color", [255, 255, 255, 255])

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
                path=data.get("path", ""),
                position=parse_pos(data.get("position", [0, 0, 0]))
            )

        elif voxel_type == "shape_point":

            return VoxelValueShapePoint(
                color=color,
                position=parse_pos(data.get("position", [0, 0, 0]))
            )

        elif voxel_type == "shape_line":

            return VoxelValueShapeLine(
                color=color,
                position=parse_pos(data.get("position", [0, 0, 0])),
                position2=parse_pos(data.get("position2", [0, 0, 0]))
            )

        elif voxel_type == "shape_triangle":

            return VoxelValueShapeTriangle(
                color=color,
                position=parse_pos(data.get("position", [0, 0, 0])),
                position2=parse_pos(data.get("position2", [0, 0, 0])),
                position3=parse_pos(data.get("position3", [0, 0, 0]))
            )

        elif voxel_type == "shape_circle":

            return VoxelValueShapeCircle(
                color=color,
                position=parse_pos(data.get("position", [0, 0, 0])),
                radius=int(data.get("radius", 1)),
                axis=data.get("axis", "z")
            )

        elif voxel_type == "shape_cube":

            return VoxelValueShapeCube(
                color=color,
                position=parse_pos(data.get("position", [0, 0, 0])),
                size=int(data.get("size", 1))
            )

        elif voxel_type == "shape_rect":

            return VoxelValueShapeRect(
                color=color,
                position=parse_pos(data.get("position", [0, 0, 0])),
                position2=parse_pos(data.get("position2", [0, 0, 0]))
            )

        elif voxel_type == "shape_sphere":

            return VoxelValueShapeSphere(
                color=color,
                position=parse_pos(data.get("position", [0, 0, 0])),
                radius=int(data.get("radius", 1))
            )

        elif voxel_type == "shape_cylinder":

            return VoxelValueShapeCylinder(
                color=color,
                position=parse_pos(data.get("position", [0, 0, 0])),
                radius=int(data.get("radius", 1)),
                height=int(data.get("height", 1)),
                axis=data.get("axis", "y")
            )

        elif voxel_type == "shape_polygon":

            polygon_data: list[Any] = data.get("polygon", [])
            polygon: list[Pos] = [parse_pos(p) for p in polygon_data]

            return VoxelValueShapePolygon(
                color=color,
                position=parse_pos(data.get("position", [0, 0, 0])),
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


# =============================================================================
# --- Main Loading Functions ---
# =============================================================================


def load_dataframes(
    json_dict: dict[str, Any],
    general_data: Optional[NaxelGeneralData] = None
) -> list[NaxelDataFrame]:
    """
    Load data frames from the JSON dictionary.

    Supports both single-frame and multi-frame formats:
        - Single frame: voxels_dict/voxels_list at root level
        - Multi-frame: "frames" array with individual frame data
    """

    # Create a default general_data if not provided
    if general_data is None:
        general_data = NaxelGeneralData()

    color_palette: ColorPalette = general_data.color_palette
    data_frames: list[NaxelDataFrame] = []

    # Check for multi-frame format
    if "frames" in json_dict and isinstance(json_dict["frames"], list):

        for idx, frame_data in enumerate(json_dict["frames"]):

            frame_id: int = frame_data.get("frame_id", idx)
            frame_duration: float = frame_data.get("frame_duration", 1.0)

            # Parse voxels
            voxels_dict: Optional[dict[Vec3, VoxelValue]] = None
            voxels_list: Optional[list[VoxelValue]] = None

            if "voxels_dict" in frame_data:
                voxels_dict = parse_voxels_dict(frame_data["voxels_dict"], color_palette)

            if "voxels_list" in frame_data:
                voxels_list = parse_voxels_list(frame_data["voxels_list"], color_palette)

            # Parse light emission
            light_emission_dict: Optional[dict[Vec3, LightValue]] = None

            if "light_emission_dict" in frame_data:

                light_emission_dict = {}

                for key, value in frame_data["light_emission_dict"].items():
                    light_emission_dict[parse_vec3(key)] = parse_light_value(value)

            data_frame: NaxelDataFrame = NaxelDataFrame(
                general_data=general_data,
                frame_id=frame_id,
                frame_duration=frame_duration,
                voxels_dict=voxels_dict,
                voxels_list=voxels_list,
                light_emission_dict=light_emission_dict,
            )

            data_frames.append(data_frame)

    else:

        # Single-frame format: voxels at root level
        voxels_dict = None
        voxels_list = None

        if "voxels_dict" in json_dict:
            voxels_dict = parse_voxels_dict(json_dict["voxels_dict"], color_palette)

        if "voxels_list" in json_dict:
            voxels_list = parse_voxels_list(json_dict["voxels_list"], color_palette)

        # Parse light emission
        light_emission_dict = None

        if "light_emission_dict" in json_dict:

            light_emission_dict = {}

            for key, value in json_dict["light_emission_dict"].items():
                light_emission_dict[parse_vec3(key)] = parse_light_value(value)

        # Only create a frame if there's actual data
        if voxels_dict is not None or voxels_list is not None:

            data_frame = NaxelDataFrame(
                general_data=general_data,
                frame_id=0,
                frame_duration=1.0,
                voxels_dict=voxels_dict,
                voxels_list=voxels_list,
                light_emission_dict=light_emission_dict,
            )

            data_frames.append(data_frame)

    return data_frames


def load_naxel(json_dict: dict[str, Any]) -> Naxel:
    """
    Load a Naxel object from a JSON dictionary.
    """

    # --- Metadata ---
    name: str = json_dict.get("name", "")
    author: str | list[str] = json_dict.get("author", "")
    description: str = json_dict.get("description", "")
    date_created: str = json_dict.get("date_created", "")
    date_modified: str = json_dict.get("date_modified", "")
    tags: list[str] = json_dict.get("tags", [])
    license: str = json_dict.get("license", "")
    is_post_processed: bool = json_dict.get("is_post_processed", False)

    # --- General Data ---
    default_color: Color = parse_color(json_dict.get("default_color", [0, 0, 0, 255]))
    color_palette: ColorPalette = parse_color_palette(json_dict.get("color_palette", {}))
    grid_thickness: int = json_dict.get("grid_thickness", 0)
    grid_color: Color = parse_color(json_dict.get("grid_color", [0, 0, 0, 255]))

    general_data: NaxelGeneralData = NaxelGeneralData(
        default_color,
        color_palette,
        grid_thickness,
        grid_color,
    )

    # --- Camera Data ---
    camera_position: Vec3 = parse_vec3(json_dict.get("camera_position", [0, 0, 0]))
    camera_rotation: Vec3 = parse_vec3(json_dict.get("camera_rotation", [0, 0, 0]))
    camera_fov: float = json_dict.get("camera_fov", 70)
    camera_clip_start: float = json_dict.get("camera_clip_start", 0.001)
    camera_clip_end: float = json_dict.get("camera_clip_end", 100)
    locked_camera_movement: bool = json_dict.get("locked_camera_movement", False)
    locked_camera_rotation: bool = json_dict.get("locked_camera_rotation", False)

    camera_data: Camera = Camera(
        camera_position,
        camera_rotation,
        camera_fov,
        camera_clip_start,
        camera_clip_end,
        locked_camera_movement,
        locked_camera_rotation,
    )

    # --- Environment Data ---
    environment_type: str = json_dict.get("environment_type", "none")

    light_diffusion_strength: float = json_dict.get("light_diffusion_strength", 0.99)
    light_algorithm: str = json_dict.get("light_algorithm", "none")

    environment: Environment

    if environment_type == "color":

        environment_color: Color = parse_color(
            json_dict.get("environment_color", [255, 255, 255, 255])
        )
        environment_color_light_emission: LightValue = parse_light_value(
            json_dict.get("environment_color_light_emission", [1.0, 1.0, 1.0])
        )

        environment = EnvironmentColor(
            light_diffusion_strength=light_diffusion_strength,
            light_algorithm=light_algorithm,
            environment_color=environment_color,
            environment_color_light_emission=environment_color_light_emission
        )

    elif environment_type == "skybox":

        sky_color: Color = parse_color(
            json_dict.get("sky_color", [145, 200, 228, 255])
        )
        sky_color_light_emission: LightValue = parse_light_value(
            json_dict.get("sky_color_light_emission", [1.0, 1.0, 1.0])
        )
        ground_color: Color = parse_color(
            json_dict.get("ground_color", [32, 94, 97, 255])
        )
        ground_color_light_emission: LightValue = parse_light_value(
            json_dict.get("ground_color_light_emission", [1.0, 1.0, 1.0])
        )
        sun_direction: Vec3 = parse_vec3(
            json_dict.get("sun_direction", [0, 0, 0])
        )
        sun_light_emission: LightValue = parse_light_value(
            json_dict.get("sun_light_emission", [10, 10, 10])
        )

        environment = EnvironmentSkyBox(
            light_diffusion_strength=light_diffusion_strength,
            light_algorithm=light_algorithm,
            sky_color=sky_color,
            sky_color_light_emission=sky_color_light_emission,
            ground_color=ground_color,
            ground_color_light_emission=ground_color_light_emission,
            sun_direction=sun_direction,
            sun_light_emission=sun_light_emission,
        )

    else:

        environment = Environment(
            light_diffusion_strength=light_diffusion_strength,
            light_algorithm=light_algorithm
        )

    # --- Build Naxel ---
    naxel: Naxel = Naxel(

        # --- Metadata ---
        name=name,
        author=author,
        description=description,
        date_created=date_created,
        date_modified=date_modified,
        tags=tags,
        license=license,
        is_post_processed=is_post_processed,

        # --- General Data ---
        general_data=general_data,

        # --- Data Frames ---
        data_frames=load_dataframes(json_dict=json_dict, general_data=general_data),

        # --- Environment ---
        environment=environment,

        # --- Camera ---
        camera=camera_data,
    )

    return naxel




if __name__ == "__main__":

    parser: argparse.ArgumentParser = argparse.ArgumentParser(description="Rakuten Product Classification")

    parser.add_argument('--file', type=str, required=True, help="Path to Naxel file")

    args: argparse.Namespace = parser.parse_args()

    filepath: str = args.file

    if os.path.exists(filepath):

        with open(args.file, "r", encoding="utf-8") as f:

            json_dict: dict[str, Any] = json.load(f)

            naxel: Naxel = load_naxel(json_dict=json_dict)

            print(f"\n\nINPUT:\n\n")
            print(json.dumps(json_dict, indent=4))

            print(f"\n\nOUTPUT:\n\n")
            print(json.dumps(naxel.export_to_dict(), indent=4))
