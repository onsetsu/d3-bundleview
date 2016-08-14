export function isLeaf(d) { return !d.children || d.children.length === 0; }

const DEFAULT_COLOR_LEAF_NODE = "#6666af";
const DEFAULT_COLOR_DIRECTORY = "#999999";

const COLOR_NODE_HOVERED = 'steelblue';
const COLOR_NODE_descendant = '#dfd89d';
const COLOR_NODE_ancestor = '#efe8ad';
const COLOR_NODE_target = '#d62728';
const COLOR_NODE_source = '#2ca02c';

var bundleviewCount = 0;

export function walkTree(root, beforeChildren = ()=>{}, afterChildren = ()=>{}) {
    beforeChildren(root);
    if(root.children) {
        root.children.forEach((child, i) => {
            walkTree(child, beforeChildren, afterChildren);
        })
    }
    afterChildren(root);
}

export function randomLeaf(root) {
    if(isLeaf(root)) { return root; }

    var index = parseInt((Math.random() * root.children.length), 10);
    return randomLeaf(root.children[index]);
}

export class Bundleview {
    static get zoomTransitionTime() { return 1000; }
    static get sizeMetricTransitionTime() { return 1500; }
    preprocessData(root, links) {
        this.nodesByID = new Map();
        walkTree(root, node => {
            this.nodesByID.set(node.id, node);
        });
        links.forEach(link => {
            link.source = this.nodesByID.get(link.source);
            link.target = this.nodesByID.get(link.target);
        });
        return [root, links];
    }
    constructor(input, selector) {
        var bundleviewID = bundleviewCount++;
        // Declarations
        var innerRadius = 0.65,
            bundleTension = 0.85;

        // Stuff that does something

        var [root, links] = this.preprocessData(input.nodes, input.relations);
        console.log('init bundleview with', root, links);

        var width = 700,
            height = 600,
            radius = Math.min(width, height) / 2;
        //var color = d3.scale.category20c();

        var rootContainer = d3.select(selector);
        var realSVG = rootContainer.append("svg");

        // gradient as reference for hierarchical edge bundles
        var defs = realSVG.append('defs');
        var gradient = defs.append('linearGradient')
            .attr("id", 'bundleview-gradient');
        gradient.append('stop').attr('stop-color', '#2ca02c');
        gradient.append('stop')
            .attr('stop-color', '#d62728')
            .attr('offset', '100%');

        var svg = realSVG
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        const DEFAULT_IDENTIFIER = 'default';

        function getSizeMetricsFor(node) {
            var leaf = randomLeaf(node);
            var metrics = { [DEFAULT_IDENTIFIER]: () => 1 };
            Object.keys(leaf.attributes).forEach(attributeName => {
                if(Number.isFinite(leaf.attributes[attributeName])) {
                    metrics[attributeName] = d => d.attributes[attributeName];
                    walkTree(root, node => {
                        if(!isLeaf(node)) { return; }
                    });
                }
            });
            return metrics;
        }

        var sizeMetrics = getSizeMetricsFor(root);
        let currentSizeMetric = sizeMetrics[DEFAULT_IDENTIFIER];

        function sizeMetricChanged(value) {
            currentSizeMetric = value;
            var newlyLayoutedData = partition.value(value).nodes;
            path
                .data(newlyLayoutedData)
                .transition()
                .duration(Bundleview.sizeMetricTransitionTime)
                .attrTween("d", arcTween)
                .call(colorStyleTween, "fill", n => styleNodeWith(n, lockedNode, currentColorMetric));

            hiddenLineSegment
                .data(newlyLayoutedData)
                .transition()
                .duration(Bundleview.sizeMetricTransitionTime)
                .attrTween("d", hiddenArcTween);

            link
                .transition()
                .duration(Bundleview.sizeMetricTransitionTime)
                .attrTween("d", lineTween);
        }
        this.sizeMetricChanged = sizeMetricChanged;

        let sizeMetricSelection = rootContainer.append("form");
        sizeMetricSelection
            .html('Size Metric: ');
        sizeMetricSelection.selectAll('label')
            .html('Metrics')
            .data(Object.keys(sizeMetrics))
            .enter()
            .append('label')
            .html(d => d)
            .append('input')
            .attr("type", 'radio')
            .attr('name', 'mode')
            .attr('value', d => d)
            .property('checked', (d, i) => d === DEFAULT_IDENTIFIER)
            .on('change', function() {
                sizeMetricChanged(sizeMetrics[this.value]);
            });

        function getColorMetricsFor(node) {
            var leaf = randomLeaf(node);
            var metrics = { [DEFAULT_IDENTIFIER]: d => isLeaf(d) ?
                DEFAULT_COLOR_LEAF_NODE :
                DEFAULT_COLOR_DIRECTORY
            };
            Object.keys(leaf.attributes).forEach(attributeName => {
                var useLinearColorScale = Number.isFinite(leaf.attributes[attributeName]);
                if(useLinearColorScale) {
                    let maxValue = Number.NEGATIVE_INFINITY,
                        minValue = Number.POSITIVE_INFINITY;
                    walkTree(root, node => {
                        if(isLeaf(node)) {
                            maxValue = Math.max(maxValue, node.attributes[attributeName]);
                            minValue = Math.min(minValue, node.attributes[attributeName]);
                        }
                    });

                    let linearColorScale = d3.scale.linear()
                        .domain([minValue, (minValue + maxValue) / 2, maxValue])
                        .range(["red", "white", "green"])
                        .range(["#001e5e", "#f56f72", "#fffef5"]) // darkblue to yellow
                        .interpolate(d3.interpolateLab);

                    let violetToYellowColors = [ // pale violet over blue and green to yellow
                        "#6F3E4F","#74455B","#764D67","#785573","#775E7F","#74678A",
                        "#707194","#6A7B9E","#6385A6","#5A8FAC","#5098B1","#47A2B4",
                        "#3EACB5","#3AB5B4","#3BBEB2","#42C7AD","#4FCFA8","#60D7A1",
                        "#72DE99","#87E591","#9CEB89","#B3F180","#CBF579","#E3FA73"
                    ];
                    let violetToYellowDomain = violetToYellowColors.map((color, index) =>
                        minValue + (maxValue - minValue) * index/(violetToYellowColors.length-1)
                    );

                    linearColorScale = d3.scale.linear()
                        .domain(violetToYellowDomain)
                        .range(violetToYellowColors)
                        .interpolate(d3.interpolateHcl);

                    linearColorScale = d3.scale.linear()
                        .domain([minValue, maxValue])
                        .range(["#ff7637", "#00a238"])
                        .range(["#ffffe5", "#0073a5"])
                        .range(["#0042a1", "#fffef5"]) // darkblue to yellow
                        .range(["#3a2265", "#ffffd3"]) // darkblue to yellow v2
                        .range(["#005083", "#ffffe3"]) // greenish blue to yellow
                        //.range(["#800026", "#ffffcc"]) // red to yellow
                        //.range(["#ffe48e", "#b60026"]) // yellow to red (higher saturation)
                        //.range(["#533F57", "#E7FC74"]) // dark violet to yellow
                        .interpolate(d3.interpolateHcl);

                    metrics[attributeName] = d => {
                        if(isLeaf(d)) {
                            return linearColorScale(d.attributes[attributeName])
                        }
                        function accumulateSize(n) {
                            if(isLeaf(n)) {
                                return currentSizeMetric(n);
                            }
                            return n.children.reduce((acc, child) => acc + accumulateSize(child), 0);
                        }
                        function accumulateColor(n) {
                            if(isLeaf(n)) {
                                return n.attributes[attributeName];
                            }
                            var sizeSum = accumulateSize(n);
                            return n.children.reduce((acc, child) => {
                                return acc + accumulateColor(child) * accumulateSize(child)
                            }, 0) / sizeSum;
                        }
                        return linearColorScale(accumulateColor(d));
                    };
                } else {
                    // categorical scale
                    let values = new Set();
                    walkTree(root, node => {
                        if(isLeaf(node)) {
                            values.add(node.attributes[attributeName]);
                        }
                    });
                    let ordinalColorScale = d3.scale.category20()
                        .domain(...(Array.from(values)));
                    metrics[attributeName] = d => isLeaf(d) ?
                        ordinalColorScale(d.attributes[attributeName]) :
                        DEFAULT_COLOR_DIRECTORY;

                }
            });
            return metrics;
        }

        var colorMetrics = getColorMetricsFor(root);
        let currentColorMetric = colorMetrics[DEFAULT_IDENTIFIER];

        function colorStyleTween(transition, name, value) {
            transition.styleTween(name, function(d, i) {
                // TODO: aggregate values for directories
                //if(!isLeaf(d)) { return null;}
                return d3.interpolate(this.style[name], value(d));
            });
        }

        function colorMetricChanged(scale) {

            currentColorMetric = scale;
            path.transition()
                .duration(750)
                .call(colorStyleTween, "fill", n => styleNodeWith(n, lockedNode, scale));
        }
        this.colorMetricChanged = colorMetricChanged;

        let colorMetricSelection = rootContainer.append("form");
        colorMetricSelection
            .html('Color Metric: ');
        colorMetricSelection.selectAll('label')
            .html('Metrics')
            .data(Object.keys(colorMetrics))
            .enter()
            .append('label')
            .html(d => d)
            .append('input')
            .attr("type", 'radio')
            .attr('name', 'mode')
            .attr('value', d => d)
            .property('checked', (d, i) => d === DEFAULT_IDENTIFIER)
            .on('change', function() {
                colorMetricChanged(colorMetrics[this.value]);
            });

        var partition = d3.layout.partition()
            .sort(null)
            .size([2 * Math.PI, 1])
            .value(currentSizeMetric);

        var pieInverter = d3.scale.linear()
            .domain([0, 1])
            .range([1, innerRadius]);
        var converterForInnerLayout = d3.scale.linear()
            .domain([0, 1])
            .range([0, innerRadius]);

        var x = d3.scale.linear()
            .domain([0, 2 * Math.PI])
            .range([0, (2 - 0.00001) * Math.PI])
            .clamp(true);

        function getArcInnerRadius(d) {
            return radius * (isLeaf(d) ?
                        innerRadius :
                        pieInverter(d.y + d.dy)
                );
        }
        function getArcOuterRadius(d) {
            return pieInverter(d.y) * radius;
        }
        function getArcMiddleRadius(d) {
            return (getArcInnerRadius(d) + getArcOuterRadius(d)) / 2;
        }
        var outerMargin = 10;
        var arc = d3.svg.arc()
            .startAngle(d => (x(d.x)))
            .endAngle(d => (x(d.x + d.dx)))
            .innerRadius(d => Math.min(radius+outerMargin, getArcInnerRadius(d)))
            .outerRadius(d => Math.min(radius+outerMargin, getArcOuterRadius(d)));

        function lowerHalf(d) {
            var middleAngle = d.x + d.dx / 2;
            return Math.PI / 2 < middleAngle && middleAngle < Math.PI * 1.5;
        }

        function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
            var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

            return {
                x: centerX + (radius * Math.cos(angleInRadians)),
                y: centerY + (radius * Math.sin(angleInRadians))
            };
        }

