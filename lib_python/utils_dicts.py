from typing import Any


def merge_dicts(
    dict_a: dict[str, Any],
    dict_b: dict[str, Any],
) -> dict[str, Any]:

    dict_res: dict[str, Any] = dict_a

    for k, v in dict_b.items():

        dict_res[k] = v

    return dict_res

