const htmlparser = require("htmlparser2");
const shareFunc = require('./sharevariables')



function wrapHtmlParser (html,filterOutOnlyDWSETTSDmai) {

    filterOutOnlyDWSETTSDmai = typeof filterOutOnlyDWSETTSDmai !== 'undefined' ? filterOutOnlyDWSETTSDmai : false
    let arrNewsToday = []
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

                          //console.log(textintd)
                          const strLink = textintd[6].attribs.href

                          const isDWSETTSDmai = shareFunc.isDWSETTSDmai(strSymbol)

                          let boolAddToArray = false

                          if (filterOutOnlyDWSETTSDmai && !isDWSETTSDmai){
                            boolAddToArray = true
                          }else if ( shareFunc.isNeedTopics(strTitle) && !isDWSETTSDmai)  {
                            boolAddToArray = true
                          }else if (strTitle.match(/ต้อนรับ/)){
                            boolAddToArray = true
                            
                          }

                          if (boolAddToArray)  arrNewsToday.push( shareFunc.newsTodayObject(strTime,strSymbol,strSource,shareFunc.highlightNewsTopic(strTitle),0,strLink) )
  
                        }
  
                      }
                  }
        )
  
      }
  
    })
  
    let parser = new htmlparser.Parser(handler)
    parser.write(html)
    parser.end()
    return arrNewsToday

}

module.exports.wrapHtmlParserNewsToday = wrapHtmlParser
