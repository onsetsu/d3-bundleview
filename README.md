# Bundleview Visualization
A d3 implementation of bundleviews (circular edge bundles)

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
              "rloc": 162,
              "cyclomatic complexity": 4
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
- So all non-leaf nodes have the `children` attribute, while leaf nodes have the `attributes` map instead.
- Relations should only refer to the `id`s leaf nodes as `source` and `target`.
```js
import { Bundleview } from 'path-to-submodule/lib/bundleview.js';
```

```js
new Bundleview(dataJson, 'parent css selector');
```


[gh-pages]: https://onsetsu.github.io/d3-bundleview "Go to the demo at gh-pages"
[flare-physics-import]: ./example/flare-physics-import.png "Physics components are only used by ForceDirectedLayout"
