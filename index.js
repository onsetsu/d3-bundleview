import { Bundleview, isLeaf, randomLeaf } from './lib/bundleview.js';
import TreeGenerator, {BundleView} from './tree-generator/tree-generator.js';

// init it all
var generatedBundleview = new TreeGenerator(4, 50, 100)
    .createJSON();
d3.select('#bundleview-root')
    .attr("width", 700)
    .attr("height", 600);
var bundleview = new Bundleview(generatedBundleview, '#bundleview-root');
//bundleview.newSizeMetric(d => relative.Number);
//bundleview.newColorScale(d => d[attr].scale.to.absoluteColor);

// second bundleview
d3.json("example/flare-compat.json", function(error, root) {
    if (error) throw error;

    //attachIDs(root);
    new Bundleview(root, '#bundleview-root2');
});
