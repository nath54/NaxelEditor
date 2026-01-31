from .naxel import Naxel, NaxelDataFrame
from .naxel_loader import load_naxel
from .camera import Camera
from .color import Color
from .vec import Vec3
from .voxel_grid import VoxelGrid
from .ray_marcher import RayMarcher
from .environment_sampler import EnvironmentSampler
from .pixel_renderer import PixelRenderer

from typing import Optional, List

import argparse
import json
import os
import math

from PIL import Image

import numpy as np
from numpy.typing import NDArray


class RendererNaive:
    """
    Naive CPU-based voxel ray caster.
    Uses modular components for ray marching and pixel rendering.
    """

    def __init__(self, naxel: Naxel) -> None:

        self.naxel: Naxel = naxel

    def render_single_frame(
        self,
        frame_index: int = 0,
        camera_override: Optional[Camera] = None,
        image_save_path: Optional[str] = None,
    ) -> None:
        """
        Render a single frame of the naxel object.

        Args:
            frame_index: Index of the frame to render (for animations)
            camera_override: Optional camera to use instead of naxel's camera
            image_save_path: Optional path to save the image
        """

        # Select camera
        camera: Camera = self.naxel.camera

        if camera_override is not None:
            camera = camera_override

        # Get the frame data
        if len(self.naxel.data_frames) == 0:

            print("Warning: No data frames in naxel object")
            return

        frame: NaxelDataFrame = self.naxel.data_frames[
            min(frame_index, len(self.naxel.data_frames) - 1)
        ]

        # Build voxel grid from frame
        grid: VoxelGrid = VoxelGrid()
        grid.build_from_frame(frame, self.naxel.general_data)

        if grid.is_empty():

            print("Warning: No voxels in frame")

        # Create rendering components
        marcher: RayMarcher = RayMarcher(grid)
        env_sampler: EnvironmentSampler = EnvironmentSampler(self.naxel.environment)
        pixel_renderer: PixelRenderer = PixelRenderer(
            grid,
            marcher,
            env_sampler,
            camera
        )

        # Create image buffer (RGBA, uint8)
        image_data: NDArray[np.uint8] = np.zeros(
            (camera.camera_height, camera.camera_width, 4),
            dtype=np.uint8
        )

        # Render each pixel
        for y in range(camera.camera_height):

            for x in range(camera.camera_width):

                # Render pixel using the modular pixel renderer
                color: Color = pixel_renderer.render_pixel(x, y)

                # Write to image buffer
                image_data[y, x, 0] = max(0, min(255, color.r))
                image_data[y, x, 1] = max(0, min(255, color.g))
                image_data[y, x, 2] = max(0, min(255, color.b))
                image_data[y, x, 3] = max(0, min(255, color.a))

        # Create and save image
        image = Image.fromarray(image_data, mode='RGBA')

        save_path: str = f"{self.naxel.name}_{frame_index}.png"

        if image_save_path is not None:
            save_path = image_save_path

        image.save(save_path)

        print(f"Rendered frame saved to: {save_path}")

    def render_rotation_gif(
        self,
        frame_index: int = 0,
        num_frames: int = 36,
        gif_save_path: Optional[str] = None,
        distance_factor: float = 2.0,
        elevation_angle: float = 0.3,
        frame_duration_ms: int = 100,
    ) -> None:
        """
        Render a rotation animation around the voxel scene (Z axis rotation)
        with automatic center of mass calculation.

        Args:
            frame_index: Index of the naxel frame to render
            num_frames: Number of frames in the rotation (default: 36 = 10° per frame)
            gif_save_path: Optional path to save the GIF
            distance_factor: Multiplier for camera distance from center
            elevation_angle: Elevation angle in radians (how high above the scene)
            frame_duration_ms: Duration of each frame in milliseconds
        """

        # Get the frame data
        if len(self.naxel.data_frames) == 0:
            print("Warning: No data frames in naxel object")
            return

        frame: NaxelDataFrame = self.naxel.data_frames[
            min(frame_index, len(self.naxel.data_frames) - 1)
        ]

        # Build voxel grid from frame
        grid: VoxelGrid = VoxelGrid()
        grid.build_from_frame(frame, self.naxel.general_data)

        if grid.is_empty():
            print("Warning: No voxels in frame")
            return

        # Calculate center of mass and bounding box
        center, radius = self._calculate_scene_center_and_radius(grid)

        print(f"Scene center: ({center.x:.2f}, {center.y:.2f}, {center.z:.2f})")
        print(f"Scene radius: {radius:.2f}")

        # Calculate optimal camera distance based on scene radius and FOV
        # Ensure the entire scene fits in the view with some margin
        base_camera: Camera = self.naxel.camera
        fov_factor: float = 1.0 / math.tan(math.radians(35))  # ~35 degree FOV
        min_distance: float = radius * fov_factor * 1.5  # 1.5x margin

        camera_distance: float = max(min_distance, radius * distance_factor) + 2.0

        # Calculate elevation height (above the center Z by a fraction of radius)
        elevation_height: float = radius * math.sin(elevation_angle) + radius * 0.3

        # Create rendering components
        marcher: RayMarcher = RayMarcher(grid)
        env_sampler: EnvironmentSampler = EnvironmentSampler(self.naxel.environment)

        # Render each rotation frame
        frames: List[Image.Image] = []

        for i in range(num_frames):

            angle: float = (2.0 * math.pi * i) / num_frames

            # Calculate camera position orbiting around Z axis at center height + elevation
            cam_x: float = center.x + camera_distance * math.cos(angle)
            cam_y: float = center.y + camera_distance * math.sin(angle)
            cam_z: float = center.z + elevation_height

            # Calculate direction from camera to center
            look_dir_x: float = center.x - cam_x
            look_dir_y: float = center.y - cam_y
            look_dir_z: float = center.z - cam_z

            # Calculate horizontal distance for pitch calculation
            horizontal_dist: float = math.sqrt(look_dir_x**2 + look_dir_y**2)

            # Calculate rotation angles for look-at
            # Yaw: rotation around Z axis to face the center horizontally
            rot_z: float = math.atan2(look_dir_y, look_dir_x) - math.pi / 2

            # Pitch: rotation around X axis to tilt down towards center
            rot_x: float = -math.atan2(look_dir_z, horizontal_dist)

            # Calculate optimal focal length to fit the scene
            # Focal relates to how "zoomed in" the view is
            optimal_focal: float = max(
                base_camera.camera_focal,
                camera_distance * 0.5
            )

            # Create camera looking at center
            camera: Camera = Camera(
                camera_position=Vec3(cam_x, cam_y, cam_z),
                camera_rotation=Vec3(rot_x, 0, rot_z),
                camera_focal=optimal_focal,
                camera_clip_start=0.1,
                camera_clip_end=camera_distance * 3,
                camera_width=base_camera.camera_width,
                camera_height=base_camera.camera_height,
                camera_pixel_size=base_camera.camera_pixel_size,
            )

            # Create pixel renderer for this camera position
            pixel_renderer: PixelRenderer = PixelRenderer(
                grid,
                marcher,
                env_sampler,
                camera
            )

            # Create image buffer
            image_data: NDArray[np.uint8] = np.zeros(
                (camera.camera_height, camera.camera_width, 4),
                dtype=np.uint8
            )

            # Render each pixel
            for y in range(camera.camera_height):
                for x in range(camera.camera_width):
                    color: Color = pixel_renderer.render_pixel(x, y)
                    image_data[y, x, 0] = max(0, min(255, color.r))
                    image_data[y, x, 1] = max(0, min(255, color.g))
                    image_data[y, x, 2] = max(0, min(255, color.b))
                    image_data[y, x, 3] = max(0, min(255, color.a))

            frame_image = Image.fromarray(image_data, mode='RGBA')
            frames.append(frame_image)

            print(f"Rendered frame {i + 1}/{num_frames}")

        # Save as GIF
        save_path: str = f"{self.naxel.name}_rotation.gif"

        if gif_save_path is not None:
            save_path = gif_save_path

        frames[0].save(
            save_path,
            save_all=True,
            append_images=frames[1:],
            duration=frame_duration_ms,
            loop=0
        )

        print(f"Rotation GIF saved to: {save_path}")

    def _calculate_scene_center_and_radius(
        self,
        grid: VoxelGrid
    ) -> tuple[Vec3, float]:
        """
        Calculate the center of mass and bounding radius of the voxel scene.

        Args:
            grid: The voxel grid

        Returns:
            Tuple of (center Vec3, radius float)
        """

        bounds_min, bounds_max = grid.get_bounds()

        # Calculate center of bounding box
        center_x: float = (float(bounds_min.x) + float(bounds_max.x)) / 2.0
        center_y: float = (float(bounds_min.y) + float(bounds_max.y)) / 2.0
        center_z: float = (float(bounds_min.z) + float(bounds_max.z)) / 2.0

        center: Vec3 = Vec3(center_x, center_y, center_z)

        # Calculate radius (half diagonal of bounding box)
        dx: float = float(bounds_max.x) - float(bounds_min.x)
        dy: float = float(bounds_max.y) - float(bounds_min.y)
        dz: float = float(bounds_max.z) - float(bounds_min.z)

        radius: float = math.sqrt(dx**2 + dy**2 + dz**2) / 2.0

        return center, radius


if __name__ == "__main__":

    parser = argparse.ArgumentParser(
        description="Render a naxel object to an image"
    )

    parser.add_argument(
        "--file",
        type=str,
        help="Path to naxel JSON file"
    )

    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Output image path"
    )

    parser.add_argument(
        "--frame",
        type=int,
        default=0,
        help="Frame index to render (for animations)"
    )

    parser.add_argument(
        "--rotate_around_object",
        action="store_true",
        help="Rotate camera around object and generate a GIF"
    )

    args = parser.parse_args()

    # Load naxel from JSON file
    if not os.path.exists(args.file):
        print(f"Error: File not found: {args.file}")
        exit(1)

    with open(args.file, "r", encoding="utf-8") as f:
        json_dict = json.load(f)

    naxel = load_naxel(json_dict)

    renderer = RendererNaive(naxel)

    if args.rotate_around_object:

        renderer.render_rotation_gif(
            frame_index=args.frame,
            gif_save_path=args.output
        )

    else:

        renderer.render_single_frame(
            frame_index=args.frame,
            image_save_path=args.output
        )
