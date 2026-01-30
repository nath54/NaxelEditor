from typing import Optional, Any

import os
import json
import argparse

from .vec import Vec3
from .color import Color
from .color_palette import ColorPalette
from .voxel_value import VoxelValue, VoxelValueColor, VoxelValueFromPalette
from .light_value import LightValue
from .environment import Environment, EnvironmentColor, EnvironmentSkyBox
from .camera import Camera
from .naxel import Naxel, NaxelDataFrame, NaxelGeneralData


def load_dataframes(json_dict: dict[str, Any]) -> list[NaxelDataFrame]:


    return []


def load_naxel(json_dict: dict[str, Any]) -> Naxel:

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
    default_color: Color = json_dict.get("default_color", Color())
    color_palette: ColorPalette = json_dict.get("color_palette", ColorPalette(palette={}))
    grid_thickness: int = json_dict.get("grid_thickness", 0)
    grid_color: Color = json_dict.get("grid_color", Color())

    general_data: NaxelGeneralData = NaxelGeneralData(
        default_color,
        color_palette,
        grid_thickness,
        grid_color,
    )

    # --- Camera Data ---
    camera_position: Vec3 = json_dict.get("camera_position", Vec3(0, 0, 0))
    camera_rotation: Vec3 = json_dict.get("camera_rotation", Vec3(0, 0, 0))
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

        environment_color: Color = json_dict.get("environment_color", Color(255, 255, 255))
        environment_color_light_emission: LightValue = json_dict.get("environment_color_light_emission", LightValue())

        environment = EnvironmentColor(
            light_diffusion_strength=light_diffusion_strength,
            light_algorithm=light_algorithm,
            environment_color=environment_color,
            environment_color_light_emission=environment_color_light_emission
        )

    elif environment_type == "skybox":

        sky_color: Color = json_dict.get("sky_color", Color(145, 200, 228))
        sky_color_light_emission: LightValue = json_dict.get("sky_color_light_emission", LightValue())
        ground_color: Color = json_dict.get("ground_color", Color(32, 94, 97))
        ground_color_light_emission: LightValue = json_dict.get("ground_color_light_emission", LightValue())
        sun_direction: Vec3 = json_dict.get("sun_direction", Vec3(0, 0, 0))
        sun_light_emission: LightValue = json_dict.get("sun_light_emission", LightValue(10, 10, 10))

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

    #
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
        general_data = general_data,

        # --- Data Frames ---
        data_frames = load_dataframes(json_dict=json_dict),

        # --- Environment ---
        environment = environment,

        # --- Camera ---
        camera = camera_data,
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
