let priceData = {}
let currentDataAsset = getCurrentAsset()

let myPriceChart = new Chart(document.getElementById('priceChart'), {
    type: 'line',
    label: getCurrentAsset(),
    data: {
        datasets: [{
            backgroundColor: Color('#4dc9f6').alpha(0).rgbString(),
            borderColor: '#4dc9f6',
            fill: false,
            data: []
        }]
    },
    options: {
        scales: {
            x: {
                type: 'timeseries',
                offset: true,
                ticks: {
                    major: {
                        enabled: true,
                    },
                    font: function (context) {
                        return context.tick && context.tick.major ? { style: 'bold' } : undefined;
                    },
                    source: 'data',
                    autoSkip: true,
                    autoSkipPadding: 75,
                    maxRotation: 0,
                    sampleSize: 100
                },
                // Custom logic that chooses major ticks by first timestamp in time period
                // E.g. if March 1 & 2 are missing from dataset because they're weekends, we pick March 3 to be beginning of month
                afterBuildTicks: function (scale) {
                    const majorUnit = scale._majorUnit;
                    const ticks = scale.ticks;
                    const firstTick = ticks[0];

                    let val = luxon.DateTime.fromMillis(ticks[0].value);
                    if ((majorUnit === 'minute' && val.second === 0)
                        || (majorUnit === 'hour' && val.minute === 0)
                        || (majorUnit === 'day' && val.hour === 9)
                        || (majorUnit === 'month' && val.day <= 3 && val.weekday === 1)
                        || (majorUnit === 'year' && val.month === 1)) {
                        firstTick.major = true;
                    } else {
                        firstTick.major = false;
                    }
                    let lastMajor = val.get(majorUnit);

                    for (let i = 1; i < ticks.length; i++) {
                        const tick = ticks[i];
                        val = luxon.DateTime.fromMillis(tick.value);
                        const currMajor = val.get(majorUnit);
                        tick.major = currMajor !== lastMajor;
                        lastMajor = currMajor;
                    }
                    scale.ticks = ticks;
                }
            },
            y: {
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'value'
                }
            }
        },
        title: {
            display: false,
            text: getCurrentAsset()
        }
    }
})


function sendNeedPriceDataMsg(symbol) {
    const message = { msgType: 'NEED_PRICE_DATA', payload: symbol }
    console.log(`send `, message)
    chrome.runtime.sendMessage(null, message);
}

function priceMessageHandler(message, _sender, _sendResp) {
    if (message.msgType === 'PRICE') {
        console.log(`${message.msgType}`, message.payload)
        const currentAsset = getCurrentAsset()
        if (!(currentAsset in priceData)) {
            priceData[currentAsset] = { data: [] }
        }

        if (currentDataAsset !== currentAsset) {
            currentDataAsset = currentAsset
            myPriceChart.data.datasets[0].data = []
            myPriceChart.data.datasets[0].data = [...priceData[currentAsset].data]
        }

        let d = new Date()
        d.setTime(message.payload.data.time)
        const newPrice = parseFloat(message.payload.data.price)
        const newDataPoint = { x: message.payload.data.time, y: newPrice }
        priceData[currentAsset].data.push(newDataPoint)
        myPriceChart.data.datasets[0].data.push(newDataPoint)
        console.log(`price data: `, myPriceChart.data.datasets[0].data.length)
        myPriceChart.update()
    }
}

chrome.runtime.onMessage.addListener(priceMessageHandler)
