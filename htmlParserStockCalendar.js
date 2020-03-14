const htmlparser = require('htmlparser2');
const shareFunc = require('./sharevariables')



function wrapHtmlParser (html) {


    let arrStockCalendar = []
    const handler = new htmlparser.DomHandler(function (error, dom) {
      if (error) {
        console.error(error)
        return
      }
        
      
  
       let alltable = htmlparser.DomUtils.find( (el)=> {
              return el.type === 'tag' && el.name === 'table'
            },dom, true, 1000
        )
  
        //console.log('alltable', alltable)

        let alllink = htmlparser.DomUtils.find( (el)=> {
            return el.type === 'tag' && el.name === 'a'
            },alltable, true, 1000
        )

        //console.log('alllink', alllink)
    
        alllink.forEach((alink,itr)=> {
            const strOnClick = alink.attribs.onclick.replace("calendarDetailLoad('",'').replace("');",'').replace(/amp;/g,'')
            const [strSymbol,strxx] =  alink.children[0].nodeValue.replace(/[\n\s]/g,'').split('-')
            const xDate = new Date( parseInt( strOnClick.split('&')[3].replace('xDate=','') ) )
            const strUrl =  'https://www.set.or.th/' + strOnClick

            //console.log('alink data:',strSymbol,strUrl)
            arrStockCalendar.push( shareFunc.calendarObject(strSymbol,strxx,xDate,strUrl ) )

        }) 
        

  
    })
  
    let parser = new htmlparser.Parser(handler)
    parser.write(html)
    parser.end()
    return arrStockCalendar

}

module.exports.wrapHtmlParserStockCalendar = wrapHtmlParser
