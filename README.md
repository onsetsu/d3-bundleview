# Bundleview Visualization

![Simple example][generated bundleview]

## Introduction

Bundleviews are a visualization technique that uses an inverted radial layout to visualize hierarchical data (like software projects). In addition to the hierarchical data, relations between data entries are visualized using [hierarchical edge bundles][hierarchical edge bundles paper]. This allows to cluster dependencies along hierarchies, ultimately revealing higher-level dependencies:

![Varying bundle tension][varying bundletension]

Using the bundling strength, we can provide a trade-off between low-level and high-level insights based on adjacent relations. The bundling strength increases from left to right in the above example.

## Example

**See  and play with some [examples][gh-pages] (preferably in newer versions of Chrome).**

Using bundleviews we are able to interactively explore our data and thereby reveal interesting pattern. Here we take a look at the [flare visualization library][flare]:

![The flare visualization library as a bundleview][flare-physics-import]

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

Then, point your browser (preferably newer versions of Chrome) to the project's index page `http://localhost:8080/index.html`.

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

To visualize your data, adjust the existing `index.html` or write your own. There, import the visualization:
```js
import { Bundleview } from 'path-to-vis/lib/bundleview.js';
```

Then, call the visualization's constructor with your fetched data as well as the selector of a parent element:
```js
new Bundleview(dataJson, 'parent css selector');
```

## Contribute
If you are interested in contributing, first fork the repository into your userspace.

Then, clone the repo locally with initialized submodules:
```bash
git clone --recursive https://github.com/<USERNAME>/d3-bundleview.git
cd d3-bundleview
```

Then start a local http server, e.g. the included `serverNoCache.py`.

Start editing and create pull requests.

**Where do I start?**

To get yourself into complex projects, it makes sense to apply common techniques of reverse engineering:
Skim the most important files in a short period of time.
Start with some refactorings, even if you haven't fully understand the project.
That way you easily get a deeper understanding of what is going on and can make valuable contributions early on.

When you get stuck, do not hesitate to ask [questions][questions].

**Important files**:

- [index.js](./index.js): The main entrance point to the project. You build and configure your bundleview here. 
- [lib/bundleview.js](./lib/bundleview.js): The main library file that contains all the logic used to create the bundleview, including layouts, path generation, and interactions.
- [dbuggr.css](./dbuggr.css), [clusterview.css](./lib/clusterview.css): Style sheets that control the appearance of nodes and relations, mostly used to control highlighting.

**What contributions are valuable?**

Everthing including, but not limited to:
- Refactorings
- Further real world data sets
- Performance Optimizations
- Items on the [roadmap][section roadmap], preferably the top items

## Issues?
If you find a bug or have a feature request, please open an [issue][issues]. Or consider [contributing][section contribute] to the project.

## Roadmap
A collection of future work items prioritized by feasibility, with near future items first and more visionary items later. 

##### Data Validator

Check input data and provide meaningful warnings and error messages.

##### Deal with empty Directories

Right now, empty directories, i.e. nodes without an `attributes` and `children` field are not allowed. So, the following node would result in an error:

```js
{
  "id": 25,
  "label": "dir",
  "children": []
}
```

##### Dynamic Data

Dynamically add or remove nodes or relations in an existing bundleview.
Note, that each insertion or deletion affects several aspects of the visualization, including metric boundaries, and therefore potentially all color and size scales.

##### Attributes for relations

Same as nodes, relations could also be attributed, with varying appearance based on certain metrics.
```js
{
  "source":3,
  "target":34,
  "attributes": {
    "time": "2006-10-17",
    "type": "commit"
  }
}
```
According to these metrics, we can adjust the width and color(-gradient) of each node.

With this, we could for example visualize time-dependent interactions between hierarchical entities as in [the corresponding paper][Cornelissen, 2008]:

![Example usecase for attributes relations][roadmap relation attributes]





[section contribute]: ./README.md#contribute
[section roadmap]: ./README.md#roadmap

[hierarchical edge bundles paper]: http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.220.8113&rep=rep1&type=pdf "Holten's milestone paper"
[Cornelissen, 2008]: http://www.sciencedirect.com/science/article/pii/S0164121208000502 "Execution trace analysis through massive sequence and circular bundle views"

[questions]: https://github.com/onsetsu/d3-bundleview/issues
[issues]: https://github.com/onsetsu/d3-bundleview/issues

[flare]: http://flare.prefuse.org/
[varying bundletension]: ./example/varying-bundletension.png "Varying bundle tension reveals or hides"
[generated bundleview]: ./example/generated-bundleview.png "Showing some randomly generated data"
[gh-pages]: https://onsetsu.github.io/d3-bundleview "Go to the demo at gh-pages"
[flare-physics-import]: ./example/flare-physics-import.png "Physics components are only used by ForceDirectedLayout"
[roadmap relation attributes]: ./example/roadmap/relation-attributes.png "Visualizing sequences of interaction between hierarchical entities"
