var contextMenu = document.createElement('dbuggr-contextmenu');
contextMenu.style.display = 'none';
document.body.appendChild(contextMenu);
// hide menu when a contextmenu event occurs
d3.select('body').on('click.context-menu', function() {
    contextMenu.style.display = 'none';
});

export default function openContextMenuFor(itemDescriptions) {
    console.log(arguments, d3.event);

    contextMenu.style.left = (d3.event.pageX - 2) + 'px';
    contextMenu.style.top = (d3.event.pageY - 2) + 'px';
    contextMenu.style.display = 'block';

    Polymer.dom(contextMenu)._clear();
    itemDescriptions.forEach((callback, itemName) => {
        var listItem = document.createElement('li');
        listItem.innerHTML = itemName;
        listItem.onclick = callback;
        Polymer.dom(contextMenu).appendChild(listItem);
    });

    d3.event.preventDefault();
}
