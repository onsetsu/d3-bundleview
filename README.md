# Bundleview Visualization

![Simple example][generated bundleview]

## Introduction

Bundleviews are a visualization technique that uses an inverted radial layout to visualize hierarchical data (like software projects). In addition to the hierarchical data, relations between data entries are visualized using [hierarchical edge bundles][hierarchical edge bundles paper]. This allows to cluster dependencies along hierarchies, ultimately revealing higher-level dependencies:

![alt text][varying bundletension]

Using the bundling strength, we can provide a trade-off between low-level and high-level insights based on adjacent relations. The bundling strength increases from left to right in the above example.

## Example

See some [examples][gh-pages] in action.

![alt text][flare-physics-import]

In the above example, the visualization reveals that any class in flare's *physics* module is only imported by the class *ForeDirectedLayout*.

## Installation
If you just want to use the visualization, read the following instructions. If you instead want to contribute, see [here][section contribute].

Clone the repository and init the contained submodules:
```bash
git clone --recursive https://github.com/onsetsu/d3-bundleview.git
cd d3-bundleview
```

Next, start a local http server, e.g. if you still have Python 2.7:
```bash
serverNoCache.py
```

Then, point your browser (preferably newer versions of Chrome) to the project's index page: `http://localhost:8080/index.html`

## Usage

To visualize your own data sets, they have to be in a certain *json* format. Here is a simplified example:

```js
{
  "nodes": {
    "id": 0,
    "label": "",
    "children": [
      // some nesting level later
        {
          "id": 3,
          "label": "app.js",
          "attributes": {
            "rloc": 162,
            "cyclomatic complexity": 4
          }
        },
      // ...
          {
            "id": 34,
            "label": "lib.js",
            "attributes": {
              "rloc": 367,
              "cyclomatic complexity": 16
            }
          },
      // ...
    ]
  },
  "relations":[
    {
      "source":3,
      "target":34
    },
    // ...
  ]
}
```
**Notes:**
- The json root has only two fields: `nodes` and `relations`.
- `nodes` describe the hierarchical tree structre used to create the outer radial layout.
  - All nodes have to have a unique `id` and optionally can have a `label` displayed in the visualization.
  - All non-leaf nodes have the `children` attribute, while leaf nodes have the `attributes` map instead.
    - `attributes` contain a map from a nemed metric to a number or a string. Each attribute must be present in each leaf node.
- `relations` describe the inner bundle layout.
  - Relations only refer to the `id`s of leaf nodes as `source` and `target`.

To visualize your data, adjust the existent `index.html` or write your own. There, import the visualization:
```js
import { Bundleview } from 'path-to-vis/lib/bundleview.js';
```

Then, call the visualization's constructor with your fetched data as well as the selector of a parent element:
```js
new Bundleview(dataJson, 'parent css selector');
```

## Contribute
Fork, clone, init subs, create pull requests

## Issues?
If you find a bug or have a feature request, please open an [issue][issues]. Or consider [contributing][section contribute] to the project.

## Roadmap
- Data Validator: Check input data and provide meaningful warnings and error messages.
- ![alt text][roadmap relation attributes]



[hierarchical edge bundles paper]: http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.220.8113&rep=rep1&type=pdf

[section contribute]: ./readme.md#contribute
[issues]: https://github.com/onsetsu/d3-bundleview/issues
[varying bundletension]: ./example/varying-bundletension.png "Varying bundle tension reveals or hides"
[generated bundleview]: ./example/generated-bundleview.png "Showing some randomly generated data"
[gh-pages]: https://onsetsu.github.io/d3-bundleview "Go to the demo at gh-pages"
[flare-physics-import]: ./example/flare-physics-import.png "Physics components are only used by ForceDirectedLayout"
[roadmap relation attributes]: ./example/roadmap/relation-attributes.png "TODO"
