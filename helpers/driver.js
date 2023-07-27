const { chromium } = require('playwright');

let browser;

const getInstance = async()=>{
    if(browser==undefined){
        browser = await chromium.launch();
    }
    
    // browser.on('disconnected', () => {
    //     //if (browser.process() != null) browser.process().kill('SIGINT');
    //   });
    return browser;
};

module.exports={
    getInstance
};