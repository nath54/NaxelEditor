# NaxelEditor

## Introduction to the Naxel System

`Naxel` is a 3d voxel system that consists in a json file format that will have parts, including some pre-processing parts, that will allow a lot of expressivity to the voxel creation while keeping the naxel json files simple and small in size.

## Usage and inclusion

Currently, what is planned for this project is:

- A **python script** to render images or gifs from naxel objects
- A **static serverless website** to upload, visualize and edits naxel objects.
- A **javascript library** to have a dynamic naxel renderer in any webpage, designed to work with static serverless websites (like in github pages).

### More details to the javascript library

The `lib_naxel.js` and `lib_naxel.css` files will just have to be included in the html file.

The naxel objects will be contained in the global variable `window.naxel_objects` (`dict[str, NaxelObject]`). The key of the dictionary is the *simulated* path of the naxel object.

A specific naxel object can be rendered via a function `render_naxel(naxel_object, html_node_id);`, or all naxel objects can be rendered via a function `render_all_naxels();`.

To indicate a naxel object in the html file, the html node will have to have a `data-naxel` attribute with the simulated path of the naxel object.

## JSON Fields of a Naxel Object

A Naxel Object is a json object that has the following fields:

### Metadata

- `"name"` (`str`): Name of the naxel object.
- `"author"` (Optional, `str`, `list[str]`, Default: `[]`): The name of the author(s) of the naxel object.
- `"description"` (Optional, `str`, Default: `""`): A description of the naxel object if the author(s) want to describe it.
- `"date_created"` (Optional, `str`, Default: `""`): The date of creation of the naxel object.
- `"date_modified"` (Optional, `str`, Default: `""`): The date of last modification of the naxel object.
- `"tags"` (Optional, `list[str]`, Default: `[]`): Tags that can be useful for referencing the naxel object in a collection of naxel objects.
- `"license"` (Optional, `str`, Default: `""`): The license of the naxel object.

### Position type

The `pos` type can be represented either as:
* A tuple of 3 integers: `(x, y, z)`
* A dictionary with the keys `x`, `y`, `z` and optional `shift`, `scale`, `rotation`, `flip`, `crop`.
* A list of 3 integers: `[x, y, z]`
* A string in the formats `"x,y,z"`, `"x y z"`, `"x-y-z"`, `"x_y_z"`, `"x.y.z"`

### Color Type

The type `cl` represents a color, it can be either `str`, `int` or `tuple[int, int, int]`, or a dictionary.
* If the value is `str`: It is either a color name or a hex color code.
* If the value is `int`: It is a grayscale color.
* If the value is `tuple[int, int, int]`: It is an rgb color.
* If the value is `tuple[int, int, int, int]`: It is an rgba color.
* If the value is a dictionary, **none of its sub-color types can either be a dictionary**, and it must have a key `type` with the values:
    * `"gradient_lst"`: It is a gradient color, and the colors and positions are in 2 separated lists.
        * `"colors"` (Required, `list[cl]`): The colors of the gradient.
        * `"positions"` (Optional, `list[pos]`, Default: `None`): The positions of the colors in the gradient.
        * `"interpolation"` (Optional, `str`, Default: `"linear"`): The interpolation of the gradient, it can be `"linear"` or `"cubic"`.
    * `"gradient_dict"`: It is a gradient color, and the colors and positions are in a dictionary.
        * `"colors"` (Required, `dict[pos, cl]`): The key are the position and the value is the color.
        * `"interpolation"` (Optional, `str`, Default: `"linear"`): The interpolation of the gradient, it can be `"linear"` or `"cubic"`.
    * `"gradient_items"`: It is a list of tuples, where the first value is the position and the second value is the color.
        * `"colors"` (Required, `list[tuple[pos, cl]]`): The tuples of (position, color)
        * `"interpolation"` (Optional, `str`, Default: `"linear"`): The interpolation of the gradient, it can be `"linear"` or `"cubic"`.
    * `"color_zones"`: A list of rectangle zones that each have its own color.
        * `"default_color"` (Optional, `cl`, Default: `"#000000"`): The default color if no zone is found. If different zones overlap, the first one in the list will be used.
        * `"zones"` (Required, `list[dict[str, Any]]`): The list of zones.
        * `"zones[i].color"` (Required, `cl`): The color of the zone.
        * `"zones[i].positions"` (Required, `tuple[pos, pos]`): The positions of the zone (corner 1 and corner 2).

