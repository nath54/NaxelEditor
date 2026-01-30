from typing import Optional

from .vec import Vec3
from .color import Color
from .color_palette import ColorPalette
from .voxel_value import VoxelValue
from .light_value import LightValue
from .environment import Environment
from .camera import Camera


class NaxelGeneralData:

    def __init__(
        self,
        default_color: Color = Color(),
        color_palette: ColorPalette = ColorPalette(palette={}),
        grid_thickness: int = 0,
        grid_color: Color = Color(),
    ) -> None:

        self.default_color: Color = default_color
        self.color_palette: ColorPalette = color_palette
        self.grid_thickness: int = grid_thickness
        self.grid_color: Color = grid_color


class NaxelDataFrame:

    def __init__(
        self,

        # --- Reference to General Data ---
        general_data: NaxelGeneralData,

        # --- Frame ID & Timing ---
        frame_id: int,
        frame_duration: float,

        # --- Voxels ---
        voxels_dict: Optional[dict[Vec3, VoxelValue]] = None,
        voxels_list: Optional[list[VoxelValue]] = None,
        voxels_grid: Optional[list[list[list[VoxelValue]]]] = None,

        # -- Light Emission --
        light_emission_dict: Optional[dict[Vec3, LightValue]] = None,
        light_emission_items: Optional[list[tuple[Vec3, LightValue]]] = None,

        # -- Light Value --
        light_value_dict: Optional[dict[Vec3, LightValue]] = None,
        light_value_list: Optional[list[LightValue]] = None,
        light_value_grid: Optional[list[list[list[LightValue]]]] = None,

    ) -> None:

        # --- Reference to General Data ---
        self.general_data: NaxelGeneralData = general_data

        # --- Frame ID & Timing ---
        self.frame_id: int = frame_id
        self.frame_duration: float = frame_duration

        # --- Voxels ---
        self.voxels_dict: Optional[dict[Vec3, VoxelValue]] = voxels_dict
        self.voxels_list: Optional[list[VoxelValue]] = voxels_list
        self.voxels_grid: Optional[list[list[list[VoxelValue]]]] = voxels_grid

        # -- Light Emission --
        self.light_emission_dict: Optional[dict[Vec3, LightValue]] = light_emission_dict
        self.light_emission_items: Optional[list[tuple[Vec3, LightValue]]] = light_emission_items

        # -- Light Value --
        self.light_value_dict: Optional[dict[Vec3, LightValue]] = light_value_dict
        self.light_value_list: Optional[list[LightValue]] = light_value_list
        self.light_value_grid: Optional[list[list[list[LightValue]]]] = light_value_grid


class Naxel:

    def __init__(
        self,

        # --- Metadata ---
        name: str,
        author: str | list[str] = "",
        description: str = "",
        date_created: str = "",
        date_modified: str = "",
        tags: list[str] = [],
        license: str = "",
        is_post_processed: bool = False,

        # --- General Data ---
        general_data: NaxelGeneralData = NaxelGeneralData(),

        # --- Data Frames ---
        data_frames: list[NaxelDataFrame] = [],

        # --- Environment ---
        environment: Environment = Environment(),

        # --- Camera ---
        camera: Camera = Camera(),

    ) -> None:

        # --- Metadata ---
        self.name: str = name
        self.author: str | list[str] = author
        self.description: str = description
        self.date_created: str = date_created
        self.date_modified: str = date_modified
        self.tags: list[str] = tags
        self.license: str = license
        self.is_post_processed: bool = is_post_processed

        # --- General Data ---
        self.general_data: NaxelGeneralData = general_data

        # --- Data Frame ---
        self.data_frames: list[NaxelDataFrame] = data_frames

        # --- Environment ---
        self.environment: Environment = environment

        # --- Camera ---
        self.camera: Camera = camera