        // http://stackoverflow.com/a/18473154/1152174
        function describeArc(x, y, radius, startAngle, endAngle){
            var start = polarToCartesian(x, y, radius, endAngle);
            var end = polarToCartesian(x, y, radius, startAngle);

            var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

            var d = [
                "M", start.x, start.y,
                "A", radius, radius, 0, arcSweep, 0, end.x, end.y
            ].join(" ");

            return d;
        }

        function radialLineGenerator(d) {
            return describeArc(
                0, 0,
                getArcMiddleRadius(d),
                radToDeg.invert(x(d.x)), radToDeg.invert(x(d.x + d.dx))
            );
        }

        var bundle = d3.layout.bundle();

        var radToDeg = d3.scale.linear()
            .domain([0, 360])
            .range([0, 2 * Math.PI]);

        var line = d3.svg.line.radial()
            .interpolate("bundle")
            .tension(bundleTension)
            .radius(function(d) {
                return radius * (isLeaf(d) ?
                            innerRadius:
                            Math.max(0, Math.min(innerRadius, converterForInnerLayout(d.y + d.dy)))
                    );
            })
            .angle(function(d) {
                return x(d.x + d.dx / 2);
            });

        /* Initialize tooltip */
        let tip = d3.tip()
            .attr('class', 'd3-tip')
            .html((d) => `<p>${d.label}</p><p>id: ${d.id}</p>` +
            Object.keys(colorMetrics)
                .filter(name => name !== DEFAULT_IDENTIFIER && d.attributes && d.attributes[name])
                .map(name => `${name}: ${d.attributes[name]}`)
                .join("<br>"));

