from typing import Any

from color import Color
from light_value import LightValue

from .vec import Vec3


class Environment:

    def __init__(
        self,
        light_diffusion_strength: float = 0.99,
        light_algorithm: str = "none",
    ) -> None:

        self.light_diffusion_strength: float = light_diffusion_strength
        self.light_algorithm: str = light_algorithm

    def export_to_dict(self) -> dict[str, Any]:

        return {
            "environment_type": "none",
            "light_diffusion_strength": self.light_diffusion_strength,
            "light_algorithm": self.light_algorithm,
        }


class EnvironmentColor(Environment):

    def __init__(
        self,
        light_diffusion_strength: float = 0.99,
        light_algorithm: str = "none",
        environment_color: Color = Color(255, 255, 255),
        environment_color_light_emission: LightValue = LightValue(),
    ) -> None:

        super().__init__(
            light_diffusion_strength,
            light_algorithm
        )

        self.environment_color: Color = environment_color
        self.environment_color_light_emission: LightValue = environment_color_light_emission

    def export_to_dict(self) -> dict[str, Any]:

        return {
            "environment_type": "color",
            "light_diffusion_strength": self.light_diffusion_strength,
            "light_algorithm": self.light_algorithm,
            "environment_color": self.environment_color,
            "environment_color_light_emission": self.environment_color_light_emission,
        }


class EnvironmentSkyBox(Environment):

    def __init__(
        self,
        light_diffusion_strength: float = 0.99,
        light_algorithm: str = "none",
        sky_color: Color = Color(145, 200, 228),
        sky_color_light_emission: LightValue = LightValue(),
        ground_color: Color = Color(32, 94, 97),
        ground_color_light_emission: LightValue = LightValue(),
        sun_direction: Vec3 = Vec3(0, 0, 0),
        sun_light_emission: LightValue = LightValue(10, 10, 10)
    ) -> None:

        super().__init__(
            light_diffusion_strength,
            light_algorithm
        )

        self.sky_color: Color = sky_color
        self.sky_color_light_emission: LightValue = sky_color_light_emission
        self.ground_color: Color = ground_color
        self.ground_color_light_emission: LightValue = ground_color_light_emission
        self.sun_direction: Vec3 = sun_direction
        self.sun_light_emission: LightValue = sun_light_emission

    def export_to_dict(self) -> dict[str, Any]:

        return {
            "environment_type": "skybox",
            "light_diffusion_strength": self.light_diffusion_strength,
            "light_algorithm": self.light_algorithm,
            "sky_color": self.sky_color,
            "sky_color_light_emission": self.sky_color_light_emission,
            "ground_color": self.ground_color,
            "ground_color_light_emission": self.ground_color_light_emission,
            "sun_direction": self.sun_direction,
            "sun_light_emission": self.sun_light_emission,
        }
