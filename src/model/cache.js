const NodeCache = require('node-cache');
const myCache = new NodeCache({stdTTl:100});

module.exports = myCache;