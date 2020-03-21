'use strict';

(function(){

const axios = require('axios')
const newsToday = require('./htmlParserNewsToday')
const newsTodayFR = require('./htmlParserNewsTodayFR')
const newsPass = require('./htmlParserNewsPass')
const newsStock = require('./htmlParserNewsStock')
const stockCalendar = require('./htmlParserStockCalendar')
const set100 = require('./htmlParserSet100')
const shareFunc = require('./sharevariables')

//const topValue="<h3>��Ť�ҫ��͢�� 20 �ѹ�Ѻ</h3>"
//const topVolume="<h3>����ҳ���͢�� 20 �ѹ�Ѻ</h3>"

let topGain="<h3>�Ҥ�������� 20 �ѹ�Ѻ</h3>"
let topLoss="<h3>�Ҥ�Ŵŧ 20 �ѹ�Ѻ</h3>"

//topGain="<h3>ราคาเพิ่มขึ้น 20 อันดับ</h3>"
//topLoss="<h3>ราคาลดลง 20 อันดับ</h3>"

//topGain="<h3>Top 20 Gainers</h3>"
//topLoss="<h3>Top 20 Losers</h3>"

const endofTopLoss="</body>"
const objFilterParam = {minVolume: 900000, minLastPrice: 0.1 ,minUpDownStep : 2 }

const urlStockSET="https://www.settrade.com/C13_MarketSummary.jsp?order=Y"
const urlStockMAI="https://www.settrade.com/C13_MarketSummary.jsp?order=Y&market=mai"
const urlWrSET="https://www.settrade.com/C13_MarketSummary.jsp?detail=RANKING&order=Y&market=SET&type=W"
const urlWrMAI="https://www.settrade.com/C13_MarketSummary.jsp?detail=RANKING&order=Y&market=mai&type=W"

let recToProcess = [
  {url:urlStockSET,header:"Stock SET",displayDiv:"col1",displayDiv2:"col5"},
  {url:urlStockMAI,header:"Stock MAI",displayDiv:"col2",displayDiv2:"col6"},
  {url:urlWrSET,header:"Warrent SET",displayDiv:"col3",displayDiv2:"col7"},
  {url:urlWrMAI,header:"Warrent MAI",displayDiv:"col4",displayDiv2:"col8"}
]

let arrAllStockPrice = []

function showInfo(strInfo){
  let d= new Date()
  document.getElementById("InforBar").innerHTML = "Data as of: " + d.toLocaleString() 

}

function CheckVolume(obj) {

  //return obj.Volume > 1000000 && obj.LastPrice > 0.09 
  return obj.Volume >= objFilterParam.minVolume && obj.LastPrice >= objFilterParam.minLastPrice && obj.UpDownStep >= objFilterParam.minUpDownStep 

}

function getOnlyXRec(obj,index){
  let switchFilter = document.getElementById("switchFilter")
  let maxRec = switchFilter.checked ? 15 : 20
  return index < maxRec
}

function ExtractValueToObject(strRow){
  let obj = {}
  let i = 0 , strValue = ""
  let posBegin = 0, posEnd = 0, stepPrice = 0

  for (i=0; i<=5; i++){
    posBegin = strRow.indexOf(">")
    posEnd = strRow.indexOf("</td>")
    strValue = strRow.slice(posBegin + ">".length, posEnd)

    if (posBegin>=0 && posEnd>=0) {
      if (i==0){
        obj.StockName = strValue
      }else if (i==1){
        obj.Volume = Number(strValue.trim().replace(/,/g,""))
      }else if (i==2){
        obj.LastPrice = Number(strValue.trim().replace(/,/g,""))
      }else if (i==3){
        obj.PriceChange = Number(strValue.trim().replace(/,/g,""))
      }else if (i==4){
        obj.PriceChangePercent = Number(strValue.trim().replace(/,/g,""))
      }
      
    }
    strRow = strRow.slice(posEnd + "</td>".length)
  }
  
  if (obj.LastPrice <=2.02) {
    stepPrice = 0.01
  }else if (obj.LastPrice <= 5.05) {
    stepPrice = 0.02
  }else if (obj.LastPrice <= 10.1) {
    stepPrice = 0.05
  }else if (obj.LastPrice <= 25.25) {
    stepPrice = 0.1
  }else if (obj.LastPrice <= 100.5) {
    stepPrice = 0.25
  }else if (obj.LastPrice <=201) {
    stepPrice = 0.5
  }else if (obj.LastPrice <402) {
    stepPrice = 1
  }else {
    stepPrice = 2
  }

  obj.UpDownStep = Math.abs(obj.PriceChange/stepPrice)
  //console.log(obj)
  return obj

}

function numberWithCommas(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function DisplayFilterResult(arrFilterResult,subString,strPlusMinus){
  let posBegin = subString.indexOf("<tbody>")
  let posEnd = subString.lastIndexOf("</tbody>")
  let strHeader = subString.slice(0, posBegin + "<tbody>".length)
  let strFooter = subString.slice(posEnd)
  let strRows = "",i =0 ,strStockName = "",strVolume ="", strLastPrice = "", strPriceChange="", strPriceChangePercent ="", strInterpolate = ""
  let strcolor = (strPlusMinus == "" ? "colorRed" : "colorGreen")

  for (i=0; i<arrFilterResult.length;i++){
    strStockName = arrFilterResult[i].StockName
    //strVolume = numberWithCommas(arrFilterResult[i].Volume)
    strVolume = arrFilterResult[i].Volume.toLocaleString()
    strLastPrice = arrFilterResult[i].LastPrice.toFixed(2)
    strPriceChange = arrFilterResult[i].PriceChange.toFixed(2)
    strPriceChangePercent = arrFilterResult[i].PriceChangePercent.toFixed(2)
    strInterpolate = `                    <tr>\r\n                        <td>${strStockName}<\/td>\r\n                        <td>${strVolume}<\/td>\r\n                        <td>${strLastPrice}<\/td>\r\n                        <td class=\"${strcolor}\">${strPlusMinus}${strPriceChange}<\/td>\r\n                        <td class=\"${strcolor}\">${strPlusMinus}${strPriceChangePercent}<\/td>\r\n                    <\/tr>\r\n`
    strRows = strRows + strInterpolate
  }

  //console.log(strHeader + strRows + strFooter)
  return strHeader + strRows + strFooter
   

}

function GetTopGainTopLoss(subString,strPlusMinus) {
  let posBegin = subString.indexOf("<tbody>")
  let posEnd = subString.lastIndexOf("</tbody>")
  let strToprocess = subString.slice(posBegin + "<tbody>".length , posEnd)
  let i = 0, arrObject = []
  let strRow = ""

  for(i=0; i < 20 ; i++ ) {
    posBegin = strToprocess.indexOf("<tr>")
    posEnd = strToprocess.indexOf("</tr>")
    if (posBegin>=0 && posEnd>=0) {
      strRow = strToprocess.slice(posBegin + "<tr>".length , posEnd).trim()
      arrObject.push( ExtractValueToObject(strRow) )
      strToprocess = strToprocess.slice(posEnd + "</tr>".length)
    }else {
      break
    }
  }


  return DisplayFilterResult(arrObject.filter(CheckVolume).filter(getOnlyXRec),subString,strPlusMinus)
}

function loadDoc(i,isFilter) {
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {

      substringHTML(this.responseText,i,isFilter)
    }else if ( this.response && this.status == 0){
      substringHTML("Error cannot load data please check console log. url:" + recToProcess[i].url,i)
    }
  }

  try {
    xhttp.open("GET", recToProcess[i].url, true)
    xhttp.send()
  }catch (err) {
    console.log(err.message)
  }
}

function setFixdTextToSearch (textResult){
  const constTopGainTh="<h3>�Ҥ�������� 20 �ѹ�Ѻ</h3>"
  const constTopLossTh="<h3>�Ҥ�Ŵŧ 20 �ѹ�Ѻ</h3>"
  const constTopGainEn="<h3>Top 20 Gainers</h3>"
  const constTopLossEn="<h3>Top 20 Losers</h3>"

  let posBegin = textResult.indexOf(constTopGainTh)

  if (posBegin < 0 ) {
    topGain=constTopGainEn
    topLoss=constTopLossEn
  }else{
    topGain=constTopGainTh
    topLoss=constTopLossTh
  }

}

function substringHTML(textResult, i, isFilter) {

  //change concept of setFixdTextToSearch sometime result from setTrade is in english
  setFixdTextToSearch (textResult) 
  
  let posBegin = textResult.indexOf(topGain)
  let posEnd = textResult.indexOf(topLoss)
  let subString = textResult.slice(posBegin, posEnd)
  let lastIndex = 0

  if (subString != "") {
    lastIndex = subString.lastIndexOf("</div>")
    subString = subString.slice(0, lastIndex)
    subString = replaceTextToReadable(subString, i, "G")
    if (isFilter) subString = GetTopGainTopLoss(subString, "+")
  }else {
    subString = "error (fn substringHTML 1) subString is blank"
    console.log(textResult)
    console.log("Text topGain:" + topGain)
    console.log("posBegin:" + posBegin)
    console.log("posEnd:" + posEnd)
  }
  document.getElementById(recToProcess[i].displayDiv).innerHTML = subString

  posBegin = textResult.indexOf(topLoss)
  posEnd = textResult.indexOf(endofTopLoss)
  subString = textResult.slice(posBegin, posEnd)
  if (subString != ""){
    subString = subString.replace(/<\/div>/g, "") + "</div>"
    subString = replaceTextToReadable(subString, i, "L")
    if (isFilter) subString = GetTopGainTopLoss(subString, "")
  }else {
    subString = "error (fn substringHTML 2) subString is blank"
    console.log("Text topLoss" + topLoss)
    console.log("posBegin:" + posBegin)
    console.log("posEnd:" + posEnd)
  }
  document.getElementById(recToProcess[i].displayDiv2).innerHTML = subString
}

function replaceTextToReadable(subString,i,typeGorL) {
  let header = ""
  let newheader = ""
  if (typeGorL == 'G') {
    header = topGain
    newheader = " 20 Top Gainer</h6>"
  }else {
    header = topLoss
    newheader = " 20 Top Losser</h6>"
  }
  subString = subString.replace(header, "<h6 class='center-align'>" + recToProcess[i].header + newheader)
  subString = subString.replace("<th>��ѡ��Ѿ��</th>", "<th>หลักทรัพย์</th>")
  subString = subString.replace("<th>����ҳ<br />(���)</th>", "<th>ปริมาณ</th>")
  subString = subString.replace("<th>����ش</th>", "<th>ล่าสุด</th>")
  subString = subString.replace("<th>����¹<br />�ŧ</th>", "<th>เปลี่ยน</th>")
  subString = subString.replace("<th>%����¹<br />�ŧ</th>", "<th>%เปลี่ยน</th>")
  subString = subString.replace(/href=\"\/C13_FastQuote_Main.jsp\?txtSymbol=.*top\"/g, "")
  subString = subString.replace(/&nbsp;/g, "")

  return subString
}

//setTimeout(function, milliseconds, param1, param2, ...)
function clearData () {

  for(let i=0;i<recToProcess.length;i++){
    document.getElementById(recToProcess[i].displayDiv).innerHTML = '<p>Retriving Data..</p>'
    document.getElementById(recToProcess[i].displayDiv2).innerHTML = '<p>Retriving Data..</p>'
  }

  document.getElementById('set100col1').innerHTML = '<p>Retriving Data..</p>'
  document.getElementById('set100col2').innerHTML = '<p>Retriving Data..</p>'
  document.getElementById('set50col1').innerHTML = '<p>Retriving Data..</p>'
  document.getElementById('set50col2').innerHTML = '<p>Retriving Data..</p>'
}

let lastProcessDateTime = null


function startProcessDataWithDelay(){
  let nowDateTime = new Date()
  //console.log(lastProcessDateTime, nowDateTime)
  if (nowDateTime - lastProcessDateTime > 2*1000 || !lastProcessDateTime){
    clearData()
    setTimeout(startProcessData, 100)
    setTimeout(processSet100Set50Call, 100)
    lastProcessDateTime = nowDateTime
  }else {
    lastProcessDateTime = nowDateTime
  }
}


function startProcessData(){

  let switchFilter = document.getElementById("switchFilter")
  for(let i=0;i<recToProcess.length;i++){
    loadDoc(i,switchFilter.checked)
  }
  showInfo("Complete laod data from SETTRADE.")
  console.log( 'startProcessData' )
}

let timeintervalID =  null

function setAutoRefresh () {
  const intervalMilliSec = 3 * 60000
  const btnAutoRefresh = document.getElementById("btnAutoRefresh")

  if (!timeintervalID) {
    timeintervalID = setInterval(startProcessDataWithDelay, intervalMilliSec)
    console.log('Start Auto Refresh', timeintervalID, intervalMilliSec )
    btnAutoRefresh.textContent = 'Stop Auto Refresh'
  } 
  else {
    clearInterval(timeintervalID)
    timeintervalID =  null
    console.log('Stop Auto Refresh',timeintervalID)
    btnAutoRefresh.textContent = 'Start Auto Refresh'
  }

}



function showNewsToday(arrNewsToday){
  
  const strRows = arrNewsToday.map((objNews,i) => `<tr> 
                <td>${i+1}</td>
                <td>${objNews.time}</td> 
                <td>${objNews.symbol}</td> 
                <td>${objNews.title}</td> 
                <td><a href="https://www.set.or.th${objNews.link}" onclick="window.open(this.href,'_blank','width=900,height=900'); return false;">รายละเอียด ${objNews.symbol}</a></td> </tr>`).join('')

  const strTableNews = `
      <table>
        <thead>
          <tr> <th>No.</th> <th style="width:150px;">Time</th> <th style="width:60px;">Symbol</th> <th>Title</th> <th>Link</th></tr>
        </thead>
        <tbody>
          ${strRows}
        </tbody>
        </table>
  `
  document.getElementById('newstodaylist').innerHTML = strTableNews
  document.getElementById('numOfTodayNews').innerHTML = arrNewsToday.length.toString() + ' news'
}

function showNewsTodayFR(arrNewsToday){

  arrNewsToday = arrNewsToday.sort(function(a,b){ return b.improvementFR - a.improvementFR})
  
  const strRows = arrNewsToday.map((objNews,i) => `<tr> 
                <td>${i+1}</td> 
                <td>${objNews.time}</td> 
                <td>${objNews.symbol}</td> 
                <td>${objNews.title}</td> 
                <td>${objNews.lastProfit}</td>
                <td>${objNews.curProfit}</td>
                <td class="${(objNews.improvementFR>0)? 'colorGreen':'colorRed'}">${objNews.improvementFR}</td>
                <td>${objNews.curPE}</td>
                <td>${objNews.price}</td>
                <td><a href="https://www.set.or.th${objNews.link}" onclick="window.open(this.href,'_blank','width=900,height=900'); return false;">รายละเอียด ${objNews.symbol}</a></td> 
                </tr>`).join('')

  const strTableNews = `
      <table>
        <thead>
          <tr> 
          <th>No.</th>
          <th style="width:150px;">Time</th>
          <th style="width:60px;">Symbol</th>
          <th>Title</th>
          <th>Profit From</th>
          <th>Profit To</th> 
          <th>%Improvement</th>
          <th>Cur PE</th>
          <th>Price</th>
          <th>Link</th>
          </tr>
        </thead>
        <tbody>
          ${strRows}
        </tbody>
        </table>
  `
  document.getElementById('newstodaylistFR').innerHTML = strTableNews
}

function processNewsTodayFR() {
  processNewsToday(true)
}

function processNewsTodayNotFR() {
  processNewsToday(false)
}

function strToFloatFR(str) {
  let strNum = str.replace(/,/g,'').replace(/(แก้ไข)/g,'')
  const isNegative = (strNum.indexOf('(')>=0)? true : false
  strNum = strNum.replace('(','').replace(')','')
  let numFloat = shareFunc.textToFloat(strNum)
  return (isNegative) ? -numFloat : numFloat
}

function getStockPrice(symbol){
  const regex1 = new RegExp('^' + symbol + '$') //fix bug THAI SITHAI STHAI and JCK JCKH
  const objStock = arrAllStockPrice.find(function (e){ return regex1.test(e.symbol) })
  return objStock
}

function searchFRprofit(str,element,i) {
  //search for  กำไร (ขาดทุน) เป็นพันบาท
  const strFix1 = '(ขาดทุน)'
  const strFixEPS = 'สุทธิ'
  let posBegin = str.indexOf(strFix1)
  let posEnd = str.indexOf('\n',posBegin)
  let subString = str.slice(posBegin + strFix1.length, posEnd).trim()
  console.log('posBegin',posBegin,'posEnd',posEnd,'subString',subString)
  let posSpace = subString.indexOf(' ')
  let strProfitCurrent = subString.slice(0,posSpace).trim()
  let strProfitLast = subString.slice(posSpace).trim()
  let numProfitCurrent = strToFloatFR(strProfitCurrent)
  let numProfitLast = strToFloatFR(strProfitLast)

  //search for  กำไร (ขาดทุน) เป็นeps
  let posBeginEPS = str.indexOf(strFixEPS,posEnd)
  let posEndEPS = str.indexOf('\n',posBeginEPS)
  let subStringEPS = str.slice(posBeginEPS + strFixEPS.length, posEndEPS).trim()
  console.log('posBeginEPS',posBeginEPS,'posEndEPS',posEndEPS,'subStringEPS',subStringEPS)
  let posSpaceEPS = subStringEPS.indexOf(' ')
  let strProfitCurrentEPS = subStringEPS.slice(0,posSpaceEPS).trim()
  let strProfitLastEPS = subStringEPS.slice(posSpaceEPS).trim()
  let numEPSCurrent = strToFloatFR(strProfitCurrentEPS)
  let numEPSLast = strToFloatFR(strProfitLastEPS)
  let objStock = getStockPrice(element.symbol)
  console.log('objStock',objStock)
  let stockPrice = ( objStock != undefined)? objStock.price : 0


  if (numProfitCurrent > 0) {
    element.improvementFR  = (numProfitCurrent-numProfitLast)*100/ Math.abs(numProfitLast) 
    element.curPE = (stockPrice >0)? stockPrice/numEPSCurrent : 0
  } else {
    element.improvementFR = parseFloat('-100.00')
    element.curPE = parseFloat('-10.00')
  }

  element.improvementFR 
  element.lastProfit = numProfitLast
  element.curProfit = numProfitCurrent
  element.lastEPS = numEPSLast
  element.curEPS = numEPSCurrent
  element.price = stockPrice

  console.log(i, element.symbol,'element.lastProfit',element.lastProfit,'element.curProfit',element.curProfit,'element.lastEPS',element.lastEPS,'element.curEPS',element.curEPS,'element.improvementFR',element.improvementFR,'element.curPE',element.curPE,'stockPrice',stockPrice)

}


function getAndCalFRImprove(arr,delayGetDetailFR){

  const progressFR = document.getElementById('progressFR')
  const lenFR = arr.length
  arr.forEach((element,i) => {
    
    setTimeout(() => {
      axios('https://www.set.or.th' + element.link).then(function (response){


        searchFRprofit(response.data,element,i)

        progressFR.innerHTML=(i+1).toString() + '/' + lenFR.toString()

      }).catch(function (error){
        console.log(element.symbol, 'getAndCalFRImprove axios error',error.message)
      })
    }, (i+2)*delayGetDetailFR);


  })
}

function getAllStockLastPrice(){
  const url1 = 'https://www.settrade.com/C13_MarketSummary.jsp?detail=STOCK_TYPE&order=N&market=SET&type=S'
  const url2 = 'https://www.settrade.com/C13_MarketSummary.jsp?detail=STOCK_TYPE&order=N&market=mai&type=S'
  arrAllStockPrice = []
  axios(url1).then(function (response){

      arrAllStockPrice = arrAllStockPrice.concat(set100.wrapHtmlParserSet100(response.data))
      console.log('arrAllStockPrice',arrAllStockPrice)

  }).catch(function (error){
      console.log('getAllStockLastPrice axios error 1',error.message,url1)
  })

  axios(url2).then(function (response){

    arrAllStockPrice = arrAllStockPrice.concat(set100.wrapHtmlParserSet100(response.data)) 
    console.log('arrAllStockPrice',arrAllStockPrice)

  }).catch(function (error){
    console.log('getAllStockLastPrice axios error 2',error.message,url2)
  })

}

function processNewsToday(FRflag=false) {
  let xhttp = new XMLHttpRequest()
  const delayGetDetailFR = 200 //milisecs
  const urlTodayNews = 'https://www.set.or.th/set/todaynews.do?period=all&language=th&country=TH&market='
  const urlTodayNewsFR = 'https://www.set.or.th/set/searchtodaynews.do?source=&symbol=&securityType=&newsGroupId=&headline=%E0%B8%AA%E0%B8%A3%E0%B8%B8%E0%B8%9B%E0%B8%9C%E0%B8%A5%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%94%E0%B8%B3%E0%B9%80%E0%B8%99%E0%B8%B4%E0%B8%99%E0%B8%87%E0%B8%B2%E0%B8%99&submit=%E0%B8%84%E0%B9%89%E0%B8%99%E0%B8%AB%E0%B8%B2&language=th&country=TH'
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {

      if(!FRflag){
        let arrNewsToday = newsToday.wrapHtmlParserNewsToday(this.responseText)
        showNewsToday([shareFunc.newsTodayObject('Retriving data..','','','') ])
        setTimeout(showNewsToday, 500,arrNewsToday)
      }else{
        let arrNewsTodayFR = newsTodayFR.wrapHtmlParserNewsTodayFR(this.responseText)
        //arrNewsTodayFR = arrNewsTodayFR.filter(function(s) { return s.symbol == 'WORLD'})
        getAllStockLastPrice()
        console.log('onreadystatechange arrAllStockPrice',arrAllStockPrice)
        getAndCalFRImprove(arrNewsTodayFR,delayGetDetailFR)
        setTimeout(showNewsTodayFR, (arrNewsTodayFR.length+4) * delayGetDetailFR,arrNewsTodayFR)
      }


    }else if ( this.response && this.status == 0){
      console.log('Error : in processNewsToday',FRflag)
    }
  }

  try {
    const url = (FRflag)? urlTodayNewsFR : urlTodayNews 
    xhttp.open("GET", url, true)
    xhttp.send()
  }catch (err) {
    console.log(err.message)
  }
}

function showNewsPass(arrNews){
  
  const strRows = arrNews.map((objNews,i) => `<tr> 
                  <td>${i+1}</td>
                  <td>${objNews.time}</td> 
                  <td>${objNews.symbol}</td> 
                  <td>${objNews.title}</td> 
                  <td><a href="https://www.set.or.th${objNews.link}" onclick="window.open(this.href,'_blank','width=900,height=900'); return false;">รายละเอียด ${objNews.symbol}</a></td> </tr>`).join('')


  const strTableNews = `
      <table>
        <thead>
          <tr> <th>No.</th> <th style="width:150px;">Time</th> <th style="width:60px;">Symbol</th> <th>Title</th> </tr>
        </thead>
        <tbody>
          ${strRows}
        </tbody>
        </table>
  `
  document.getElementById('newspasslist').innerHTML = strTableNews
  document.getElementById('numOfPassNews').innerHTML = arrNews.length.toString() + ' news'
}

async function processNewsPass(){
  // know bug เนื่องจากหน้าจอ ค้นหาของจริง จะใส่วันหยุด เป็น from to ไม่ได้ แต่ program กำหนดวันเอง จากจำนวนวันย้อนหลัง ทำให้มีวันหยุด ทำให้ข้อมูลเบิ้ล เช่น วันนี้วันอาทิตย์แล้วค้นย้อน 2 วันใน เพื่อให้ได้ข้อมูลวันศุกร์ เอ๊ะ หรือว่าเพราะ 29-feb-2020 
  document.getElementById('btnRefreshPassNews').disabled =true
  showNewsPass([shareFunc.newsTodayObject('Retriving data..','','','') ])

  const inputPassDay = document.getElementById('passday')

  const intPassDay = isNaN(parseInt(inputPassDay.value)) ? 0 : parseInt(inputPassDay.value)

  const arrPassNews = intPassDay == 0 ? [shareFunc.newsTodayObject('Invalid number of days.','','','') ] : await newsPass.getAllNumberOfPageAndProcess(intPassDay)

  showNewsPass(arrPassNews) 

  document.getElementById('btnRefreshPassNews').disabled =false
}

function showNewsStock(arrNews){
  
  const strRows = arrNews.map((objNews,i) => `<tr> 
                  <td>${i+1}</td>
                  <td>${objNews.time}</td> <td>${objNews.symbol}</td> <td>${objNews.title}</td>  
                  <td><a href="https://www.set.or.th${objNews.link}" onclick="window.open(this.href,'_blank','width=900,height=900'); return false;">รายละเอียด</a></td> <td>${objNews.page}</td> </tr>`).join('')

  const strTableNews = `
      <table>
        <thead>
          <tr> <th>No.</th> <th style="width:150px;">Time</th> <th style="width:60px;">Symbol</th> <th>Title</th> <th>Link</th> <th>Page</th> </tr>
        </thead>
        <tbody>
          ${strRows}
        </tbody>
        </table>
  `
  document.getElementById('newsstocklist').innerHTML = strTableNews
  document.getElementById('numOfStockNews').innerHTML = arrNews.length.toString() + ' news'
  
}

async function processNewsStock(){
  let inputStock = document.getElementById('stocksymbol')
  const errorMsg = document.getElementById('stocksymbolerrormsg')
  let inputPagesearch = document.getElementById('pagesearch') 

  if (inputStock.value === '') {
    errorMsg.innerHTML ='Please input symbol'
    return
  }else{
    errorMsg.innerHTML =''
  }

  const intPagesearch = isNaN(parseInt(inputPagesearch.value)) ? 1 : parseInt(inputPagesearch.value)

  console.log('processNewsStock',inputStock.value.toUpperCase(),intPagesearch)
  
  showNewsStock([shareFunc.newsTodayObject('Retriving data..','','','','') ])
  const arrPassNews = await newsStock.getAllNumberOfPageAndProcess(inputStock.value.toUpperCase(),intPagesearch)
  showNewsStock(arrPassNews) 
}


function ShowSet100Set50(arrObjSet,idDivGain,idDivLoss,titleGain,titleLoss){

  const strTableTemplate = `
  <h6 class="center-align">Stock <title/></h6>

  <table class="table table-info" width="100%">
  <thead>
    <tr>
        <th>หลักทรัพย์</th>
        <th>ปริมาณ</th>
        <th>ล่าสุด</th>
        <th>เปลี่ยน</th>
        <th>%เปลี่ยน</th>
    </tr>
  </thead>
  <tbody>                    
      <tablerow/>
  </tbody>
  </table> `
  const rectoshow = 20
  const arrTopGain = arrObjSet.filter(function(a){return a.percentChange > 0})
  const arrTop10Gain = arrTopGain.length >= rectoshow ? arrTopGain.slice(0,rectoshow) : arrTopGain
  const strRowsGain = arrTop10Gain.map(obj => `<tr> 
                                              <td><a class="link-stt">${obj.symbol}${obj.flag}</a></td>
                                              <td>${obj.volume}</td>
                                              <td>${obj.price.toFixed(2)}</td>
                                              <td class="colorGreen">${obj.change}</td>
                                              <td class="colorGreen">+${obj.percentChange.toFixed(2)}</td>
                                              </tr>`).join('')

  let strTableGain = strTableTemplate.replace('<title/>',titleGain)
  strTableGain = strTableGain.replace('<tablerow/>',strRowsGain)
  idDivGain.innerHTML = strTableGain

  const arrTopLoss = arrObjSet.filter(function(a){return a.percentChange < 0}).reverse()
  const arrTop10Loss = arrTopLoss.length >= rectoshow ? arrTopLoss.slice(0,rectoshow) : arrTopLoss
  const strRowsLoss = arrTop10Loss.map(obj => `<tr> 
                                              <td><a class="link-stt">${obj.symbol}${obj.flag}</a></td>
                                              <td>${obj.volume}</td>
                                              <td>${obj.price.toFixed(2)}</td>
                                              <td class="colorRed">${obj.change}</td>
                                              <td class="colorRed">${obj.percentChange.toFixed(2)}</td>
                                            </tr>`).join('')

  let strTableLoss = strTableTemplate.replace('<title/>',titleLoss)
  strTableLoss = strTableLoss.replace('<tablerow/>',strRowsLoss)

  idDivLoss.innerHTML = strTableLoss
}

function processSet100Set50(url,idDivGain,idDivLoss,titleGain,titleLoss){
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {

      let arrObjSet = set100.wrapHtmlParserSet100(this.responseText)
      arrObjSet.sort(function(a,b){ return b.percentChange - a.percentChange})
      //console.log(arrObjSet)
      ShowSet100Set50(arrObjSet,idDivGain,idDivLoss,titleGain,titleLoss)

    }else if ( this.response && this.status == 0){
      console.log('Error : in processSet100Set50')
    }
  }

  try {
    xhttp.open("GET", url, true)
    xhttp.send()
  }catch (err) {
    console.log(err.message)
  }
}

function hideunhidediv(arrdiv) {
  arrdiv.forEach ( (x)=> {
    if (x.style.display === "none") {
      x.style.display = "block"
    } else {
      x.style.display = "none"
    }
  })

}

function hideunhideSetMai() {
  const divSetMaiGain = document.getElementById("divTopGain")
  const divSetMaiLoss = document.getElementById("divTopLoss")
  hideunhidediv([divSetMaiGain,divSetMaiLoss])
}

function hideunhideSet100() {
  const divSet100 = document.getElementById("divTopGainSet100")
  hideunhidediv([divSet100])

}

function refreshSetMai() {
  startProcessData()
}

function processSet100Set50Call() {
  const urlSet100 = 'https://www.settrade.com/C13_MarketSummary.jsp?detail=SET100&order=N&industry=&sector=&market=SET&sectorName=O_SET100'
  const urlSet50 = 'https://www.settrade.com/C13_MarketSummary.jsp?detail=SET50&order=N&industry=&sector=&market=SET&sectorName=O_SET50'
  const divSet100Gain = document.getElementById('set100col1')
  const divSet100Loss = document.getElementById('set100col2')
  const divSet50Gain = document.getElementById('set50col1')
  const divSet50Loss = document.getElementById('set50col2')
  processSet100Set50(urlSet100,divSet100Gain,divSet100Loss,'SET 100 Top Gainer','SET 100 Top Losser')
  processSet100Set50(urlSet50,divSet50Gain,divSet50Loss,'SET 50 Top Gainer','SET 50 Top Losser')
}


function ShowSet100Set50Swing(arrObjSet,idDivGain,idDivLoss,titleGain,titleLoss){

  const strTableTemplate = `
  <h6 class="center-align">Stock <title/></h6>

  <table class="table table-info" width="100%">
  <thead>
    <tr>
        <th>No.</th>
        <th>หลักทรัพย์</th>
        <th>ปริมาณ</th>
        <th>ล่าสุด</th>
        <th>เปลี่ยน</th>
        <th>%เปลี่ยน</th>
        <th>%Swing</th>
        <th>Low</th>
        <th>High</th>
        <th>จำนวนช่อง</th>
    </tr>
  </thead>
  <tbody>                    
      <tablerow/>
  </tbody>
  </table> `
  const rectoshow = 50
  //const arrTopGain = arrObjSet.filter(function(a){return a.swingPercent > 0})
  const arrTopSwing = arrObjSet.length >= rectoshow ? arrObjSet.slice(0,rectoshow) : arrObjSet
  const strRowsGain = arrTopSwing.map((obj,i) => `<tr> 
                                              <td>${i+1}</td>
                                              <td><a class="link-stt">${obj.symbol}${obj.flag}</a></td>
                                              <td>${obj.volume}</td>
                                              <td>${obj.price.toFixed(2)}</td>
                                              <td class="${(obj.percentChange>=0)? 'colorGreen':'colorRed'}">${obj.change}</td>
                                              <td class="${(obj.percentChange>=0)? 'colorGreen':'colorRed'}">${(obj.percentChange>0)? '+':''}${obj.percentChange.toFixed(2)}</td>
                                              <td class="colorGreen">${obj.swingPercent.toFixed(2)}</td>
                                              <td>${obj.low.toFixed(2)}</td>
                                              <td>${obj.high.toFixed(2)}</td>
                                              <td>${obj.stepPrice}</td>
                                              </tr>`).join('')

  let strTableGain = strTableTemplate.replace('<title/>',titleGain)
  strTableGain = strTableGain.replace('<tablerow/>',strRowsGain)
  idDivGain.innerHTML = strTableGain

  const arrTopLoss = arrObjSet
  const arrTopLowSwing = arrTopLoss.length >= rectoshow ? arrTopLoss.slice(rectoshow) : arrTopLoss
  const strRowsLoss = arrTopLowSwing.map((obj,i)=> `<tr>
                                              <td>${rectoshow+i+1}</td>
                                              <td><a class="link-stt">${obj.symbol}${obj.flag}</a></td>
                                              <td>${obj.volume}</td>
                                              <td>${obj.price.toFixed(2)}</td>
                                              <td class="${(obj.percentChange>=0)? 'colorGreen':'colorRed'}">${obj.change}</td>
                                              <td class="${(obj.percentChange>=0)? 'colorGreen':'colorRed'}">${(obj.percentChange>0)? '+':''}${obj.percentChange.toFixed(2)}</td>
                                              <td class="colorGreen">${obj.swingPercent.toFixed(2)}</td>
                                              <td>${obj.low.toFixed(2)}</td>
                                              <td>${obj.high.toFixed(2)}</td>
                                              <td>${obj.stepPrice}</td>
                                            </tr>`).join('')

  let strTableLoss = strTableTemplate.replace('<title/>',titleLoss)
  strTableLoss = strTableLoss.replace('<tablerow/>',strRowsLoss) 

  idDivLoss.innerHTML = strTableLoss
}

function refreshSet100Swing(){
  const urlSet100 = 'https://www.settrade.com/C13_MarketSummary.jsp?detail=SET100&order=N&industry=&sector=&market=SET&sectorName=O_SET100'
  const divSet100Swing = document.getElementById('set100swingcol1')
  const divSet100Swing2 = document.getElementById('set100swingcol2')

  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {

      let arrObjSet = set100.wrapHtmlParserSet100(this.responseText)
      arrObjSet.sort(function(a,b){ return b.swingPercent - a.swingPercent})
      //arrObjSet.sort(function(a,b){ return b.stepPrice - a.stepPrice})
      //console.log(arrObjSet)
      ShowSet100Set50Swing(arrObjSet,divSet100Swing,divSet100Swing2,'Set 100 Swing','Set 100 Swing')

    }else if ( this.response && this.status == 0){
      console.log('Error : in processSet100Set50')
    }
  }

  try {
    xhttp.open("GET", urlSet100, true)
    xhttp.send()
  }catch (err) {
    console.log(err.message)
  }
}

