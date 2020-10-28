console.log('from background')
chrome.tabs.onActivated.addListener(tab => {
    chrome.tabs.get(tab.tabId, curTab => {
        console.log(curTab.url)
    })
})

const symbol = 'neousdt'
const timeframe = '5m'
let lastTopTimestamp = 0
let lastTopPosTimestamp = 0
let lastGlobalTimestamp = 0
let lastTakerTimestamp = 0
let lastPriceTime = 0


chrome.runtime.onMessage.addListener((message, sender, sendResp) => {
    if (message.msgType === 'NEED_DATA') {
        sendData(true)
    }
})

const myInterval = setInterval(sendData, 1000, false)

function sendData(forced = false) {
    fetch(`https://fapi.binance.com/fapi/v1/trades?symbol=${symbol}&limit=1`)
        .then(response => response.json())
        .then(result => {
            if (lastPriceTime !== result[0].time || forced === true) {
                console.log(`send price: `, result)
                chrome.runtime.sendMessage(null, {
                    msgType: 'PRICE', payload: {
                        data: result[0]
                    }
                });
                lastPriceTime = result[0].time
            }
        })
    fetch(`https://fapi.binance.com/futures/data/topLongShortAccountRatio?symbol=${symbol}&period=${timeframe}&limit=1`)
        .then(response => response.json())
        .then(result => {
            if (lastTopTimestamp !== result[0].timestamp || forced === true) {
                console.log(`send top: `, result)
                chrome.runtime.sendMessage(null, {
                    msgType: 'TOP', payload: {
                        data: result[0]
                    }
                });
                lastTopTimestamp = result[0].timestamp
            }
        })
    fetch(`https://fapi.binance.com/futures/data/topLongShortPositionRatio?symbol=${symbol}&period=${timeframe}&limit=1`)
        .then(response => response.json())
        .then(result => {
            if (lastTopPosTimestamp !== result[0].timestamp || forced === true) {
                console.log(`send top pos: `, result)
                chrome.runtime.sendMessage(null, {
                    msgType: 'TOP_POS', payload: {
                        data: result[0]
                    }
                });
                lastTopPosTimestamp = result[0].timestamp
            }
        })
    fetch(`https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=${symbol}&period=${timeframe}&limit=1`)
        .then(response => response.json())
        .then(result => {
            if (lastGlobalTimestamp !== result[0].timestamp || forced === true) {
                console.log(`send global: `, result)
                chrome.runtime.sendMessage(null, {
                    msgType: 'GLOBAL', payload: {
                        data: result[0]
                    }
                });
                lastGlobalTimestamp = result[0].timestamp
            }
        })
    fetch(`https://fapi.binance.com/futures/data/takerlongshortRatio?symbol=${symbol}&period=${timeframe}&limit=1`)
        .then(response => response.json())
        .then(result => {
            if (lastTakerTimestamp !== result[0].timestamp || forced === true) {
                console.log(`send taker: `, result)
                chrome.runtime.sendMessage(null, {
                    msgType: 'TAKER', payload: {
                        data: result[0]
                    }
                });
                lastTakerTimestamp = result[0].timestamp
            }
        })
}