        // Keep track of the node that is currently being displayed as the root.
        var nodeDisplayedAsRoot = root;

        var enterElem = svg.datum(root).append("g").selectAll("path")
            .data(partition.nodes)
            .enter();
        var hierarchicalEdgeBundleEnterElementGroup = enterElem.append("g")
            /* Invoke the tip in the context of your visualization */
            .call(tip)
            .on('mouseover', d => {
                tip.show(d);
                if(!lockedNode) {
                    highlightNode(d);
                }
            })
            .on("mouseout", d => {
                tip.hide(d);
                if(!lockedNode) {
                    unhighlightNode();
                }
            })
            .on('click', clickedOnNode)
            .on('contextmenu', function(d, ...args) {
                if(isLocked(d)) {
                    unlockNode(d);
                } else {
                    lockNode(d);
                }
                d3.event.preventDefault();
            });


        var path = hierarchicalEdgeBundleEnterElementGroup.append("path")
            .attr("display", function(d) { return null; return d.depth ? null : "none"; }) // hide inner ring
            .attr("d", arc)
            //.style("fill", function(d) { return color((d.children ? d : d.parent).label); })
            .style("fill-rule", "evenodd")
            .each(stash)
            .classed('node', true)
            .classed('node--leaf', isLeaf)
            .style('fill', currentColorMetric //d => isLeaf(d) ? null /*'#6666af'*/ : null
            );
        var node = path;

