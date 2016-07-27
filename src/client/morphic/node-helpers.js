export function setPosition(node, pos) {
  node.style.left = '' + pos.x + 'px';
  node.style.top = '' + pos.y + 'px';
}

export function getPosition(node, pos) {
  return {
    x: parseInt(node.style.left) || 0,
    y: parseInt(node.style.top) || 0
  }
}

export function globalPosition(node) {
  var left = 0;
  var top = 0;
  while (node && node !== document.body) {
    left += node.offsetLeft;
    top += node.offsetTop;
    node = node.offsetParent;
  }
  return {
    x: left,
    y: top
  }
}