The color values `int`, `tuple[int, int, int]` and `tuple[int, int, int, int]` are in the range [0, 255]. If any value is out of range, it will be clamped to the range.

### Voxel Value Type

The type `voxel_value` represents a voxel value, it can be represented in various formats, the engine will look at the types in the following order:
* If the value is `str`:
    * The engine will look at an entry in the `color_palette` with the same key.
    * If the key is not found, the engine will use the default color.
* If the value is `int`:
    * The engine will look at an entry in the `color_palette` with the same key.
    * If the key is not found, it will be interpreted as a grayscale color.
* If the value is `cl`: It is directly that color.
* If the value is `dict[str, Any]`: If called from `voxel_dict`, `position` key will be ignored, else it is **required**. There are different options, however, to have a valid value, the dictionary must have a key `type` with the values:
    * `"import_voxel"`: Imports a voxel from a file.
        * `"path"` (Required, `str`): The path to the voxel file.
        * `"position"` (Required if not from `voxel_dict`, `pos`): The position of the voxel.
    * `"shape_point"`: Creates a point voxel.
        * `"position"` (Required if not from `voxel_dict`, `pos`): The position of the point.
        * `"color"` (Required, `cl`): The color of the point.
    * `"shape_line"`: Creates a line voxel.
        * `"position"` (Required if not from `voxel_dict`, `pos`): The position of the first point of the line.
        * `"position2"` (Required, `pos`): The second point of the line.
        * `"color"` (Required, `cl`): The color of the line.
    * `"shape_triangle"`: Creates a triangle voxel.
        * `"position"` (Required if not from `voxel_dict`, `pos`): The position of the first point of the triangle.
        * `"position2"` (Required, `pos`): The second point of the triangle.
        * `"position3"` (Required, `pos`): The third point of the triangle.
        * `"color"` (Required, `cl`): The color of the triangle.
    * `"shape_circle"`: Creates a circle voxel.
        * `"position"` (Required if not from `voxel_dict`, `pos`): The position of the center of the circle.
        * `axis` (Required, `str`, Example: `"xy"`): The axis of the circle, it can be `"xy"`, `"xz"` or `"yz"`.
        * `"radius"` (Required, `int`): The radius of the circle.
        * `"color"` (Required, `cl`): The color of the circle.
    * `"shape_cube"`: Creates a cube voxel.
        * `"position"` (Required if not from `voxel_dict`, `pos`): The position of the corner of the cube.
        * `"size"` (Required, `int`): The size of the cube.
        * `"color"` (Required, `cl`): The color of the cube.
    * `"shape_rect"`: Creates a 3d rectangle voxel.
        * `"position"` (Required if not from `voxel_dict`, `pos`): The position of the corner of the rectangle.
        * `"position2"` (Required, `pos`): The opposite corner of the rectangle.
        * `"color"` (Required, `cl`): The color of the rectangle.
    * `"shape_sphere"`: Creates a sphere voxel.
        * `"position"` (Required if not from `voxel_dict`, `pos`): The position of the center of the sphere.
        * `"radius"` (Required, `int`): The radius of the sphere.
        * `"color"` (Required, `cl`): The color of the sphere.
    * `"shape_cylinder"`: Creates a cylinder voxel.
        * `"position"` (Required if not from `voxel_dict`, `pos`): The position of the center of the cylinder.
        * `axis` (Required, `str`, Example: `"xy"`): The axis of the cylinder, it can be `"xy"`, `"xz"` or `"yz"`.
        * `"radius"` (Required, `int`): The radius of the cylinder.
        * `"height"` (Required, `int`): The height of the cylinder.
        * `"color"` (Required, `cl`): The color of the cylinder.
    * `"polygon"`: Creates a polygon voxel.
        * `"position"` (Required if not from `voxel_dict`, `pos`): The position of the first point of the polygon.
        * `"polygon"` (Required, `list[pos]`): The vertices of the polygon. The polygon is not automatically closed, so you need to add the last point to the first point to close it if you want that.
        * `"color"` (Required, `cl`): The color of the polygon.

