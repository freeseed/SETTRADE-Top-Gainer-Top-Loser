const htmlparser = require('htmlparser2');
const shareFunc = require('./sharevariables')

function calStepPrice(low, high){
  let stepPrice = 0
  if (low <=1.99) {
    stepPrice = 0.01
  }else if (low <= 4.98) {
    stepPrice = 0.02
  }else if (low <= 9.95) {
    stepPrice = 0.05
  }else if (low <= 24.9) {
    stepPrice = 0.1
  }else if (low <= 99.75) {
    stepPrice = 0.25
  }else if (low <= 199.5) {
    stepPrice = 0.5
  }else if (low <399) {
    stepPrice = 1
  }else {
    stepPrice = 2
  }
  return parseInt((high-low)/stepPrice) 
}

//parse price table get from settrade.com
function wrapHtmlParser (html,filterOutOnlyDWSETTSDmai) {

    filterOutOnlyDWSETTSDmai = typeof filterOutOnlyDWSETTSDmai !== 'undefined' ? filterOutOnlyDWSETTSDmai : false
    let arrStock = []
    const handler = new htmlparser.DomHandler(function (error, dom) {
      if (error)
        console.error(error)
      else {
  
       let alltr = htmlparser.DomUtils.find( (el)=> {
              return el.type === 'tag' && el.name === 'tr'
            },dom, true, 1000
        )
  
        //console.log('alltr.lenth=', alltr.length)
  
        alltr.forEach(
          (tr,itr)=> {
                      if(itr < 1000){ 
                        //console.log(tr)
  
                         let tds = htmlparser.DomUtils.find( (el)=> {
                              return el.type === 'tag' && el.name === 'td'
                            },[tr], true, 50
                        )
  
                        //console.log('tds.lenth=', tds.length)
  
                        let textintd = htmlparser.DomUtils.find( (el)=> {
                              return el.type === 'text' 
                            },tds, true, 50
                        )
  
                        //console.log('textintd.lenth=', textintd.length)
                        //console.log('textintdObject=', textintd)

                        if(textintd.length == 12){
                          //console.log('textintdObject=', textintd)
                          
                          const strSymbol =  textintd[0].data.trim()
                          const strFlag =  textintd[1].data.trim()
                          const strVolume =  textintd[10].data.trim()
                          const numPrice =  shareFunc.textToFloat(textintd[5].data.trim())
                          const strChange =  textintd[6].data.trim()
                          const numPercentChange =  shareFunc.textToFloat(textintd[7].data.trim()) 
                          const numhigh = shareFunc.textToFloat(textintd[3].data.trim())
                          const numlow = shareFunc.textToFloat(textintd[4].data.trim())
                          const numSwingPercent = (numhigh - numlow)/numlow*100
                          const stepPrice = calStepPrice(numlow,numhigh)

                          arrStock.push( shareFunc.stockObject(strSymbol,strVolume,numPrice,strChange,numPercentChange,strFlag,numhigh,numlow,numSwingPercent,stepPrice) )
  
                        }
  
                      }
                  }
        )
  
      }
  
    })
  
    let parser = new htmlparser.Parser(handler)
    parser.write(html)
    parser.end()
    return arrStock

}

module.exports.wrapHtmlParserSet100 = wrapHtmlParser
