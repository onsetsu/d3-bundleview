# Bundleview Visualization
A d3 implementation of bundleviews (circular edge bundles)

... using [hierarchical edge bundles][hierarchical edge bundles paper] to cluster dependencies.

---

See some [examples][gh-pages] in action.

![alt text][flare-physics-import]

Our visualization reveals that any class in flare's *physics* module is only imported by the class *ForeDirectedLayout*.

## Installation

```bash
https://github.com/onsetsu/d3-bundleview.git

```
## Usage

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
- All non-leaf nodes have the `children` attribute, while leaf nodes have the `attributes` map instead.
- Relations only refer to the `id`s of leaf nodes as `source` and `target`.

```js
import { Bundleview } from 'path-to-submodule/lib/bundleview.js';
```

```js
new Bundleview(dataJson, 'parent css selector');
```

## How to hack?

## Issues?

## Roadmap
- ![alt text][roadmap relation attributes]

[hierarchical edge bundles paper]: http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.220.8113&rep=rep1&type=pdf

[gh-pages]: https://onsetsu.github.io/d3-bundleview "Go to the demo at gh-pages"
[flare-physics-import]: ./example/flare-physics-import.png "Physics components are only used by ForceDirectedLayout"
[roadmap relation attributes]: ./example/roadmap/relation-attributes.png "TODO"
