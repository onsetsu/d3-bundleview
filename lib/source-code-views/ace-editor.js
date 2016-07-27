import { newWidget } from './../layout.js';

let editor;

class D3Debugger {
    constructor() {
        this.astViewer = new D3ASTViewer();
    }
}

class D3ASTViewer {
    constructor() {
        var width = 960,
            height = 500;

        var zoom = d3.behavior.zoom()
            .scaleExtent([0.1, 10])
            .on("zoom", zoomed);

        function zoomed() {
            "use strict";
            container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }

        this.tree = d3.layout.tree()
            .size([height, width]);

        this.svg = d3.select(newWidget(0, 10, 5, 6)).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .call(zoom);
        var interactor = this.svg.append('rect')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('opacity', '.0');
        var container = this.svg = this.svg.append("g");

        this.diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.y, d.x]; });

        this.aceHighlightMarker = null;
    }

    setChildrenMappingFor(ast) {
        var mapToChildren = new Map();
        estraverse.traverse(ast, {
            enter: function (node, parent) {
                if(parent && node) {
                    if(mapToChildren.has(parent)) {
                        mapToChildren.get(parent).push(node);
                    } else {
                        mapToChildren.set(parent, [node]);
                    }
                }
            }
        });

        this.tree.children(function(d) {
            if(mapToChildren.has(d)) {
                return mapToChildren.get(d);
            }
            return null;
        });
    }

    displayAST() {
        try {
            var src = editor.getValue(),
                ast = lively.ast.parse(src, { sourceType: 'script', locations: true });

            // clear current visualization
            this.svg.selectAll("g.node").remove();
            this.svg.selectAll("path.link").remove();

            this.setChildrenMappingFor(ast);

            // Compute the new tree layout.
            var nodes = this.tree.nodes(ast).reverse(),
                links = this.tree.links(nodes);

            // Declare the nodes…
            var node = this.svg.selectAll("g.node")
                .data(nodes);

            // Enter the nodes.
            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) {
                    return "translate(" + d.y + "," + d.x + ")";
                })
                .on('mouseover', d => {
                    var node = d;
                    var aceRange = ace.require('ace/range').Range;
                    var start = editor.session.doc.indexToPosition(node.start),
                        end = editor.session.doc.indexToPosition(node.end);
                    this.aceHighlightMarker = editor.session.addMarker(new aceRange(start.row, start.column, end.row, end.column), 'programCounter', 'text', false);
                })
                .on('mouseout', d => {
                    editor.session.removeMarker(this.aceHighlightMarker);
                });

            nodeEnter.append("circle")
                .attr("r", 10)
                .style("fill", "#fff")
                .style('stroke', 'steelblue')
                .style('strike-width', '3px');

            nodeEnter.append("text")
                .attr("x", function(d) {
                    return d.children || d._children ? -13 : 13; })
                .attr("dy", ".35em")
                .attr("text-anchor", function(d) {
                    return d.children || d._children ? "end" : "start"; })
                .text(function(d) { return d.type; })
                .style("fill-opacity", 1)
                .style('font', '12px sans-serif');

            // Declare the links…
            var link = this.svg.selectAll("path.link")
                .data(links);

            // Enter the links.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .style('stroke', '#ccc')
                .style('strike-width', '2px')
                .attr("d", this.diagonal);


        } catch(e) {
            conole.error(e);
        }
    }
}

var d3Debugger = new D3Debugger();

(function() {
    $(`<div id="vars-debugger" class="varBox">
    <div class="capturedVars">Captured Variables (on exeception)</div>
<hr>
<dl class="varList">
    <dd>not run yet</dd>
</dl>
</div>`).appendTo(newWidget(2,0,3,3));

    let widgetId = newWidget(5,0,7,3);
    "use strict";
    let editorElement = document.createElement('pre');
    editorElement.innerHTML = '// CODE\n';
    editorElement.id = 'editor-debugger';
    document.querySelector(widgetId).appendChild(editorElement);

    let exception = document.createElement('div');
    exception.classList.add("exception");
    exception.style.display = 'none';
    exception.innerHTML = 'This.is.the.error.message';
    exception.id = 'exception-debugger';
    document.querySelector(widgetId).appendChild(exception);
})();

editor = ace.edit('editor-debugger');
editor.getSession().setMode('ace/mode/javascript');
editor.renderer.setShowPrintMargin(false);

// configure debugger environment
editor.on('changeMode', function(e) {
    this.session.$worker.call('changeOptions', [{ debug: true }]);
}.bind(editor));
editor.getSession().on('change', function(e) {
    reset();
});

function reset() {
    resetVariables();
    removeException();
    removeCustomMarkers();
    addVariable(null, 'not run yet');
    d3Debugger.astViewer.displayAST();
}

function setExampleCode(src) {
    editor.setValue(src, 1);
    editor.session.clearBreakpoints();
    resetVariables();
    addVariable(null, 'not run yet');
    d3Debugger.astViewer.displayAST();
}

function findStatementAtLine(ast, line) {
    var maxLines = ast.loc.end.line,
        res;

    do {
        res = lively.ast.acorn.walk.findNodeAt(ast, null, null, function(type, node) {
            return node.loc.start.line === line;
        });
        line += 1;
    } while ((res == undefined) && (line <= maxLines));

    return res && lively.ast.acorn.walk.findStatementOfNode(ast, res.node);
}

