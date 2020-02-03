const urlnews =  'https://www.set.or.th/set/newslist.do?headline=&source=&symbol=&submit=%E0%B8%84%E0%B9%89%E0%B8%99%E0%B8%AB%E0%B8%B2&newsGroupId=&securityType=&language=th&country=TH'
const htmlparser = require("htmlparser2")
const shareFunc = require('./sharevariables')

let yesterdayDate = new Date()
yesterdayDate.setDate(yesterdayDate.getDate()-1);
let passdaysDate = new Date()

let fd=passdaysDate.getDate(), fm=passdaysDate.getMonth()+1 ,fy=passdaysDate.getFullYear()
let td=yesterdayDate.getDate(), tm=yesterdayDate.getMonth()+1 ,ty=yesterdayDate.getFullYear()

let arrAllPassNews = []

function wrapHtmlParser (html,intPage) {
    let arrNews = []
    const handler = new htmlparser.DomHandler(function (error, dom) {
      if (error)
        console.error('error in DomHandler')
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
                              return el.type === 'text'
                            },tds, true, 50
                        )
  
                        //console.log('textintd.lenth=', textintd.length)
                        if(textintd.length >= 8){
  
                          const strTime =  textintd[0].data.trim()
                          const strSymbol =  textintd[2].data.trim()
                          const strSource =  textintd[3].data.trim()
                          const strTitle =  textintd[4].data.trim()
  
                          //console.log(textintd)
                          //const rowString = `Page ${intPage+1}-${itr} / ${strTime} ${strSymbol} ${strSource} ${strTitle}`
                          const isDWSETTSDmai = shareFunc.isDWSETTSDmai(strSymbol)
  
                          if ( shareFunc.isNeedTopics(strTitle) && !isDWSETTSDmai )  {
                            arrNews.push(shareFunc.newsTodayObject(strTime,strSymbol,strSource,shareFunc.highlightNewsTopic(strTitle)))
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
    //console.log(body)
    const str1 = '<strong>รวม'
    const str2 = 'หัวข้อข่าว</strong>'
    const posStart = body.indexOf(str1) + str1.length
    const posEnd = body.indexOf(str2,posStart)
    if(posEnd < posStart) throw 'Cannot find Total Page in function substringTogetPageNumber'
    const strNumberOfNews = body.slice(posStart,posEnd).trim().replace(/,/g,'')
    const intNumberOfPage = Math.ceil(parseInt(strNumberOfNews)/20)

    //console.log(strNumberOfNews.slice(0,13),'news',intNumberOfPage,'pages') 
    return intNumberOfPage
}

async function processNewsByPage(url,intPage){

    const res = await fetch(url)
    const body = await res.text()
    let arr = wrapHtmlParser(body,intPage)
    arrAllPassNews = [...arrAllPassNews , ...arr]

}

async function processPassNews(intPage){
    for(let i =0; i < intPage  ; i++){
        let paranews = `&from=${fd}%2F${fm}%2F${fy}&to=${td}%2F${tm}%2F${ty}&currentpage=${i}`
  
        await processNewsByPage(urlnews+paranews,i)
  
    }
    
}

async function getAllNumberOfPageAndProcess(inputPassDay){
  passdaysDate = new Date()
  passdaysDate.setDate(passdaysDate.getDate()-(inputPassDay));

  fd=passdaysDate.getDate(), fm=passdaysDate.getMonth()+1 ,fy=passdaysDate.getFullYear()
  td=yesterdayDate.getDate(), tm=yesterdayDate.getMonth()+1 ,ty=yesterdayDate.getFullYear()


    let paranews =  `&from=${fd}%2F${fm}%2F${fy}&to=${td}%2F${tm}%2F${ty}&currentpage=0`

    const res = await fetch(urlnews+paranews)
    const body = await res.text()
    let intPage 
    try {
      intPage= substringTogetPageNumber(body)
    } catch (error) {
      intPage = 0
    }
    

    await processPassNews(intPage)

    // fetch(urlnews+paranews)
    //     .then(res => res.text())
    //     .then(body => substringTogetPageNumber(body))
    //     .then(intPage => processPassNews(intPage)) 
    //     .catch(err => console.error('Error:',err) )

    return arrAllPassNews

}

module.exports.getAllNumberOfPageAndProcess = getAllNumberOfPageAndProcess