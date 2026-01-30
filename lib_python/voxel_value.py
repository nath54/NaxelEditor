from typing import Any

from .pos import Pos
from .color import Color


class VoxelValue:

    def __init__(self) -> None:

        pass

    def export_to_dictable(self) -> Any | dict[str, Any]:

        return {}



class VoxelValueColor(VoxelValue):

    def __init__(
        self,
        color: Color
    ) -> None:

        super().__init__()

        self.color: Color = color

    def export_to_dictable(self) -> Any | dict[str, Any]:

        return self.color.export_to_lst()


class VoxelValueFromPalette(VoxelValue):

    def __init__(
        self,
        palette_key: str | int
    ) -> None:

        super().__init__()

        self.palette_key: str | int = palette_key

    def export_to_dictable(self) -> Any | dict[str, Any]:

        return self.palette_key


class VoxelValueImportVoxel(VoxelValue):

    def __init__(
        self,
        path: str,
        position: Pos
    ) -> None:

        super().__init__()

        self.path: str = path
        self.position: Pos = position

    def export_to_dictable(self) -> Any | dict[str, Any]:

        return {
            "type": "import_voxel",
            "path": self.path,
            "position": self.position.export_to_dict()
        }


class VoxelValueShape(VoxelValue):

    def __init__(
        self,
        color: Color,
        position: Pos,
    ) -> None:

        super().__init__()

        self.color: Color = color
        self.position: Pos = position

    def export_to_dictable(self) -> Any | dict[str, Any]:

        return {
            "type": "shape_",
            "color": self.color.export_to_lst(),
            "position": self.position.export_to_dict()
        }


class VoxelValueShapePoint(VoxelValueShape):

    def __init__(
        self,
        color: Color,
        position: Pos,
    ) -> None:

        super().__init__(color, position)

    def export_to_dictable(self) -> Any | dict[str, Any]:

        return {
            "type": "shape_point",
            "color": self.color.export_to_lst(),
            "position": self.position.export_to_dict()
        }


class VoxelValueShapeLine(VoxelValueShape):

    def __init__(
        self,
        color: Color,
        position: Pos,
        position2: Pos
    ) -> None:

        super().__init__(color, position)

        self.position2: Pos = position2

    def export_to_dictable(self) -> Any | dict[str, Any]:

        return {
            "type": "shape_line",
            "color": self.color.export_to_lst(),
            "position": self.position.export_to_dict(),
            "position2": self.position2.export_to_dict(),
        }


class VoxelValueShapeTriangle(VoxelValueShape):

    def __init__(
        self,
        color: Color,
        position: Pos,
        position2: Pos,
        position3: Pos,
    ) -> None:

        super().__init__(color, position)

        self.position2: Pos = position2
        self.position3: Pos = position3

    def export_to_dictable(self) -> Any | dict[str, Any]:

        return {
            "type": "shape_triangle",
            "color": self.color.export_to_lst(),
            "position": self.position.export_to_dict(),
            "position2": self.position2.export_to_dict(),
            "position3": self.position3.export_to_dict()
        }


class VoxelValueShapeCircle(VoxelValueShape):

    def __init__(
        self,
        color: Color,
        position: Pos,
        radius: int,
        axis: str
    ) -> None:

        super().__init__(color, position)

        self.radius: int = radius
        self.axis: str = axis

    def export_to_dictable(self) -> Any | dict[str, Any]:

        return {
            "type": "shape_circle",
            "color": self.color.export_to_lst(),
            "position": self.position.export_to_dict(),
            "radius": self.radius,
            "axis": self.axis
        }


class VoxelValueShapeCube(VoxelValueShape):

    def __init__(
        self,
        color: Color,
        position: Pos,
        size: int
    ) -> None:

        super().__init__(color, position)

        self.size: int = size

    def export_to_dictable(self) -> Any | dict[str, Any]:

        return {
            "type": "shape_cube",
            "color": self.color.export_to_lst(),
            "position": self.position.export_to_dict(),
            "size": self.size
        }


class VoxelValueShapeRect(VoxelValueShape):

    def __init__(
        self,
        color: Color,
        position: Pos,
        position2: Pos
    ) -> None:

        super().__init__(color, position)

        self.position2: Pos = position2

    def export_to_dictable(self) -> Any | dict[str, Any]:

        return {
            "type": "shape_rect",
            "color": self.color.export_to_lst(),
            "position": self.position.export_to_dict(),
            "position2": self.position2.export_to_dict()
        }


class VoxelValueShapeSphere(VoxelValueShape):

    def __init__(
        self,
        color: Color,
        position: Pos,
        radius: int
    ) -> None:

        super().__init__(color, position)

        self.radius: int = radius

    def export_to_dictable(self) -> Any | dict[str, Any]:

        return {
            "type": "shape_sphere",
            "color": self.color.export_to_lst(),
            "position": self.position.export_to_dict(),
            "radius": self.radius
        }


class VoxelValueShapeCylinder(VoxelValueShape):

    def __init__(
        self,
        color: Color,
        position: Pos,
        radius: int,
        height: int,
        axis: str
    ) -> None:

        super().__init__(color, position)

        self.radius: int = radius
        self.height: int = height
        self.axis: str = axis

    def export_to_dictable(self) -> Any | dict[str, Any]:

        return {
            "type": "shape_cylinder",
            "color": self.color.export_to_lst(),
            "position": self.position.export_to_dict(),
            "radius": self.radius,
            "height": self.height,
            "axis": self.axis
        }


class VoxelValueShapePolygon(VoxelValueShape):

    def __init__(
        self,
        color: Color,
        position: Pos,
        polygon: list[Pos]
    ) -> None:

        super().__init__(color, position)

        self.polygon: list[Pos] = polygon

    def export_to_dictable(self) -> Any | dict[str, Any]:

        return {
            "type": "shape_polygon",
            "color": self.color.export_to_lst(),
            "position": self.position.export_to_dict(),
            "polygon": [
                p.export_to_dict()
                for p in self.polygon
            ]
        }

