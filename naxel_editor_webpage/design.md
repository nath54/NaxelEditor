# Design of the webpage - Naxel Editor

The Editor Webpage will be composed of multiple subpages with a global menu.

I also have in idea that we can just use it easily on smartphone too. So the design should be oriented smartphone first (portrait mode).

The subpages will be:

## (A) Main Editing subpage

The main editing subpage will include:

### (A.1) A global viewer with camera control

The viewer will be a canvas inside a div that adapts to the camera width and height.

It will be possible to explore / move the camera in the viewport without changing the camera position and rotation in the Naxel Json file.

The camera controls will be in a div below the camera viewer.

The camera viewer will be efficient, it will update only it there is a camera movement or a frame change.

The frame changement will not be automatic by default there will be an option to activate the animation or to stop it.

### (A.2) A Palette Color Menu

There will be a menu to manage the palette color.

The palette is a dictionnary with key -> values, the key being str or int values.

The palette menu will allow to create a new item, to change the key or the value.

The key will be class input text menu, but to specify between the str or int, to be a string, you will have to have the `"` characters between your key text explicitly.

The color value will be a input color picker from vanilla html.

### (A.3) A 2d grid to edit the voxels.

The grid will be a slice of the 3d voxel grid.

There will be a small visualizer to indicate where the slice is and how it is rotated. I think there will be always an indication in the visualizer to indicate where is the origin and the direction of the X, Y, Z axes.

There will be navigation buttons to update the slice position and rotation.

### (A.4) Environment & Lights section

Environment & Lights section

### (A.5) Metadata Editor

A small editor part where you can edit the metadata of the current loaded naxel object (name, author, description, ...).

## (B) A renderer to see what will look like the final result

The second subpage will just be a renderer to see what is the final result.

If it is an animated scene it will just be the animation looping.

## (C) A json import / export text viewer

This third subpage will just be a text viewer with a few buttons for json export from the core scene, import this json into the core scene, download it directly in json, or import it from a file in your computer.
