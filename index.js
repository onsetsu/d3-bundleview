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

// init it all
d3.json("example/flare-compat.json", function(error, root) {
    if (error) throw error;

    d3.select('#bundleview-root')
        .attr("width", 700)
        .attr("height", 600);
    attachIDs(root);
    new Bundleview({
        nodes: root,
        relations: getRandomLinks(root, 1)
    }, '#bundleview-root');

    d3.json("example/flare-compat.json", function(error, root) {
        if (error) throw error;

        attachIDs(root);
        new Bundleview({
            nodes: root,
            relations: getRandomLinks(root, 1)
        }, '#bundleview-root2');
    });

});
