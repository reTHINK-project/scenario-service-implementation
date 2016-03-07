'use strict';

var _index = require('../src/index.js');

var _index2 = _interopRequireDefault(_index);

var _config = require('./config.js');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by pzu on 03.03.16.
 */

_index2.default.setConfig(_config2.default);
_index2.default.start(function (error) {
  console.log("Aaaaand we're live.");
});
//# sourceMappingURL=test.js.map