function nameDayofWeek(intDay){
  const daysofweek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  if (intDay >=0 && intDay <=6) 
    return daysofweek[intDay]
  else
    return ''
}

function showSet100Calendar(arr){
  
  const strRows = arr.map((obj,i) => `<tr> 
                  <td>${i+1}</td>
                  <td>${ nameDayofWeek(obj.xdate.getDay()) + ' ' + obj.xdate.getDate() +'-'+ (obj.xdate.getMonth()+1) +'-'+ obj.xdate.getFullYear()}</td> 
                  <td>${obj.symbol}</td> 
                  <td>${obj.xx}</td>  
                  <td><a href="${obj.url}" onclick="window.open(this.href,'_blank','width=900,height=900'); return false;">รายละเอียด</a></td>  </tr>`).join('')

  const strTableNews = `
      <table>
        <thead>
          <tr> <th>No.</th> <th>Date</th> <th >Symbol</th> <th>XType</th> <th>Link</th></tr>
        </thead>
        <tbody>
          ${strRows}
        </tbody>
        </table>
  `
  document.getElementById('stockCalendar').innerHTML = strTableNews
  
}
function filterStockSet100andShow(arrAllStockCalendarXD){
  const url1 = 'https://www.settrade.com/C13_MarketSummary.jsp?detail=SET100&order=N&industry=&sector=&market=SET&sectorName=O_SET100'

  let arrStockSet100 = []
  axios(url1).then(function (response){

      arrStockSet100 = set100.wrapHtmlParserSet100(response.data)
      let arrStockSet100CalendarXD = arrAllStockCalendarXD.filter( (x)=>{ return arrStockSet100.findIndex((s)=>{return s.symbol === x.symbol})>=0 }) 
      arrStockSet100CalendarXD = arrStockSet100CalendarXD.filter( (x) => {
              const today = new Date()
              const yesterday = today.setDate(today.getDate()-1)
              return x.xdate > yesterday})
      arrStockSet100CalendarXD = arrStockSet100CalendarXD.sort( (a,b) => a.xdate - b.xdate)

      showSet100Calendar(arrStockSet100CalendarXD)

  }).catch(function (error){
      console.log('filterStockSet100andShow axios error ',error.message,url1)
  })
  return arrStockSet100

}

