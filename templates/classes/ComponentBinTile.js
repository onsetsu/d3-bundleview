'use strict'

import Morph from './Morph.js';
import * as componentLoader from '../../src/client/morphic/component-loader.js';

export default class ComponentBinTile extends Morph {
  initialize() {
    this.addEventListener('click', (evt) => {
      var comp = this.createComponent();
      this.componentBin.open(comp);
    });
  }

  configure(config) {
    this.setComponentName(config.name);
    this.setThumbnail("/lively4-core/templates/" + (config.thumbnail || "thumbnails/default-placeholder.png"));
    this.setTooltip(config.description);

    this.htmlTag = config["html-tag"];
  }

  setThumbnail(path) {
    var img = this.getSubmorph('img');
    img.src = path;
  }

  setTooltip(string) {
    var img = this.getSubmorph('img');
    img.title = string;
  }

  setComponentName(name) {
    var text = this.getSubmorph('p');
    text.innerHTML = name;
  }

  setBin(componentBin) {
    this.componentBin = componentBin;
  }

  createComponent() {
    var comp = document.createElement(this.htmlTag);
    // this.componentBin.openInBody(comp);
    // componentLoader.loadUnresolved();

    return comp;
  }
}