function step(env, stopAtRow) {
    if (!editor) return;

    resetVariables();

    var src = editor.getValue(),
        ast = lively.ast.parse(src, { sourceType: 'script', locations: true }),
        breakPoint = editor.session.getBreakpoints().indexOf('ace_breakpoint'),
        scope = { mapping: {} },
        interpreter = new lively.ast.AcornInterpreter.Interpreter();

    if (breakPoint > -1) {
        var node = findStatementAtLine(ast, breakPoint + 1);
        if (node) {
            node.isBreakpoint = true;

            // patch function
            interpreter.shouldHaltAtNextStatement = function(node) {
                return !!node.isBreakpoint;
            };
        }
    }

    var program = new lively.ast.AcornInterpreter.Function(ast),
        frame = lively.ast.AcornInterpreter.Frame.create(program, scope.mapping);
    program.lexicalScope = frame.getScope();

    try {
        interpreter.runWithFrameAndResult(ast, frame, undefined);
    } catch (e) {
        if (e.isUnwindException) // an UnwindException is thrown for the breakpoints (or errors)
            scope = e.top.getScope();
    }

    displayScope(scope);
}

function run() {
    if (!editor) return;

    resetVariables();
    removeException();

    var srcPrefix = '(function() {',
        srcPostfix = ' });',
        src = srcPrefix + editor.getValue() + srcPostfix,
        func = eval(src),
        runtime, scope, ex, frame;

    try {
        runtime = lively.ast.StackReification.run(func);
        scope = runtime.currentFrame.getScope();
        if (runtime.isContinuation)
            frame = runtime.currentFrame;
    } catch(e) {
        if (e.unwindException) { // might have been an UnwindException originally
            ex = e.unwindException;
            ex.recreateFrames();
            frame = ex.top;
            scope = ex.top.getScope();
        }
    }
    if (scope) {
        displayScope(scope);
        if (frame)
            setException(frame, srcPrefix.length, ex);
    } else {
        setVariable(null, 'no exception triggered');
    }
}

function setException(frame, offset, err) {
    if (isNaN(offset)) offset = 0;

    var ex = document.getElementById('exception-debugger');
    if (!ex) return;
    ex.style.setProperty('display', 'block');
    if (err)
        ex.innerHTML = '<strong>' + err.error.name + ':</strong> ' + err.error.message;
    else
        ex.innerHTML = '<strong>Stopped execution:</strong> Debugger statement';

    var aceRange = ace.require('ace/range').Range,
        node;
    do {
        node = frame.getPC();
        var start = editor.session.doc.indexToPosition(node.start - offset - 1),
            end = editor.session.doc.indexToPosition(node.end - offset - 1);
        ex.innerHTML += '<br>&nbsp;&nbsp;&nbsp;&nbsp;at: ' + node.type + ' @ line ' + (start.row + 1) + ', column ' + start.column;
        var marker = editor.session.addMarker(new aceRange(start.row, start.column, end.row, end.column), 'programCounter', 'text', false);
        frame = frame.parentFrame;
    } while (frame);
}

function removeException() {
    var ex = document.getElementById('exception-debugger');
    if (ex)
        ex.style.setProperty('display', 'none');
}

function removeCustomMarkers() {
    var markers = editor.session.getMarkers();
    Object.getOwnPropertyNames(markers).forEach(function(markerId) {
        if (markers[markerId].clazz == 'programCounter')
            editor.session.removeMarker(markerId);
    });
}

function getVarList() {
    var list = document.getElementById('vars-debugger');
    if (!list) return null;
    list = list.getElementsByClassName('varList')[0];
    return list;
}

function resetVariables() {
    var varList = getVarList();
    if (!varList) return;
    Array.from(varList.children).forEach(function(child) {
        child.remove();
    });
}

function displayScope(scope) {
    do {
        var mapping = scope.mapping;
        Object.getOwnPropertyNames(mapping).forEach(function(varName) {
            setVariable(varName, mapping[varName]);
        });
        scope = scope.parentScope;
    } while (scope != null && scope.mapping != window);
}

function setVariable(varName, varValue) {
    var varList = getVarList();
    if (!varList) return;

    var allVars = Array.from(varList.getElementsByTagName('dt')).map(function(elem) {
        return elem.textContent;
    });

    if (allVars.indexOf(varName) == -1)
        addVariable(varName, varValue);
}

function addVariable(varName, varValue) {
    var varList = getVarList();
    if (!varList) return;

    var elem;
    if (varName != null) {
        elem = document.createElement('dt');
        elem.textContent = varName;
        varList.appendChild(elem);
    }
    elem = document.createElement('dd');
    var strValue = String(varValue);
    var isFunc = strValue.match(/function\s+(.*)\s*\{/);
    if (isFunc) {
        strValue = isFunc[0] + ' ... }';
    }
    elem.textContent = strValue;
    varList.appendChild(elem);
}

setExampleCode('// CODE\n');
radio('FileBrowser:leafNodeClicked').subscribe(setExampleCode);

$('<button>Run!</button>')
    .addClass('run')
    .click(() => run())
    .appendTo(newWidget(0,0,2,1));

$('<button>Reset</button>')
    .click(() => reset())
    .appendTo(newWidget(0,0,2,1));