        function zoomToNode(d) {
            function isDescendentOf(desc, ance) {
                return desc === ance || (desc.parent && isDescendentOf(desc.parent, ance));
            }
            if(lockedNode && !isDescendentOf(lockedNode, d)) {
                unlockNode();
            }

            nodeDisplayedAsRoot = d;

            path
                .transition()
                .duration(Bundleview.zoomTransitionTime)
                .attrTween("d", arcTweenZoom(nodeDisplayedAsRoot));

            hiddenLineSegment
                .transition()
                .duration(Bundleview.zoomTransitionTime)
                .attrTween("d", hiddenArcTweenZoom(nodeDisplayedAsRoot));

            labels
                .classed('label--invisible', d => { return false; });

            link
                .transition()
                .duration(Bundleview.zoomTransitionTime)
                .attrTween("d", lineTweenZoom(nodeDisplayedAsRoot));
        }
        function clickedOnNode(d) {
            if(isLeaf(d)) {
                return console.log('clicked on leaf node', d);
            } else {
                return zoomToNode(d);
            }
        }

        var hiddenLineSegment = defs.datum(root).selectAll("path")
            .data(partition.nodes)
            .enter().append("path")
            .each(stash)
            .attr('id', (d, i) => 'bundleview_node_' + bundleviewID + '_' + i)
            .attr("d", radialLineGenerator);

