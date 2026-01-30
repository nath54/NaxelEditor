
def clamp(
    value: int,
    min_value: int,
    max_value: int
) -> int:

    if value < min_value:
        return min_value
    elif value > max_value:
        return max_value

    return value


def between(
    value: int | float,
    side_1: int | float,
    side_2: int | float,
) -> bool:

    if side_2 < side_1:

        return value >= side_2 and value <= side_1

    return value >= side_1 and value <= side_2
