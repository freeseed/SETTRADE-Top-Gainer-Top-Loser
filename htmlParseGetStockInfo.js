const htmlparser = require('htmlparser2');
const shareFunc = require('./sharevariables')



function wrapHtmlParserGetStockInfo (html,filterOutOnlyDWSETTSDmai,period) {

    filterOutOnlyDWSETTSDmai = typeof filterOutOnlyDWSETTSDmai !== 'undefined' ? filterOutOnlyDWSETTSDmai : false
    period = typeof period !== 'undefined' ? period : 2  // 1=morning 2=noon 3=evening

    let arrStockInfo = []
    const handler = new htmlparser.DomHandler(function (error, dom) {
      if (error)
        console.error(error)
      else {

       let allspan = htmlparser.DomUtils.find( (el)=> {
              return el.type === 'tag' && el.name === 'div' && el.attribs.class === 'col-12 fs-14px mb-3'
            },dom, true, 1000
        )
  
        console.log('allspan' ,allspan, allspan.length)
        //console.log('child' ,allspan.children )
  
        /*alltr.forEach(
          (tr,itr)=> {
                      if(itr < 1000){ 
                        //console.log('itr',itr)
  
                         let tds = htmlparser.DomUtils.find( (el)=> {
                              return el.type === 'tag' && el.name === 'td'
                            },[tr], true, 50
                        )
  
                        //console.log('tds.lenth=', tds.length)
  
                        let textintd = htmlparser.DomUtils.find( (el)=> {
                              return el.type === 'text' || (el.type === 'tag' && el.name === 'a')
                            },tds, true, 50
                        )
  
                        //console.log('textintd.lenth=', textintd.length)
                        if(textintd.length == 9){
                          //console.log('textintdObject=', textintd)
                          const strTime =  textintd[0].data.trim()
                          const strSymbol =  textintd[2].data.trim()
                          const strSource =  textintd[3].data.trim()
                          const strTitle =  textintd[4].data.trim()
                          let posColon = strTime.indexOf(':') // time format is 14 พ.ค. 2563 12:31:04
                          const strHour = strTime.slice(posColon-2,posColon) // to get hours


                          //console.log(textintd)
                          const strLink = textintd[6].attribs.href

                          arrStockInfo.push( shareFunc.newsTodayObject(strTime,strSymbol,strSource,strTitle.slice(0,70),0,strLink,strHour) )

                        }
  
                      }
                  }
        )*/
  
      }
  
    })
  
    let parser = new htmlparser.Parser(handler)
    parser.write(html)
    parser.end()
    return arrStockInfo

}

module.exports.wrapHtmlParserGetStockInfo = wrapHtmlParserGetStockInfo