        var labels = hierarchicalEdgeBundleEnterElementGroup.append("text")
            .classed('bundle--text', true)
            .append("textPath")
            .attr("startOffset","50%")
            .style("text-anchor","middle")
            .style('alignment-baseline', 'central')
            .attr("xlink:href", (d,i) => '#bundleview_node_' + bundleviewID + '_' + i)
            .text(d => d.label);

        var link = svg.append("g").selectAll(".link")
            .data(bundle(links))
            .enter().append("path")
            // only for interactions?
            .each(d => {
                if(d.length > 3) {
                    // remove the least common ancestor
                    let lastNode = d[0],
                        currentNode;
                    for(var i = 1; i < d.length; i++) {
                        currentNode = d[i];
                        if(currentNode.parent === lastNode) {
                            d.splice(i-1, 1);
                            break;
                        }
                        lastNode = d[i];
                    }
                }
            })
            .each(function(d) {d.source = d[0]; d.target = d[d.length - 1]; })
            .attr("class", "link")
            .attr("d", line);

        var lockedNode;

        function clearMarkers(nodes) {
            // clear node markers
            node
                .each(function(n) { n.target = n.source = n.descendant = n.ancestor = false; });
        }
        function highlightNode(d) {
            function markDescendants(n) {
                if(n.children) {
                    n.children.forEach(child => {
                        child.descendant = true;
                        markDescendants(child);
                    });
                }
            }

            function markAncestors(n) {
                if(n.parent) {
                    markAncestors(n.parent);
                    n.parent.ancestor = true;
                }
            }

            clearMarkers(node);

            markDescendants(d);
            markAncestors(d);

            link
                .each(function(d) {d.source = d[0]; d.target = d[d.length - 1]; })
                .classed("link--target", function(l) {
                    if (l.target === d || l.target.descendant) {
                        return l.source.source = true;
                    }
                })
                .classed("link--source", function(l) {
                    if (l.source === d || l.source.descendant) {
                        return l.target.target = true;
                    }
                })
                .classed("link--none", function(l) {
                    if(l.target === d) { return false; }
                    if(l.target.descendant) { return false; }
                    if(l.source === d) { return false; }
                    if(l.source.descendant) { return false; }
                    return true;
                });
                //.filter(function(l) { return l.target === d || l.source === d; })
                //.each(function() { this.parentNode.appendChild(this); });

            node
                .classed("node--hovered", function(n) { return n === d; })
                .classed("node--descendant", function(n) { return n.descendant; })
                .classed("node--ancestor", function(n) { return n.ancestor; })
                .classed("node--target", function(n) { return n.target; })
                .classed("node--source", function(n) { return n.source; })
                .classed("node--none", function(n) {
                    if(n === d) { return false; }
                    if(n.target) { return false; }
                    if(n.source) { return false; }
                    if(n.descendant) { return false; }
                    if(n.ancestor) { return false; }
                    return true;
                })
                .style('fill', n => styleNodeWith(n, d, currentColorMetric));

            labels
                .classed("bundle--text--none", function(n) {
                    if(n === d) { return false; }
                    if(n.target) { return false; }
                    if(n.source) { return false; }
                    if(n.descendant) { return false; }
                    if(n.ancestor) { return false; }
                    return true;
                });
        }

        function styleNodeWith(n, highlightedNode, colorMetric) {
            if(n === highlightedNode) { return COLOR_NODE_HOVERED; }
            if(n.target) { return COLOR_NODE_target; }
            if(n.source) { return COLOR_NODE_source; }
            if(n.descendant && (!isLeaf(n) || currentColorMetric === colorMetrics[DEFAULT_IDENTIFIER])) { return COLOR_NODE_descendant; }
            if(n.ancestor) { return COLOR_NODE_ancestor; }
            return colorMetric(n);
        }

        function unhighlightNode() {
            clearMarkers(node);

            link
                .classed("link--target", false)
                .classed("link--source", false)
                .classed("link--none", false);

            node
                .classed("node--hovered", false)
                .classed("node--descendant", false)
                .classed("node--ancestor", false)
                .classed("node--target", false)
                .classed("node--source", false)
                .classed("node--none", false)
                .style('fill', currentColorMetric);

            labels
                .classed("bundle--text--none", false);
        }

