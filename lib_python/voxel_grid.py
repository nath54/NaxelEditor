from typing import Optional, Any
import math

from .vec import Vec3
from .color import Color
from .color_palette import ColorPalette
from .naxel import NaxelDataFrame, NaxelGeneralData
from .voxel_value import (
    VoxelValue,
    VoxelValueColor,
    VoxelValueFromPalette,
    VoxelValueShape,
    VoxelValueShapePoint,
    VoxelValueShapeLine,
    VoxelValueShapeCube,
    VoxelValueShapeRect,
    VoxelValueShapeSphere,
)


class VoxelGrid:
    """
    Efficient voxel storage with AABB bounds for ray marching optimization.
    Converts various voxel representations (dict, list, grid) into a unified
    sparse dictionary format.
    """

    def __init__(self) -> None:

        self._voxels: dict[tuple[int, int, int], Color] = {}
        self._min_bounds: Vec3 = Vec3(0, 0, 0)
        self._max_bounds: Vec3 = Vec3(0, 0, 0)
        self._is_empty: bool = True

    def get_voxel(
        self,
        x: int,
        y: int,
        z: int
    ) -> Optional[Color]:
        """
        Get the color of a voxel at the given integer coordinates.

        Args:
            x: X coordinate
            y: Y coordinate
            z: Z coordinate

        Returns:
            Color if voxel exists at position, None otherwise
        """

        return self._voxels.get((x, y, z), None)

    def set_voxel(
        self,
        x: int,
        y: int,
        z: int,
        color: Color
    ) -> None:
        """
        Set a voxel at the given integer coordinates.

        Args:
            x: X coordinate
            y: Y coordinate
            z: Z coordinate
            color: Color of the voxel
        """

        self._voxels[(x, y, z)] = color

        self._update_bounds(x, y, z)

    def _update_bounds(
        self,
        x: int,
        y: int,
        z: int
    ) -> None:
        """
        Update the AABB bounds to include the given position.
        """

        if self._is_empty:

            self._min_bounds = Vec3(x, y, z)
            self._max_bounds = Vec3(x + 1, y + 1, z + 1)
            self._is_empty = False

        else:

            self._min_bounds = Vec3(
                min(self._min_bounds.x, x),
                min(self._min_bounds.y, y),
                min(self._min_bounds.z, z)
            )

            self._max_bounds = Vec3(
                max(self._max_bounds.x, x + 1),
                max(self._max_bounds.y, y + 1),
                max(self._max_bounds.z, z + 1)
            )

    def get_bounds(self) -> tuple[Vec3, Vec3]:
        """
        Get the axis-aligned bounding box of all voxels.

        Returns:
            Tuple of (min_corner, max_corner) Vec3
        """

        return (self._min_bounds, self._max_bounds)

    def is_empty(self) -> bool:
        """
        Check if the grid contains any voxels.

        Returns:
            True if no voxels, False otherwise
        """

        return self._is_empty

    def export_to_dict(self) -> dict[str, list[int]]:
        """
        Export the processed voxel grid as a dictionary.

        Returns:
            Dictionary where keys are position strings "x,y,z" and values are RGBA color lists
        """

        return {
            f"{x},{y},{z}": color.export_to_lst()
            for (x, y, z), color in self._voxels.items()
        }

    def build_from_frame(
        self,
        frame: NaxelDataFrame,
        general_data: NaxelGeneralData
    ) -> None:
        """
        Build the voxel grid from a NaxelDataFrame.
        Processes voxels_dict, voxels_list, and voxels_grid.

        Args:
            frame: The data frame containing voxel data
            general_data: General data containing color palette
        """

        palette: ColorPalette = general_data.color_palette
        default_color: Color = general_data.default_color

        # Process voxels_dict
        if frame.voxels_dict is not None:

            for pos, voxel_value in frame.voxels_dict.items():

                color: Color = self._resolve_voxel_color(
                    voxel_value,
                    palette,
                    default_color
                )

                self.set_voxel(int(pos.x), int(pos.y), int(pos.z), color)

        # Process voxels_list
        if frame.voxels_list is not None:

            for voxel_value in frame.voxels_list:

                self._rasterize_voxel_value(
                    voxel_value,
                    palette,
                    default_color
                )

        # Process voxels_grid
        if frame.voxels_grid is not None:

            for z, layer in enumerate(frame.voxels_grid):

                for y, row in enumerate(layer):

                    for x, voxel_value in enumerate(row):

                        color = self._resolve_voxel_color(
                            voxel_value,
                            palette,
                            default_color
                        )

                        self.set_voxel(x, y, z, color)

    def _resolve_voxel_color(
        self,
        voxel_value: VoxelValue,
        palette: ColorPalette,
        default_color: Color
    ) -> Color:
        """
        Resolve a VoxelValue to a Color.

        Args:
            voxel_value: The voxel value to resolve
            palette: Color palette for palette references
            default_color: Default color if resolution fails

        Returns:
            The resolved Color
        """

        if isinstance(voxel_value, VoxelValueColor):
            return voxel_value.color

        if isinstance(voxel_value, VoxelValueFromPalette):

            palette_color: Optional[Color] = palette.get_color(
                voxel_value.palette_key
            )

            if palette_color is not None:
                return palette_color

            return default_color

        if isinstance(voxel_value, VoxelValueShape):
            return voxel_value.color

        return default_color

    def _rasterize_voxel_value(
        self,
        voxel_value: VoxelValue,
        palette: ColorPalette,
        default_color: Color
    ) -> None:
        """
        Rasterize a VoxelValue (potentially a shape) into discrete voxels.

        Args:
            voxel_value: The voxel value to rasterize
            palette: Color palette for palette references
            default_color: Default color if resolution fails
        """

        if isinstance(voxel_value, VoxelValueShapePoint):

            pos = voxel_value.position.xyz
            color = voxel_value.color

            self.set_voxel(int(pos.x), int(pos.y), int(pos.z), color)

        elif isinstance(voxel_value, VoxelValueShapeCube):

            pos = voxel_value.position.xyz
            size = voxel_value.size
            color = voxel_value.color

            for dx in range(size):
                for dy in range(size):
                    for dz in range(size):

                        self.set_voxel(
                            int(pos.x) + dx,
                            int(pos.y) + dy,
                            int(pos.z) + dz,
                            color
                        )

        elif isinstance(voxel_value, VoxelValueShapeRect):

            pos1 = voxel_value.position.xyz
            pos2 = voxel_value.position2.xyz
            color = voxel_value.color

            x_min = int(min(pos1.x, pos2.x))
            x_max = int(max(pos1.x, pos2.x))
            y_min = int(min(pos1.y, pos2.y))
            y_max = int(max(pos1.y, pos2.y))
            z_min = int(min(pos1.z, pos2.z))
            z_max = int(max(pos1.z, pos2.z))

            for x in range(x_min, x_max + 1):
                for y in range(y_min, y_max + 1):
                    for z in range(z_min, z_max + 1):

                        self.set_voxel(x, y, z, color)

        elif isinstance(voxel_value, VoxelValueShapeSphere):

            center = voxel_value.position.xyz
            radius = voxel_value.radius
            color = voxel_value.color

            cx, cy, cz = int(center.x), int(center.y), int(center.z)

            for dx in range(-radius, radius + 1):
                for dy in range(-radius, radius + 1):
                    for dz in range(-radius, radius + 1):

                        dist_sq = dx * dx + dy * dy + dz * dz

                        if dist_sq <= radius * radius:

                            self.set_voxel(cx + dx, cy + dy, cz + dz, color)

        elif isinstance(voxel_value, VoxelValueShapeLine):

            pos1 = voxel_value.position.xyz
            pos2 = voxel_value.position2.xyz
            color = voxel_value.color

            self._rasterize_line(
                int(pos1.x), int(pos1.y), int(pos1.z),
                int(pos2.x), int(pos2.y), int(pos2.z),
                color
            )

    def _rasterize_line(
        self,
        x0: int,
        y0: int,
        z0: int,
        x1: int,
        y1: int,
        z1: int,
        color: Color
    ) -> None:
        """
        Rasterize a 3D line using Bresenham's algorithm.
        """

        dx = abs(x1 - x0)
        dy = abs(y1 - y0)
        dz = abs(z1 - z0)

        sx = 1 if x0 < x1 else -1
        sy = 1 if y0 < y1 else -1
        sz = 1 if z0 < z1 else -1

        dm = max(dx, dy, dz)

        x, y, z = x0, y0, z0

        self.set_voxel(x, y, z, color)

        if dm == 0:
            return

        x_inc = dx / dm
        y_inc = dy / dm
        z_inc = dz / dm

        x_acc = 0.0
        y_acc = 0.0
        z_acc = 0.0

        for _ in range(dm):

            x_acc += x_inc
            y_acc += y_inc
            z_acc += z_inc

            if x_acc >= 0.5:
                x += sx
                x_acc -= 1.0

            if y_acc >= 0.5:
                y += sy
                y_acc -= 1.0

            if z_acc >= 0.5:
                z += sz
                z_acc -= 1.0

            self.set_voxel(x, y, z, color)

