const title = 'Sentiment5'

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

chrome.runtime.onMessage.addListener((message, sender, sendResp) => {
    if (message.msgType === 'TOP') {
        console.log(`${message.msgType}`, message.payload)
        myRadarChart.data.datasets[1].data[TOP_LONG] = myRadarChart.data.datasets[0].data[TOP_LONG]
        myRadarChart.data.datasets[1].data[TOP_SHORT] = myRadarChart.data.datasets[0].data[TOP_SHORT]
        myRadarChart.data.datasets[0].data[TOP_LONG] = parseFloat(message.payload.data.longAccount).toFixed(2)
        myRadarChart.data.datasets[0].data[TOP_SHORT] = parseFloat(message.payload.data.shortAccount).toFixed(2)
    }
    else if (message.msgType === 'TOP_POS') {
        console.log(`${message.msgType}`, message.payload)
    }
    else if (message.msgType === 'GLOBAL') {
        console.log(`${message.msgType}`, message.payload)
        myRadarChart.data.datasets[1].data[GLOBAL_LONG] = myRadarChart.data.datasets[0].data[GLOBAL_LONG]
        myRadarChart.data.datasets[1].data[GLOBAL_SHORT] = myRadarChart.data.datasets[0].data[GLOBAL_SHORT]
        myRadarChart.data.datasets[0].data[GLOBAL_LONG] = parseFloat(message.payload.data.longAccount).toFixed(2)
        myRadarChart.data.datasets[0].data[GLOBAL_SHORT] = parseFloat(message.payload.data.shortAccount).toFixed(2)
    }
    else if (message.msgType === 'TAKER') {
        console.log(`${message.msgType}`, message.payload)
        const buyVol = parseFloat(message.payload.data.buyVol)
        const sellVol = parseFloat(message.payload.data.sellVol)
        const totalVol = buyVol + sellVol
        myRadarChart.data.datasets[1].data[TAKER_LONG] = myRadarChart.data.datasets[0].data[TAKER_LONG]
        myRadarChart.data.datasets[1].data[TAKER_SHORT] = myRadarChart.data.datasets[0].data[TAKER_SHORT]
        myRadarChart.data.datasets[0].data[TAKER_LONG] = (buyVol / totalVol).toFixed(2)
        myRadarChart.data.datasets[0].data[TAKER_SHORT] = (sellVol / totalVol).toFixed(2)
    }

    myRadarChart.update()
})

chrome.runtime.sendMessage(null, { msgType: 'NEED_DATA' });