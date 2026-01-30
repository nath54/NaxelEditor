from .vec import Vec3


class Camera:

    def __init__(
        self,
        camera_position: Vec3 = Vec3(0, 0, 0),
        camera_rotation: Vec3 = Vec3(0, 0, 0),
        camera_fov: float = 70,
        camera_clip_start: float = 0.001,
        camera_clip_end: float = 100,
        locked_camera_movement: bool = False,
        locked_camera_rotation: bool = False,
    ) -> None:

        self.camera_position: Vec3 = camera_position
        self.camera_rotation: Vec3 = camera_rotation
        self.camera_fov: float = camera_fov
        self.camera_clip_start: float = camera_clip_start
        self.camera_clip_end: float = camera_clip_end
        self.locked_camera_movement: bool = locked_camera_movement
        self.locked_camera_rotation: bool = locked_camera_rotation