*Note: If multiple voxels are placed at the same coordinates, the last one will be the one that is rendered.*

### Data

#### General

- `"default_color"` (Optional, `cl`, Default: `"#000000"`): The default color of the naxel object.
- `"color_palette"` (`dict[str | int, cl]`, Default: `{}`): The color palette of the naxel object.

#### Non-animated Naxel Object

If it is not an animated naxel object, it can have the following:

##### Voxels

- `"voxels_dict"` (`dict[str, voxel_value]`, Default: `{}`): The voxels of the naxel object, the keys are the coordinates of the voxels in a supported format.
- `"voxels_list"` (`list[voxel_value]`, Default: `[]`): The voxels of the naxel object, the values are the voxels.
- `"voxels_grid"` (`list[list[list[voxel_value]]]`, Default: `[]`): The voxels of the naxel object, the values are the voxels. (Not recommended)

##### Light Emission

- `"light_emission_dict"` (`dict[pos, tuple[float, float, float]]`, Default: `{}`): The key is the coordinates of the **non-pre-processed** voxel object (so a single voxel, or a shape / more complex object of type `voxel_value`). The value is the light emission of the voxel object.
- `"light_emission_items"` (`list[tuple[pos, tuple[float, float, float]]]`, Default: `[]`): Under the tuple items format, the first value is the position of the voxel object, and the second value is the light emission of the voxel object.

##### Light Value

By default, any object that doesn't have a specific light value will have a light value of `1`.

This is the **post-processed** light value, meaning it is the light value of the single voxel after all the light emission objects have been processed.
The post-processing will override any light value set manually.

- `"light_value_dict"` (`dict[pos, tuple[float, float, float]]`, Default: `{}`): The key is the coordinates of the **post-processed** single voxel. The value is the post processed light color value. Between `0` and `1`.
- `"light_value_items"` (`list[tuple[pos, tuple[float, float, float]]]`, Default: `[]`): Under the tuple items format, the first value is the position of the post processed single voxel, and the second value is the post processed light color value. Between `0` and `1`.
- `"light_value_grid"` (`list[list[list[tuple[float, float, float]]]]`, Default: `[]`): The values are the post processed light color values. Between `0` and `1`.

#### Animated Naxel Object

If it is an animated naxel object, it will have the following:

- `"frames"` (`list[dict[str, Any]]`, Default: `[]`): The frames of the naxel object.
- `"frames[i].duration"` (Optional, `float`, Default: `1`): The duration of the frame, in seconds.
- `"frames[i].___` Any of the non-animated naxel object properties for the current frame.

### Environment Details, Color / Skybox

