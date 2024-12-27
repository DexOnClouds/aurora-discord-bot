const config = require('../config.js');

module.exports = {
    getPrefix: (message) => {
        return config.prefix;
    }
};
