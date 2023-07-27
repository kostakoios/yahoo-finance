const NodeCache = require("node-cache");

const cacheInstance = new NodeCache();

const wait = async (milliseconds) => {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const getDateUnix = ()=>Math.floor(new Date() / 1000);

module.exports={
    wait,
    getDateUnix,
    cacheInstance
};