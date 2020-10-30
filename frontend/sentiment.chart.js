const title = 'Sentiment5'

document.getElementById("selAsset").addEventListener("change", onSelectedAsset);

var ctx = document.getElementById('sentimentChart');
var data = {
    labels: ['TOP_LONG', 'GLOBAL_LONG', 'TAKER_LONG', 'TOP_SHORT', 'GLOBAL_SHORT', 'TAKER_SHORT'],
    datasets: [{
        label: 'current',
        backgroundColor: Color('#4dc9f6').alpha(0.2).rgbString(),
        borderColor: '#4dc9f6',
        data: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    },
    {
        label: 'previous',
        backgroundColor: Color('#f67019').alpha(0.2).rgbString(),
        borderColor: '#f67019',
        data: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    }]
}
var options = {
    responsive: true,
    title: {
        display: true,
        text: title
    }
}

const TOP_LONG = 0
const GLOBAL_LONG = 1
const TAKER_LONG = 2
const TOP_SHORT = 3
const GLOBAL_SHORT = 4
const TAKER_SHORT = 5

var myRadarChart = new Chart(ctx, {
    type: 'radar',
    data: data,
    options: options
})

function buildAssetDropDownList(symbols) {
    let selAsset = document.getElementById("selAsset")
    symbols.forEach(item => {
        let option = document.createElement("OPTION");
        option.innerHTML = item.symbol;
        option.value = item.symbol;
        selAsset.options.add(option);
    })
}

function sendNeedDataMsg(symbol) {
    chrome.runtime.sendMessage(null, { msgType: 'NEED_DATA', payload: symbol });
}

function loadOrRestoreSentiment() {
    chrome.storage.local.get(['sentiment'], (result) => {
        console.log(`read from local storage: `, result.sentiment)
        if (!result.sentiment || !result.sentiment.asset || !result.sentiment.data) {
            sendNeedDataMsg(getCurrentAsset())
        } else {
            setCurrentAsset(result.sentiment.asset)
            myRadarChart.data.datasets[0].data = [...result.sentiment.data.datasets[0].data]
            myRadarChart.data.datasets[1].data = [...result.sentiment.data.datasets[1].data]
            myRadarChart.update()
            console.log(`Sentiment restored.`)
            const tenMinInMs = 10 * 60 * 1000
            if ((Date.now() - result.sentiment.date) >= tenMinInMs) {
                console.log(`Sentiment too old, request for newer ones ...`)
                sendNeedDataMsg(getCurrentAsset())
            }
        }
    })
}

function getCurrentAsset() {
    const selAsset = document.getElementById("selAsset")
    return selAsset.value
}

function setCurrentAsset(symbol) {
    let selAsset = document.getElementById("selAsset")
    selAsset.value = symbol
}

function onSelectedAsset() {
    const asset = getCurrentAsset()
    console.log(`selected ${asset}`)
    sendNeedDataMsg(asset)
}

