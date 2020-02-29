const urlnews =  'https://www.set.or.th/set/companynews.do?ssoPageId=8&language=th&country=TH'
const htmlparser = require('htmlparser2')
const shareFunc = require('./sharevariables')

let arrAllNews = []
let stockName = ''

function wrapHtmlParser (html,intPage) {
  let arrNews = []
    const handler = new htmlparser.DomHandler(function (error, dom) {
      if (error)
        console.error(error)
      else {
  
       let alltr = htmlparser.DomUtils.find( (el)=> {
              return el.type === 'tag' && el.name === 'tr'
            },dom, true, 1000
        )
  
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
                        if(textintd.length == 8){
  
                          const strTime =  textintd[0].data.trim()
                          const strSymbol =  textintd[2].data.trim()
                          const strTitle =  textintd[3].data.trim()

                          //console.log(textintd)
                          const strLink = textintd[5].attribs.href
  
                          //console.log(textintd)
                          //const rowString = `Page ${intPage+1}-${itr} / ${strTime} ${strSymbol} ${strTitle}`
  
                          if (shareFunc.isNeedTopics(strTitle)) { 
                            arrNews.push(shareFunc.newsTodayObject(strTime,strSymbol, '',shareFunc.highlightNewsTopic(strTitle), intPage+1,strLink))
                            //console.log(rowString)
                          }
  
                        }
  
                      }
                  }
        )
  
      }
  
    })
  
  let parser = new htmlparser.Parser(handler)
  parser.write(html)
  parser.end()
  return arrNews
}
  
function substringTogetPageNumber(body){

    const str1 = '<strong>รวม'
    const str2 = 'หัวข้อข่าว</strong>'
    const posStart = body.indexOf(str1) + str1.length
    const posEnd = body.indexOf(str2,posStart)
    const strNumberOfNews = body.slice(posStart,posEnd).trim().replace(/,/g,'')
    const intNumberOfPage = Math.ceil(parseInt(strNumberOfNews)/20)

    return intNumberOfPage
}

async function processNewsByPage(url,intPage){
  
  // let res = await fetch(url)
  // let body = await res.text()
  // wrapHtmlParser(body,intPage)

  const res = await fetch(url)
  const body = await res.text()
  let arr = wrapHtmlParser(body,intPage)
  //console.log(body.slice(0,400),arr,intPage)
  arrAllNews = [...arrAllNews , ...arr]

}

async function processPassNews(intPage){
  for(let i =0; i < intPage  ; i++){
      let paranews = `&symbol=${stockName}&currentpage=${i}`
      
      //console.log('Process ', paranews)
      await processNewsByPage(urlnews+paranews,i)

  }
  
}

async function getAllNumberOfPageAndProcess(stockSymbol,intPagesearchParam){
    arrAllNews = []
    stockName = stockSymbol
    let intPagesearch = 1
    //console.log('getAllNumberOfPageAndProcess',stockSymbol,stockName)
    let paranews =  `&symbol=${stockName}&currentpage=0`
    //console.log(urlnews+paranews)

    const res = await fetch(urlnews+paranews)
    const body = await res.text()
    const intPage = substringTogetPageNumber(body)

    if (intPagesearchParam < intPage) {
      intPagesearch = intPagesearchParam
    }else{
      intPagesearch = intPage
    }

    await processPassNews(intPagesearch)
    // fetch(urlnews+paranews)
    // .then(res => res.text())
    // .then(body => substringTogetPageNumber(body) )  
    // .then(intPage => processPassNews(intPage)) 

    return arrAllNews
}


module.exports.getAllNumberOfPageAndProcess = getAllNumberOfPageAndProcess