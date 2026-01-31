from typing import Any

from .vec import Vec3


class Camera:

    def __init__(
        self,
        camera_position: Vec3 = Vec3(0, 0, 0),
        camera_rotation: Vec3 = Vec3(0, 0, 0),
        camera_focal: float = 70,
        camera_clip_start: float = 0.001,
        camera_clip_end: float = 100,
        locked_camera_movement: bool = False,
        locked_camera_rotation: bool = False,
        camera_width: int = 64,
        camera_height: int = 64,
        camera_pixel_size: float = 0.4,
    ) -> None:

        self.camera_position: Vec3 = camera_position
        self.camera_rotation: Vec3 = camera_rotation
        self.camera_focal: float = camera_focal
        self.camera_clip_start: float = camera_clip_start
        self.camera_clip_end: float = camera_clip_end
        self.locked_camera_movement: bool = locked_camera_movement
        self.locked_camera_rotation: bool = locked_camera_rotation
        self.camera_width: int = camera_width
        self.camera_height: int = camera_height
        self.camera_pixel_size: float = camera_pixel_size

    def export_to_dict(self) -> dict[str, Any]:

        return {
            "camera_position": self.camera_position.export_to_str(),
            "camera_rotation": self.camera_rotation.export_to_str(),
            "camera_focal": self.camera_focal,
            "camera_clip_start": self.camera_clip_start,
            "camera_clip_end": self.camera_clip_end,
            "locked_camera_movement": self.locked_camera_movement,
            "locked_camera_rotation": self.locked_camera_rotation,
            "camera_width": self.camera_width,
            "camera_height": self.camera_height,
            "camera_pixel_size": self.camera_pixel_size,
        }
