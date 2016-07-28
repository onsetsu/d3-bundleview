import { Bundleview } from './lib/bundleview.js';

function getRandomLinks(root, numberOfLinks) {
    var links = [];
    function randomLeaf(root) {
        if(!root.children) { return root; }

        var index = parseInt((Math.random() * root.children.length), 10);
        return randomLeaf(root.children[index]);
    }

    for(var i = 0; i < numberOfLinks; i++) {
        var source = randomLeaf(root),
            target = randomLeaf(root);

        if(source !== target) {
            links.push({
                source: source,
                target: target
            });
        }
    }

    return links;
}

// init it all
d3.json("example/flare.json", function(error, root) {
    if (error) throw error;

    new Bundleview(root, getRandomLinks(root, 30), '#bundleview-root');
    d3.json("example/flare.json", function(error, root) {
        if (error) throw error;

        new Bundleview(root, getRandomLinks(root, 30), '#bundleview-root2');
    });
});
