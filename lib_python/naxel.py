from typing import Optional, Any

from .vec import Vec3
from .color import Color
from .color_palette import ColorPalette
from .voxel_value import VoxelValue, VoxelValueColor, VoxelValueFromPalette
from .light_value import LightValue
from .environment import Environment
from .camera import Camera
from .utils_dicts import merge_dicts


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
        light_value_list: Optional[list[tuple[Vec3, LightValue]]] = None,
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
        self.light_value_list: Optional[list[tuple[Vec3, LightValue]]] = light_value_list
        self.light_value_grid: Optional[list[list[list[LightValue]]]] = light_value_grid

    def export_to_dict(self, as_a_frame: bool = False) -> dict[str, Any]:

        dict_res: dict[str, Any] = {}

        if as_a_frame:
            dict_res["frame_id"] = self.frame_id
            dict_res["frame_duration"] = self.frame_duration

        if self.voxels_dict is not None:
            dict_res["voxels_dict"] = {
                k.export_to_str(): v.export_to_dictable()
                for k, v in self.voxels_dict.items()
            }

        if self.voxels_list is not None:
            dict_res["voxels_list"] = [
                v.export_to_dictable()
                for v in self.voxels_list
                if not isinstance(v, VoxelValueColor) and not isinstance(v, VoxelValueFromPalette)
            ]

        if self.voxels_grid is not None:

            dict_res["voxels_list"] = []

            for grid_level in self.voxels_grid:

                for grid_level2 in grid_level:

                    for v in grid_level2:

                        if not isinstance(v, VoxelValueColor) and not isinstance(v, VoxelValueFromPalette):
                            v.export_to_dictable()

        if self.light_emission_dict is not None:
            dict_res["light_emission_dict"] = {
                k.export_to_str(): v.export_to_lst()
                for k, v in self.light_emission_dict.items()
            }

        if self.light_emission_items is not None:
            dict_res["light_emission_items"] = [
                (k.export_to_str(), v.export_to_lst())
                for k, v in self.light_emission_items
            ]

        if self.light_value_dict is not None:
            dict_res["light_value_dict"] = {
                k.export_to_str(): v.export_to_lst()
                for k, v in self.light_value_dict.items()
            }

        if self.light_value_list is not None:
            dict_res["light_value_items"] = [
                (k.export_to_str(), v.export_to_lst())
                for k, v in self.light_value_list
            ]

        if self.light_value_grid is not None:

            dict_res["light_value_grid"] = []

            for grid_level in self.light_value_grid:

                for grid_level2 in grid_level:

                    for v in grid_level2:

                        v.export_to_lst()

        return dict_res


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

    def export_to_dict(self) -> dict[str, Any]:

        res: dict[str, Any] = {
            # --- Metadata ---
            "name": self.name,
            "author": self.author,
            "description": self.description,
            "date_created": self.date_created,
            "date_modified": self.date_modified,
            "tags": self.tags,
            "license": self.license,
            "is_post_processed": self.is_post_processed,

            # --- General Data ---
            "default_color": self.general_data.default_color.export_to_lst(),
            "color_palette": self.general_data.color_palette.export_to_dict(),
            "grid_thickness": self.general_data.grid_thickness,
            "grid_color": self.general_data.grid_color.export_to_lst(),
        }

        if len(self.data_frames) == 0:

            pass

        elif len(self.data_frames) == 1:

            res = merge_dicts(
                res,
                self.data_frames[0].export_to_dict()
            )

        else:

            res = merge_dicts(
                res,
                {
                    "frames": [
                        df.export_to_dict(True)
                        for df in self.data_frames
                    ]
                }
            )

        res = merge_dicts(
            res,
            self.environment.export_to_dict()
        )

        res = merge_dicts(
            res,
            self.camera.export_to_dict()
        )

        return res

