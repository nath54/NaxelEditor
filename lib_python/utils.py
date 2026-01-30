
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

