import { Bundleview, isLeaf, randomLeaf } from './lib/bundleview.js';
import TreeGenerator from './tree-generator/tree-generator.js';

// randomly generated bundleview
var generatedBundleview = new TreeGenerator(4, 50, 100).createJSON();
var bundleview = new Bundleview(generatedBundleview, '#bundleview-root');

// second bundleview
d3.json("example/flare-compat.json", function(error, root) {
    if (error) throw error;

    new Bundleview(root, '#bundleview-root2');
});
