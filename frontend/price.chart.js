var myPriceChart = new Chart(document.getElementById('priceChart'), {
    type: 'line',
    data: {
        datasets: [{
            backgroundColor: Color('#4dc9f6').alpha(0).rgbString(),
            borderColor: '#4dc9f6',
            fill: false,
            data: [],
            labels: []
        }]
    },
    options: {
        responsive: true,
        title: {
            display: true,
            text: 'p'
        }
    }
})

chrome.runtime.onMessage.addListener((message, sender, sendResp) => {
    if (message.msgType === 'PRICE') {
        console.log(`${message.msgType}`, message.payload)
        let d = new Date()
        d.setTime(message.payload.data.time)
        const newPrice = parseFloat(message.payload.data.price)
        myPriceChart.data.datasets[0].labels.push(d)
        myPriceChart.data.datasets[0].data.push(newPrice)
        myPriceChart.update()
    }
})

chrome.runtime.sendMessage(null, { msgType: 'NEED_DATA' })