- `"light_diffusion_strength"` (Optional, `float`, Default: `1`): The strength of the light diffusion. The higher this value is, more the light will spread across the naxel object.
- `"environment_type"` (Optional, `str`, Default: `"color"`): The type of environment, it can be `"color"` or `"skybox"`.
- `"light_algorithm"` (Optional, `str`, Default: `"none"`): The algorithm to use for the scene light. See the section **[Light Algorithms](#light-algorithms)**.

If the environment type is `"color"`, the environment will be a solid color and must have the fields:
- `"environment_color"` (Required, `cl`): The color of the environment.
- `"environment_color_light_emission"` (Optional, `float`, Default: `1`): The light emission of the environment.

If the environment type is `"skybox"`, the environment will be a skybox and must have the fields:

- `"sky_color"` (Required, `cl`): The color of the skybox.
- `"sky_color_light_emission"` (Optional, `float`, Default: `0.1`): The light emission of the skybox.
- `"ground_color"` (Required, `cl`): The color of the ground.
- `"ground_color_light_emission"` (Optional, `float`, Default: `0`): The light emission of the ground.
- `"sun_direction"` (Optional, `tuple[float, float, float]`, Default: `(0, -1, 0)`): The direction of the sun.
- `"sun_light_emission"` (Optional, `float`, Default: `1`): The light emission of the sun.

### Camera

- `"camera_position"` (Optional, `pos`, Default: `(0, 0, 0)`): The initial position of the camera.
- `"camera_rotation"` (Optional, `tuple[float, float, float]`, Default: `(0, 0, 0)`): The initial rotation of the camera.
- `"camera_fov"` (Optional, `int`, Default: `70`): The field of view of the camera.
- `"camera_clip_start"` (Optional, `float`, Default: `0.1`): The near clip plane of the camera.
- `"camera_clip_end"` (Optional, `float`, Default: `100`): The far clip plane of the camera.
- `"locked_camera_movement"` (Optional, `bool`, Default: `False`): Whether the camera movement is locked.
- `"locked_camera_rotation"` (Optional, `bool`, Default: `False`): Whether the camera rotation is locked.

## Data JSON Fields of a Post-processed Naxel Object

- One of each following lists (the most optimized in term of speed and space depending on the naxel object data) per frame:
    * `"voxels_dict"`, `"voxels_list"`, `"voxels_grid"`
    * `"light_value_dict"`, `"light_value_items"`, `"light_value_grid"`

## Pre-processing Details

Before rendering the naxel object has to be pre-processed.

It can then be cached to speed up the rendering process.

## Light Algorithms

**Light** act as a **multiplier for the voxel color**. A light value of *(1, 1, 1)* means the voxel will be rendered as is, while a light value of *(0, 0, 0)* means the voxel will be rendered as black. But a light value of *(1, 0.5, 0) *means the voxel will be rendered with full red, half the green light and no blue light.

Light value is **additive**, meaning that if two light sources are affecting the same voxel, their light values will be added together.

Here are the details about the light algorithms planned to work with the naxel object.

### None - `none`

No light algorithm will be used, the light will be rendered as is.

### Simple diffusion - `simple_diffusion`

- Initialize an Unordered Multi Lane Queue that we simply call "queue" here for the sake of simplicity.
- A *marked* matrix is created for the naxel object.
- The light matrix is initialized to *(0, 0, 0)* for all the voxels.
- We add to the queue with all the light sources voxels.
- The environment "sky" is also considered as a light source:
    - If the environment is a color, a skybox sphere is calculated with the environment color.
    - If the environment is a skybox, a skybox sphere is calculated with the correct sun position for the light source.
    - For compute efficiency the skybox is calculated to be the smallest sphere that contains the entire naxel object.
- To all the light sources will be assigned an id modulo 64 (the marked matrix will be typed as *int64*).
- Now, while there are voxels in the queue:
    - Pop one voxel from the queue.
    - Check if the voxel is marked by the current light id (`mark_value & (1 << current_light_id) != 0`).
    - If it is marked, stop here, else continue.
    - Mark the voxel with the current light id (`mark_value |= (1 << current_light_id)`).
    - Add the light value to the current voxel light value.
    - For each neighbor of the current voxel: *(see the definition of neighbor just below)*
        - If the neighbor is not marked by the current light id (`mark_value & (1 << current_light_id) == 0`):
            - Add the neighbor to the queue with `new light value = current voxel light value * light diffusion strength`.


A neighbor is designated as:

- If the source is an empty voxel or transparent voxel, its neighbors are the 6 voxels that share a face with it.
- If the source is a non empty voxel, it has no neighbors.
