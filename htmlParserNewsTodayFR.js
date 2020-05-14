const htmlparser = require('htmlparser2');
const shareFunc = require('./sharevariables')



function wrapHtmlParser (html,filterOutOnlyDWSETTSDmai,period) {

    filterOutOnlyDWSETTSDmai = typeof filterOutOnlyDWSETTSDmai !== 'undefined' ? filterOutOnlyDWSETTSDmai : false
    period = typeof period !== 'undefined' ? period : 2  // 1=morning 2=noon 3=evening

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
                          let criteriaHourBegin,criteriaHourEnd
                          if (period === 1) {
                            criteriaHourBegin='01'
                            criteriaHourEnd = '10'
                          }else if (period === 2) {
                            criteriaHourBegin='12'
                            criteriaHourEnd = '15'
                          }else if (period === 3 ){
                            criteriaHourBegin='16'
                            criteriaHourEnd = '23'
                          }
                          //console.log(strTime,strHour)

                          //console.log(textintd)
                          const strLink = textintd[6].attribs.href

                          let boolAddToArray = false

                          if ( shareFunc.isNeedTopicsFR(strTitle) && (strHour >= criteriaHourBegin && strHour <= criteriaHourEnd) )  {
                            boolAddToArray = true
                          }

                          if (boolAddToArray )  arrNewsToday.push( shareFunc.newsTodayObject(strTime,strSymbol,strSource,strTitle,0,strLink,strHour) )  //&& strSymbol === 'MC' for fix bug
  
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

module.exports.wrapHtmlParserNewsTodayFR = wrapHtmlParser
