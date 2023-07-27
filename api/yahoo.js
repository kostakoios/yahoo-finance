const {logger} = require('../helpers/logger');
const {cacheInstance, getDateUnix, wait} = require('../helpers/utilities');
const {getInstance} = require('../helpers/driver');

//#region Constants
const URL = 'https://finance.yahoo.com/quote/{symbol}/community?p={symbol}';
// const MESSAGES_URL = 'https://api-2-0.spot.im/v1.0.0/conversation/read';
//#endregion

const generateUrl = (symbol)=>URL.replace('{symbol}', symbol.toUpperCase());
const generateKey = (symbol)=>`yahoo_${symbol}`;

const getData =(symbol,count=1)=> new Promise(async (resolve , reject) => {
    const key = symbol.toUpperCase();
    if(count==undefined || isNaN(count) || count<1||count>195)
        count=1;
    let cache = cacheInstance.get(generateKey(key));
    if(cache == undefined){
        cacheInstance.set(generateKey(key), {statusCode: 201, timestamp: getDateUnix(), data: 'pending'}, 60);
        let browser = await getInstance();
        
        const page = await browser.newPage();
        await page.setViewportSize({ width: 1200, height: 800 });

        //page.on('request', request => console.log('>>', request.method(), request.url()));
        //page.on('response', response => console.log('<<', response.status(), response.url()));

        await page.route('**/conversation/read', async (route) => {
            const postData = route.request().postDataJSON();
            //default: {sort_by: 'best', offset: 0, count: 10, depth: 2, child_count: 2}
            postData.sort_by = 'newest';
            postData.count = count;

            // Make the request
            const response = await route.fetch({ postData });

            // Get the response
            const result = await response.json();
            const data = {statusCode: 200, timestamp: getDateUnix(), mode: 'cache', data: result.conversation};
            cacheInstance.set(generateKey(key), data, 60);
            route.fulfill();
            data.mode='realtime';
            resolve(data);
        });

        await page.goto(generateUrl(key));
        try{
            await page.waitForResponse(resp => resp.url().includes('**/conversation/read') && resp.status() === 200);
            //await page.screenshot({ path: 'screenshot.png' })
            
        }
        catch(err){
            console.log(err);
            reject(err);
        }
        finally{
            await page.close();
            //await browser.close();
        }
    }
    else{
        resolve(cache);
    }
});

const getStatistics = async()=> {
    // let browser = await getInstance();
    // if(browser)
    //     return await browser.pages();
    // return {};
    let browser;
    try {
      browser = await getInstance();
      const context = await browser.newContext();
      const pages = await context.pages();
      return pages;
    } catch (err) {
      console.error('Error while getting statistics:', err);
      return [];
    } finally {
      if (browser) {
        await browser.close();
      }
    }
};

module.exports={
    getData,
    getStatistics
};