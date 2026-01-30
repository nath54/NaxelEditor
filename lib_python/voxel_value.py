from .pos import Pos
from .color import Color


class VoxelValue:

    def __init__(self) -> None:

        pass


class VoxelValueColor(VoxelValue):

    def __init__(
        self,
        color: Color
    ) -> None:

        super().__init__()

        self.color: Color = color


class VoxelValueFromPalette(VoxelValue):

    def __init__(
        self,
        palette_key: str | int
    ) -> None:

        super().__init__()

        self.palette_key: str | int = palette_key


class VoxelValueImportVoxel(VoxelValue):

    def __init__(
        self,
        path: str,
        position: Pos
    ) -> None:

        super().__init__()

        self.path: str = path
        self.position: Pos = position


class VoxelValueShape(VoxelValue):

    def __init__(
        self,
        color: Color,
        position: Pos,
    ) -> None:

        super().__init__()

        self.position: Pos = position
        self.color: Color = color


class VoxelValueShapePoint(VoxelValueShape):

    def __init__(
        self,
        color: Color,
        position: Pos,
    ) -> None:

        super().__init__(color, position)


class VoxelValueShapeLine(VoxelValueShape):

    def __init__(
        self,
        color: Color,
        position: Pos,
        position2: Pos
    ) -> None:

        super().__init__(color, position)

        self.position2: Pos = position2


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


class VoxelValueShapeCube(VoxelValueShape):

    def __init__(
        self,
        color: Color,
        position: Pos,
        size: int
    ) -> None:

        super().__init__(color, position)

        self.size: int = size


class VoxelValueShapeRect(VoxelValueShape):

    def __init__(
        self,
        color: Color,
        position: Pos,
        position2: Pos
    ) -> None:

        super().__init__(color, position)

        self.position2: Pos = position2


class VoxelValueShapeSphere(VoxelValueShape):

    def __init__(
        self,
        color: Color,
        position: Pos,
        radius: int
    ) -> None:

        super().__init__(color, position)

        self.radius: int = radius


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


class VoxelValueShapePolygon(VoxelValueShape):

    def __init__(
        self,
        color: Color,
        position: Pos,
        polygon: list[Pos]
    ) -> None:

        super().__init__(color, position)

        self.polygon: list[Pos] = polygon

