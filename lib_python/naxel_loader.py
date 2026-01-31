from typing import Optional, Any, cast

import os
import json
import argparse

from .vec import Vec3, parse_vec3
from .color import Color
from .color_palette import ColorPalette, parse_color, parse_color_palette
from .voxel_value import VoxelValue
from .light_value import LightValue, parse_light_value
from .environment import Environment, EnvironmentColor, EnvironmentSkyBox
from .camera import Camera
from .naxel import Naxel, NaxelDataFrame, NaxelGeneralData
from .parse_voxels import parse_voxels_dict, parse_voxels_list



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

        for idx, frame_data in enumerate(cast(Any, json_dict["frames"])):

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
    camera_focal: float = json_dict.get("camera_focal", 70)
    camera_clip_start: float = json_dict.get("camera_clip_start", 0.001)
    camera_clip_end: float = json_dict.get("camera_clip_end", 100)
    locked_camera_movement: bool = json_dict.get("locked_camera_movement", False)
    locked_camera_rotation: bool = json_dict.get("locked_camera_rotation", False)
    camera_width: int = json_dict.get("camera_width", 32)
    camera_height: int = json_dict.get("camera_height", 32)
    camera_pixel_size: float = json_dict.get("camera_pixel_size", 0.1)

    camera_data: Camera = Camera(
        camera_position,
        camera_rotation,
        camera_focal,
        camera_clip_start,
        camera_clip_end,
        locked_camera_movement,
        locked_camera_rotation,
        camera_width,
        camera_height,
        camera_pixel_size,
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
