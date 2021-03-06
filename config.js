System.config({
  baseURL: window.href,
  defaultJSExtensions: true,
  transpiler: "babel",
  babelOptions: {
    "optional": [
      "runtime",
      "optimisation.modules.system"
    ],
    "blacklist": [],
    "stage": 0
  },
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  },
  bundles: {
    "build.js": [
      "js/virtkb.js",
      "github:photonstorm/phaser@2.6.1.js",
      "github:photonstorm/phaser@2.6.1/build/phaser.js",
      "npm:babel-runtime@5.8.38/core-js/get-iterator.js",
      "npm:core-js@1.2.7/library/fn/get-iterator.js",
      "npm:core-js@1.2.7/library/modules/core.get-iterator.js",
      "npm:core-js@1.2.7/library/modules/$.core.js",
      "npm:core-js@1.2.7/library/modules/core.get-iterator-method.js",
      "npm:core-js@1.2.7/library/modules/$.iterators.js",
      "npm:core-js@1.2.7/library/modules/$.wks.js",
      "npm:core-js@1.2.7/library/modules/$.global.js",
      "npm:core-js@1.2.7/library/modules/$.uid.js",
      "npm:core-js@1.2.7/library/modules/$.shared.js",
      "npm:core-js@1.2.7/library/modules/$.classof.js",
      "npm:core-js@1.2.7/library/modules/$.cof.js",
      "npm:core-js@1.2.7/library/modules/$.an-object.js",
      "npm:core-js@1.2.7/library/modules/$.is-object.js",
      "npm:core-js@1.2.7/library/modules/es6.string.iterator.js",
      "npm:core-js@1.2.7/library/modules/$.iter-define.js",
      "npm:core-js@1.2.7/library/modules/$.js",
      "npm:core-js@1.2.7/library/modules/$.set-to-string-tag.js",
      "npm:core-js@1.2.7/library/modules/$.has.js",
      "npm:core-js@1.2.7/library/modules/$.iter-create.js",
      "npm:core-js@1.2.7/library/modules/$.hide.js",
      "npm:core-js@1.2.7/library/modules/$.descriptors.js",
      "npm:core-js@1.2.7/library/modules/$.fails.js",
      "npm:core-js@1.2.7/library/modules/$.property-desc.js",
      "npm:core-js@1.2.7/library/modules/$.redefine.js",
      "npm:core-js@1.2.7/library/modules/$.export.js",
      "npm:core-js@1.2.7/library/modules/$.ctx.js",
      "npm:core-js@1.2.7/library/modules/$.a-function.js",
      "npm:core-js@1.2.7/library/modules/$.library.js",
      "npm:core-js@1.2.7/library/modules/$.string-at.js",
      "npm:core-js@1.2.7/library/modules/$.defined.js",
      "npm:core-js@1.2.7/library/modules/$.to-integer.js",
      "npm:core-js@1.2.7/library/modules/web.dom.iterable.js",
      "npm:core-js@1.2.7/library/modules/es6.array.iterator.js",
      "npm:core-js@1.2.7/library/modules/$.to-iobject.js",
      "npm:core-js@1.2.7/library/modules/$.iobject.js",
      "npm:core-js@1.2.7/library/modules/$.iter-step.js",
      "npm:core-js@1.2.7/library/modules/$.add-to-unscopables.js",
      "js/game.js",
      "js/world.js",
      "npm:babel-runtime@5.8.38/core-js/object/assign.js",
      "npm:core-js@1.2.7/library/fn/object/assign.js",
      "npm:core-js@1.2.7/library/modules/es6.object.assign.js",
      "npm:core-js@1.2.7/library/modules/$.object-assign.js",
      "npm:core-js@1.2.7/library/modules/$.to-object.js",
      "npm:babel-runtime@5.8.38/core-js/map.js",
      "npm:core-js@1.2.7/library/fn/map.js",
      "npm:core-js@1.2.7/library/modules/es7.map.to-json.js",
      "npm:core-js@1.2.7/library/modules/$.collection-to-json.js",
      "npm:core-js@1.2.7/library/modules/$.for-of.js",
      "npm:core-js@1.2.7/library/modules/$.to-length.js",
      "npm:core-js@1.2.7/library/modules/$.is-array-iter.js",
      "npm:core-js@1.2.7/library/modules/$.iter-call.js",
      "npm:core-js@1.2.7/library/modules/es6.map.js",
      "npm:core-js@1.2.7/library/modules/$.collection.js",
      "npm:core-js@1.2.7/library/modules/$.strict-new.js",
      "npm:core-js@1.2.7/library/modules/$.redefine-all.js",
      "npm:core-js@1.2.7/library/modules/$.collection-strong.js",
      "npm:core-js@1.2.7/library/modules/$.set-species.js",
      "npm:core-js@1.2.7/library/modules/es6.object.to-string.js",
      "npm:babel-runtime@5.8.38/helpers/sliced-to-array.js",
      "npm:babel-runtime@5.8.38/core-js/is-iterable.js",
      "npm:core-js@1.2.7/library/fn/is-iterable.js",
      "npm:core-js@1.2.7/library/modules/core.is-iterable.js",
      "npm:babel-runtime@5.8.38/helpers/to-consumable-array.js",
      "npm:babel-runtime@5.8.38/core-js/array/from.js",
      "npm:core-js@1.2.7/library/fn/array/from.js",
      "npm:core-js@1.2.7/library/modules/es6.array.from.js",
      "npm:core-js@1.2.7/library/modules/$.iter-detect.js",
      "npm:babel-runtime@5.8.38/helpers/class-call-check.js"
    ]
  },

  map: {
    "babel": "npm:babel-core@5.8.38",
    "babel-runtime": "npm:babel-runtime@5.8.38",
    "core-js": "npm:core-js@1.2.7",
    "phaser": "github:photonstorm/phaser@2.6.1",
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.4.1"
    },
    "github:jspm/nodelibs-buffer@0.1.0": {
      "buffer": "npm:buffer@3.6.0"
    },
    "github:jspm/nodelibs-path@0.1.0": {
      "path-browserify": "npm:path-browserify@0.0.0"
    },
    "github:jspm/nodelibs-process@0.1.2": {
      "process": "npm:process@0.11.6"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "github:jspm/nodelibs-vm@0.1.0": {
      "vm-browserify": "npm:vm-browserify@0.0.4"
    },
    "npm:assert@1.4.1": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "util": "npm:util@0.10.3"
    },
    "npm:babel-runtime@5.8.38": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:buffer@3.6.0": {
      "base64-js": "npm:base64-js@0.0.8",
      "child_process": "github:jspm/nodelibs-child_process@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "ieee754": "npm:ieee754@1.1.6",
      "isarray": "npm:isarray@1.0.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:core-js@1.2.7": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "systemjs-json": "github:systemjs/plugin-json@0.1.2"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:path-browserify@0.0.0": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:process@0.11.6": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "vm": "github:jspm/nodelibs-vm@0.1.0"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:vm-browserify@0.0.4": {
      "indexof": "npm:indexof@0.0.1"
    }
  }
});
