const htmlparser = require("htmlparser2");
const shareFunc = require('./sharevariables')



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
                          const strVolume =  textintd[10].data.trim()
                          const strPrice =  shareFunc.textToFloat(textintd[5].data.trim())
                          const strChange =  textintd[6].data.trim()
                          const strPercentChange =  shareFunc.textToFloat(textintd[7].data.trim()) 

                          arrStock.push( shareFunc.stockObject(strSymbol,strVolume,strPrice,strChange,strPercentChange) )
  
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
