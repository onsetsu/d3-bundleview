import { Bundleview, isLeaf, randomLeaf } from './lib/bundleview.js';



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
    function getRandomLinks(root, numberOfLinks) {
        var links = [];

        for(var i = 0; i < numberOfLinks; i++) {
            var source = randomLeaf(root),
                target = randomLeaf(root);

            if(source !== target) {
                links.push({
                    source: source.id,
                    target: target.id
                });
            }
        }

        return links;
    }

    function attachIDs(root) {
        var id = 0;
        function attachIDThenIterate(node) {
            node.id = id++;
            node.children && node.children.forEach(attachIDThenIterate);
        }
        attachIDThenIterate(root);
    }

    if (error) throw error;

    attachIDs(root);
    new Bundleview({
        nodes: root,
        relations: getRandomLinks(root, 1)
    }, '#bundleview-root2');
});
