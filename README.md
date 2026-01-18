# NaxelEditor

## Introduction to the Naxel System

`Naxel` is a 3d voxel system that consists in a json file format that will have parts, including some pre-processing parts, that will allow a lot of expressivity to the voxel creation while keeping the naxel json files simple and small in size.

## Usage and inclusion

Currently, what is planned for this project is:

- A **python script** to render images or gifs from naxel objects
- A **static serverless website** to upload, visualize and edits naxel objects.
- A **javascript library** to have a dynamic naxel renderer in any webpage, designed to work with static serverless websites (like in github pages).

### More details to the javascript library

The `lib_naxel.js` and `lib_naxel.css` files will just have to be included in the html file, the naxel objects will have to be included as dictionary variables inside a javascript file.

A specific naxel object can be rendered via a function `render_naxel(naxel_object, html_node_id);`, or all naxel objects can be rendered via a function `render_all_naxels();`.

To indicate a naxel object in the html file, the html node will have to have a `data-naxel` attribute with the name of the variable that contains the naxel object.