function refreshStockCalendar() {
  const urlStockCalendar = 'https://www.set.or.th/set/xcalendar.do?language=th&country=TH'
  const urlStockCalendar2 = 'https://www.set.or.th/set/xcalendar.do?eventType=&index=2&language=th&country=TH'

  let allhtml = ''
  
  console.log('hello refreshStockCalendar')
  axios(urlStockCalendar).then(function (response){

    allhtml = response.data


  }).then( function(){
    axios(urlStockCalendar2).then(function (response){
        allhtml = allhtml + response.data
        
        let arrAllStockCalendar = stockCalendar.wrapHtmlParserStockCalendar(allhtml)
        let arrAllStockCalendarXD = arrAllStockCalendar.filter((obj)=>{ return obj.xx !== 'XM' && obj.xx !== 'P'  }) 

        //console.log('arrAllStockCalendar',arrAllStockCalendar)
        //console.log('arrAllStockCalendarXD',arrAllStockCalendarXD)
        filterStockSet100andShow(arrAllStockCalendarXD) 

    }).catch( function(error){ console.log('refreshStockCalendar axios2 error',error.message) })

  }).catch(function (error){
      console.log('refreshStockCalendar axios error',error.message)
  })
}

function clearAllData() {
  for(let i=0;i<recToProcess.length;i++){
    document.getElementById(recToProcess[i].displayDiv).innerHTML = ''
    document.getElementById(recToProcess[i].displayDiv2).innerHTML = ''
  }

  const arrDivToShowData = ['set100col1','set100col12','set50col1','set50col2','newstodaylist','newspasslist','newsstocklist','newstodaylistFR','set100swingcol1','set100swingcol2','stockCalendar']
  arrDivToShowData.forEach(div => document.getElementById(div).innerHTML = '')


}

