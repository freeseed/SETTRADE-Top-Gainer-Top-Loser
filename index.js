const { app, BrowserWindow, net } = require('electron')

let win

function createWindow() {
    win = new BrowserWindow({width:1800, height:1020})

    win.loadFile('index.html')

    win.on('closed',() => {
        win=null
    })

    //getData()
}

function getData() {
    const request = net.request('https://www.settrade.com/C13_MarketSummary.jsp?order=Y')
    request.on('response', (response) => {
      console.log(`STATUS: ${response.statusCode}`)
      console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
      response.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`)
      })
      response.on('end', () => {
        console.log('No more data in response.')
      })
    })
    request.end()
}

app.on('ready',createWindow)

app.on('window-all-closed', () => {
    // for macos
    if (process.platform !== 'darwin') {
        app.quit()
    }
})


app.on('activate',()=>{
    // for macos
    if(win=null){
        createWindow()
    }
})