function sentimentMessageHandler(message, _sender, _sendResp) {
    let tobeUpdated = false
    console.log(`received message`, message)
    if (message.msgType === 'EXCHANGEINFO_UPDATED') {
        buildAssetDropDownList(gExchangeInfo.symbols)
        loadOrRestoreSentiment()
    }
    else if (message.msgType === 'TOP') {
        console.log(`${message.msgType}`, message.payload)
        if (getCurrentAsset() === message.payload.symbol) {
            myRadarChart.data.datasets[1].data[TOP_LONG] = myRadarChart.data.datasets[0].data[TOP_LONG]
            myRadarChart.data.datasets[1].data[TOP_SHORT] = myRadarChart.data.datasets[0].data[TOP_SHORT]
            myRadarChart.data.datasets[0].data[TOP_LONG] = parseFloat(message.payload.data.longAccount).toFixed(2)
            myRadarChart.data.datasets[0].data[TOP_SHORT] = parseFloat(message.payload.data.shortAccount).toFixed(2)
            data.datasets[1].data[TOP_LONG] = myRadarChart.data.datasets[1].data[TOP_LONG]
            data.datasets[1].data[TOP_SHORT] = myRadarChart.data.datasets[1].data[TOP_SHORT]
            data.datasets[0].data[TOP_LONG] = myRadarChart.data.datasets[0].data[TOP_LONG]
            data.datasets[0].data[TOP_SHORT] = myRadarChart.data.datasets[0].data[TOP_SHORT]
            tobeUpdated = true
        } else {
            console.warn(`update failed: ${getCurrentAsset()}!=${message.payload.symbol}`)
        }
    }
    else if (message.msgType === 'TOP_POS') {
        console.log(`${message.msgType}`, message.payload)
    }
    else if (message.msgType === 'GLOBAL') {
        console.log(`${message.msgType}`, message.payload)
        if (getCurrentAsset() === message.payload.symbol) {
            myRadarChart.data.datasets[1].data[GLOBAL_LONG] = myRadarChart.data.datasets[0].data[GLOBAL_LONG]
            myRadarChart.data.datasets[1].data[GLOBAL_SHORT] = myRadarChart.data.datasets[0].data[GLOBAL_SHORT]
            myRadarChart.data.datasets[0].data[GLOBAL_LONG] = parseFloat(message.payload.data.longAccount).toFixed(2)
            myRadarChart.data.datasets[0].data[GLOBAL_SHORT] = parseFloat(message.payload.data.shortAccount).toFixed(2)
            data.datasets[1].data[GLOBAL_LONG] = myRadarChart.data.datasets[1].data[GLOBAL_LONG]
            data.datasets[1].data[GLOBAL_SHORT] = myRadarChart.data.datasets[1].data[GLOBAL_SHORT]
            data.datasets[0].data[GLOBAL_LONG] = myRadarChart.data.datasets[0].data[GLOBAL_LONG]
            data.datasets[0].data[GLOBAL_SHORT] = myRadarChart.data.datasets[0].data[GLOBAL_SHORT]
            tobeUpdated = true
        } else {
            console.warn(`update failed: ${getCurrentAsset()}!=${message.payload.symbol}`)
        }
    }
    else if (message.msgType === 'TAKER') {
        console.log(`${message.msgType}`, message.payload)
        if (getCurrentAsset() === message.payload.symbol) {
            const buyVol = parseFloat(message.payload.data.buyVol)
            const sellVol = parseFloat(message.payload.data.sellVol)
            const totalVol = buyVol + sellVol
            myRadarChart.data.datasets[1].data[TAKER_LONG] = myRadarChart.data.datasets[0].data[TAKER_LONG]
            myRadarChart.data.datasets[1].data[TAKER_SHORT] = myRadarChart.data.datasets[0].data[TAKER_SHORT]
            myRadarChart.data.datasets[0].data[TAKER_LONG] = (buyVol / totalVol).toFixed(2)
            myRadarChart.data.datasets[0].data[TAKER_SHORT] = (sellVol / totalVol).toFixed(2)
            data.datasets[1].data[TAKER_LONG] = myRadarChart.data.datasets[1].data[TAKER_LONG]
            data.datasets[1].data[TAKER_SHORT] = myRadarChart.data.datasets[1].data[TAKER_SHORT]
            data.datasets[0].data[TAKER_LONG] = myRadarChart.data.datasets[0].data[TAKER_LONG]
            data.datasets[0].data[TAKER_SHORT] = myRadarChart.data.datasets[0].data[TAKER_SHORT]
            tobeUpdated = true
        } else {
            console.warn(`update failed: ${getCurrentAsset()}!=${message.payload.symbol}`)
        }
    }

    if (tobeUpdated === true) {
        myRadarChart.update()
        chrome.storage.local.set({
            'sentiment': {
                date: Date.now(),
                asset: getCurrentAsset(),
                data: data
            }
        }, () => console.log(`Sentiment saved.`))
    }
}

chrome.runtime.onMessage.addListener(sentimentMessageHandler)