function startProgram() {

  document.getElementById("switchFilter").addEventListener("click", startProcessDataWithDelay)
  document.getElementById("btnRefresh").addEventListener("click", startProcessDataWithDelay)
  document.getElementById("btnAutoRefresh").addEventListener("click", setAutoRefresh)


  document.getElementById("btnRefreshTodayNews").addEventListener("click", processNewsTodayNotFR)
  document.getElementById("btnRefreshPassNews").addEventListener("click", processNewsPass)
  document.getElementById("btnRefreshStockNews").addEventListener("click", processNewsStock)
  document.getElementById("btnRefreshSet100").addEventListener("click", processSet100Set50Call)
  document.getElementById("btnRefreshTodayNewsFR").addEventListener("click", processNewsTodayFR)

  document.getElementById("btnHideSetMai").addEventListener("click", hideunhideSetMai)
  document.getElementById("btnHideSet100").addEventListener("click", hideunhideSet100)

  document.getElementById("btnRefreshSetMai").addEventListener("click", refreshSetMai)

  document.getElementById("btnRefreshset100swing").addEventListener("click", refreshSet100Swing)
  
  document.getElementById("btnRefreshStockCalendar").addEventListener("click", refreshStockCalendar)
  

  document.getElementById("btnClear").addEventListener("click", clearAllData)
  
  //startProcessDataWithDelay() 

}

document.addEventListener('DOMContentLoaded', startProgram)



})()