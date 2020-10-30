gExchangeInfo = {}

async function fetchInfo(endpoint) {
    return (await fetch(endpoint)).json()
}

async function fetchExchangeInfoFromBinance() {
    gExchangeInfo = await fetchInfo('https://fapi.binance.com/fapi/v1/exchangeInfo')
    console.log(`fetched exchange data: `, gExchangeInfo)
    sentimentMessageHandler({ msgType: 'EXCHANGEINFO_UPDATED' })
}


(() => {
    fetchExchangeInfoFromBinance()
})()


