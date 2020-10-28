console.log('from background')
chrome.tabs.onActivated.addListener(tab => {
    chrome.tabs.get(tab.tabId, curTab => {
        console.log(curTab.url)
    })
})
// chrome.tabs.executeScript(null, { file: './foreground.js' }, ()=> {
//     console.log('foreground.js injected')
// })

// let previousTime = null
// const emptySentiment = {
//     price: 0.00,
//     buyVol: 0.0,
//     sellVol: 0.0,
// }
// let fiveMinSentiment = { ...emptySentiment }
// let previousFiveMinSentiment = { ...emptySentiment }
// const fiveMinInMs = 5 * 60
// let msCounter = 0
// const myInterval = setInterval(() => {
//     fetch('https://fapi.binance.com/fapi/v1/trades?symbol=neousdt&limit=1')
//         .then(response => response.json())
//         .then(result => {
//             const res = result[0]
//             let d = new Date()
//             d.setTime(res.time)
//             if (previousTime == null || previousTime < res.time) {
//                 const side = res.isBuyerMaker ? 'SELL' : 'BUY'
//                 // console.log(`time: ${d} price: ${res.price} vol: ${res.quoteQty} side: ${side}`)
//                 if (fiveMinSentiment.price === 0.0) {
//                     fiveMinSentiment.price = res.price
//                 }
//                 if (side === 'SELL') {
//                     fiveMinSentiment.sellVol = fiveMinSentiment.sellVol + parseFloat(res.quoteQty)
//                 } else {
//                     fiveMinSentiment.buyVol = fiveMinSentiment.buyVol + parseFloat(res.quoteQty)
//                 }
//                 previousTime = res.time
//             }
//             if (++msCounter === fiveMinInMs) {

//                 console.log(`five min sentiment:
//                 price: ${fiveMinSentiment.price} change: ${(fiveMinSentiment.price/previousFiveMinSentiment.price)-1}
//                 buy volume: ${fiveMinSentiment.buyVol} change: ${(fiveMinSentiment.buyVol/previousFiveMinSentiment.buyVol)-1}
//                 sell volume: ${fiveMinSentiment.sellVol} change: ${(fiveMinSentiment.sellVol/previousFiveMinSentiment.sellVol)-1}
//                 `)
//                 previousFiveMinSentiment = { ...fiveMinSentiment }
//                 fiveMinSentiment = { ...emptySentiment }
//                 msCounter = 0
//             }
//         })
// }, 1000)

const symbol = 'neousdt'
const timeframe = '5m'
let lastTopTimestamp = 0
let lastTopPosTimestamp = 0
let lastGlobalTimestamp = 0
let lastTakerTimestamp = 0


chrome.runtime.onMessage.addListener((message, sender, sendResp) => {
    if (message.msgType === 'NEED_DATA') {
        sendData(true)
    }
})

const myInterval = setInterval(sendData, 1000, false)

function sendData(forced = false) {
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