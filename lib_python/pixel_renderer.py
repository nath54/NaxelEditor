from .vec import Vec3
from .color import Color
from .camera import Camera
from .ray import Ray
from .hit_result import HitResult
from .voxel_grid import VoxelGrid
from .ray_marcher import RayMarcher
from .environment_sampler import EnvironmentSampler
from .render_math import RotationNP, Vec3NP


class PixelRenderer:
    """
    Modularized pixel rendering function.
    Encapsulates the per-pixel rendering logic to prepare for
    future optimized versions (GPU, SIMD, etc.).
    """

    def __init__(
        self,
        grid: VoxelGrid,
        marcher: RayMarcher,
        env_sampler: EnvironmentSampler,
        camera: Camera
    ) -> None:

        self.grid: VoxelGrid = grid
        self.marcher: RayMarcher = marcher
        self.env_sampler: EnvironmentSampler = env_sampler
        self.camera: Camera = camera

        # Pre-compute camera transforms
        self._c_world: Vec3NP = Vec3NP(camera.camera_position)

        self._cr: RotationNP = RotationNP(camera.camera_rotation)

        # Focal point in camera space: (0, -focal, 0)
        f_cam: Vec3NP = Vec3NP(Vec3(0, -camera.camera_focal, 0))

        # Focal point in world space
        self._f_world: Vec3NP = Vec3NP(
            self._c_world.data + self._cr.rot_mat @ f_cam.data
        )

    def render_pixel(
        self,
        x: int,
        y: int
    ) -> Color:
        """
        Render a single pixel at the given image coordinates.

        Args:
            x: Pixel X coordinate (0 to width-1)
            y: Pixel Y coordinate (0 to height-1)

        Returns:
            Color: The rendered color for this pixel
        """

        # Create ray for this pixel
        ray: Ray = self._create_ray(x, y)

        # March through voxel grid
        hit: HitResult = self.marcher.march(
            ray,
            self.camera.camera_clip_start,
            self.camera.camera_clip_end
        )

        if hit.hit and hit.color is not None:

            return hit.color

        else:

            # Sample environment for background
            return self.env_sampler.sample(ray)

    def _create_ray(
        self,
        x: int,
        y: int
    ) -> Ray:
        """
        Create a ray for the given pixel coordinates.

        Args:
            x: Pixel X coordinate
            y: Pixel Y coordinate

        Returns:
            Ray: The ray for this pixel
        """

        # Pixel position in camera space
        # Center the pixel grid around the camera
        pixel_cam: Vec3NP = Vec3NP(Vec3(
            (x - self.camera.camera_width / 2) * self.camera.camera_pixel_size,
            0,
            (y - self.camera.camera_height / 2) * self.camera.camera_pixel_size
        ))

        # Transform pixel position to world space
        pixel_world: Vec3NP = Vec3NP(
            self._c_world.data + self._cr.rot_mat @ pixel_cam.data
        )

        # Create ray from focal point through pixel position
        return Ray.create_from_points(self._f_world, pixel_world)