        function isLocked(d) {
            return lockedNode === d;
        }

        function lockNode(d) {
            lockedNode = d;
            highlightNode(d);
        }

        function unlockNode(d) {
            lockedNode = undefined;
            unhighlightNode();
        }

        // Stash the old values for transition.
        function stash(d) {
            d.x0 = d.x;
            d.dx0 = d.dx;
        }

        // Interpolate the arcs in data space.
        function getCommonArcTween(a, i, arcGenerator) {
            var oi = d3.interpolate({x: a.x0, dx: a.dx0}, a);
            function tween(t) {
                var b = oi(t);
                a.x0 = b.x;
                a.dx0 = b.dx;
                return arcGenerator(b);
            }
            if (i === 0) {
                // If we are on the first arc, adjust the x domain to match the root node
                // at the current zoom level. (We only need to do this once.)
                var xd = d3.interpolate(x.domain(), [nodeDisplayedAsRoot.x, nodeDisplayedAsRoot.x + nodeDisplayedAsRoot.dx]);
                return function(t) {
                    x.domain(xd(t));
                    return tween(t);
                };
            } else {
                return tween;
            }
        }

        function arcTween(d, i) { return getCommonArcTween(d, i, arc); }
        function hiddenArcTween(d, i) { return getCommonArcTween(d, i, radialLineGenerator); }

        // depends on that the .stash method was called for each point
        function lineTween(a) {
            var length = a.length,
                interpolations = a.map(point => d3.interpolate({x: point.x0, dx: point.dx0}, point));

            return function(t) {
                var interpolatedPoints = interpolations.map(i => i(t));
                interpolatedPoints.forEach((b, index) => {
                    a[index].x0 = b.x;
                    a[index].dx0 = b.dx;
                });

                return line(interpolatedPoints);
            };
        }

        // depends on that the .stash method was called for each point
        function lineTweenZoom(rootDisplay) {
            return function(a, i) {
                var length = a.length,
                    interpolations = a.map(point => d3.interpolate({x: point.x0, dx: point.dx0}, point));

                function tween(t) {
                    var interpolatedPoints = interpolations.map(i => i(t));
                    interpolatedPoints.forEach((b, index) => {
                        a[index].x0 = b.x;
                        a[index].dx0 = b.dx;
                    });

                    return line(interpolatedPoints);
                }

                if (i === 0) {
                    var xd = d3.interpolate(x.domain(), [rootDisplay.x, rootDisplay.x + rootDisplay.dx]),
                        yd = d3.interpolate(converterForInnerLayout.domain(), [rootDisplay.y, 1]);
                    return function(t) {
                        x.domain(xd(t));
                        converterForInnerLayout.domain(yd(t));
                        return tween(t);
                    };
                } else {
                    return tween;
                }
            }
        }

        //d3.select(self.frameElement).style("height", height + "px");

        // When zooming: interpolate the scales.
        function commonArcTweenZoom(displayedRoot, arcGenerator) {
            var xd = d3.interpolate(x.domain(), [displayedRoot.x, displayedRoot.x + displayedRoot.dx]),
                yd = d3.interpolate(pieInverter.domain(), [displayedRoot.y, 1]);

            return function(d, i) {
                return i
                    ? function(t) { return arcGenerator(d); }
                    : function foo(t) {
                    x.domain(xd(t));
                    pieInverter.domain(yd(t));
                    return arcGenerator(d);
                };
            };
        }

        function arcTweenZoom(d) { return commonArcTweenZoom(d, arc); }
        function hiddenArcTweenZoom(d) { return commonArcTweenZoom(d, radialLineGenerator); }

    }
}

//function walkTree(root, beforeChildren, afterChildren) {
//    beforeChildren(root);
//    if(root.children) {
//        root.children.forEach((child, i) => {
//            walkTree(child, beforeChildren, afterChildren);
//        })
//    }
//    afterChildren(root);
//}

