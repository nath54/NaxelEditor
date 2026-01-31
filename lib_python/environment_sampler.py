from .color import Color
from .ray import Ray
from .environment import Environment, EnvironmentColor, EnvironmentSkyBox


class EnvironmentSampler:
    """
    Samples background color based on environment settings.
    Returns the appropriate color when a ray misses all voxels.
    """

    def __init__(
        self,
        environment: Environment
    ) -> None:

        self.environment: Environment = environment

    def sample(
        self,
        ray: Ray
    ) -> Color:
        """
        Sample the environment color for a given ray direction.

        Args:
            ray: The ray that missed all voxels

        Returns:
            Color: The background color for this ray direction
        """

        if isinstance(self.environment, EnvironmentColor):

            return self.environment.environment_color

        elif isinstance(self.environment, EnvironmentSkyBox):

            # Use ray direction Y component to blend sky and ground
            direction_y: float = float(ray.direction.data[1])

            if direction_y > 0:

                # Looking up - sky color
                return self.environment.sky_color

            else:

                # Looking down - ground color
                return self.environment.ground_color

        else:

            # Default environment - return black transparent
            return Color(0, 0, 0, 0)

