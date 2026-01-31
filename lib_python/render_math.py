import numpy as np
from numpy.typing import NDArray

from .vec import Vec3


class Vec3NP:

    def __init__(
        self,
        data: Vec3 | NDArray[np.float32]
    ) -> None:

        self.data: NDArray[np.float32]

        if isinstance(data, Vec3):
            self.data = np.array([data.x, data.y, data.z], dtype=np.float32)
        else:
            self.data = data


class RotationNP:

    def __init__(
        self,
        initial_rotation: Vec3
    ) -> None:

        self.rot_x_mat: NDArray[np.float32] = np.array(
            [
                [1, 0, 0],
                [0, np.cos(initial_rotation.x), -np.sin(initial_rotation.x)],
                [0, np.sin(initial_rotation.x), np.cos(initial_rotation.x)],
            ],
            dtype=np.float32
        )

        self.rot_y_mat: NDArray[np.float32] = np.array(
            [
                [np.cos(initial_rotation.y), 0, np.sin(initial_rotation.y)],
                [0, 1, 0],
                [-np.sin(initial_rotation.y), 0, np.cos(initial_rotation.y)],
            ],
            dtype=np.float32
        )

        self.rot_z_mat: NDArray[np.float32] = np.array(
            [
                [np.cos(initial_rotation.z), -np.sin(initial_rotation.z), 0],
                [np.sin(initial_rotation.z), np.cos(initial_rotation.z), 0],
                [0, 0, 1],
            ],
            dtype=np.float32
        )

        self.rot_mat: NDArray[np.float32] = self.rot_x_mat @ self.rot_y_mat @ self.rot_z_mat


