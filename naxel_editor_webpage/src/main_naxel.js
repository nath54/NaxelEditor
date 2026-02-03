
window.naxel_objects["main_naxel"] = {
    "name": "Naxel Triangle Example",
    "color_palette": {
        "white": [255, 255, 255],
        "red": [255, 0, 0],
        "green": [0, 255, 0],
        "blue": [0, 0, 255],
        "yellow": [255, 255, 0]
    },
    "voxels_dict": {
        "0,0,0": "red",
        "1,0,0": "red",
        "2,0,0": "red",
        "3,0,0": "green",
        "4,0,0": "green",
        "5,0,0": "blue",
        "0,1,0": "yellow",
        "1,1,0": "yellow",
        "2,1,0": "white",
        "0,0,1": "green",
        "1,0,1": "blue",
        "2,0,1": "red"
    },
    "voxels_list": [
        {
            "type": "shape_triangle",
            "position": [0, 0, 0],
            "position2": [10, 0, 0],
            "position3": [5, 0, 10],
            "color": [255, 255, 255]
        },
        {
            "type": "shape_line",
            "position": [0, 0, 0],
            "position2": [10, 0, 0],
            "color": [255, 0, 0]
        },
        {
            "type": "shape_line",
            "position": [10, 0, 0],
            "position2": [5, 0, 10],
            "color": [0, 255, 0]
        },
        {
            "type": "shape_line",
            "position": [5, 0, 10],
            "position2": [0, 0, 0],
            "color": [0, 0, 255]
        }
    ],
    "light_emission_dict": {
        "2,2,0": [1.0, 1.0, 0.8]
    },
    "environment_type": "color",
    "environment_color": [30, 30, 50, 0],
    "camera_position": [5, -10, 5],
    "camera_rotation": [0, 0, 0],
    "camera_focal": 20,
    "camera_clip_start": 0.1,
    "camera_clip_end": 100
};

window.naxel_objects["tmp_naxel"] = window.naxel_objects["main_naxel"];

//


