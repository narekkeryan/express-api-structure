'use strict';

var $path = require('path');

class Loader {
    setPath (root) {
        this._rootPath = root;
    }

    model (moduleName) {
        return this.load($path.join('/models/' + moduleName));
    }

    controller (moduleName) {
        return this.load($path.join('/controllers/' + moduleName));
    }

    config (moduleName) {
        return this.load($path.join('/config/' + moduleName));
    }

    route (moduleName) {
        return this.load($path.join('/routes/' + moduleName))
    }

    load (moduleName) {
        return require($path.join(this._rootPath + moduleName));
    }
}

var loader = new Loader();

module.exports = loader;