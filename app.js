'use strict';

//(function(){

const axios = require('axios')
const fs = require('fs')
const newsToday = require('./htmlParserNewsToday')
const newsTodayFR = require('./htmlParserNewsTodayFR')
const newsPass = require('./htmlParserNewsPass')
const newsStock = require('./htmlParserNewsStock')
const stockCalendar = require('./htmlParserStockCalendar')
const set100 = require('./htmlParserSet100')
const shareFunc = require('./sharevariables')
const stockInfo = require('./htmlParseGetStockInfo')
const planArr = require('./plan')

//const topValue="<h3>��Ť�ҫ��͢�� 20 �ѹ�Ѻ</h3>"
//const topVolume="<h3>����ҳ���͢�� 20 �ѹ�Ѻ</h3>"

let topGain="<h3>�Ҥ�������� 20 �ѹ�Ѻ</h3>"
let topLoss="<h3>�Ҥ�Ŵŧ 20 �ѹ�Ѻ</h3>"

//topGain="<h3>ราคาเพิ่มขึ้น 20 อันดับ</h3>"
//topLoss="<h3>ราคาลดลง 20 อันดับ</h3>"

//topGain="<h3>Top 20 Gainers</h3>"
//topLoss="<h3>Top 20 Losers</h3>"

const delayGetDetailFR = 200 //milisecs

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
  document.getElementById("labelTimeSetMai").innerHTML = "Data as of: " + d.toLocaleString()

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
          <tr> <th>No.</th> <th style="width:260px;">Time</th> <th style="width:60px;">Symbol</th> <th>Title</th> <th>Link</th></tr>
        </thead>
        <tbody>
          ${strRows}
        </tbody>
        </table>
  `
  document.getElementById('newstodaylist').innerHTML = strTableNews
  document.getElementById('numOfTodayNews').innerHTML = arrNewsToday.length.toString() + ' news'
}

function showNewsTodayFR(arrNewsToday,period,FlagToday = true,minusDay = 0){
  //know bug in set result of today fr result will not include TDEX ENGY
  //but set result of pass fr will include TDEX ENGY even 
  let div = ''
  if (FlagToday) 
    div = 'newstodaylistFR'
  else
    div = 'newsoldlistFR'

  let arrNewsTodaySeparetedByPeriod1 = arrNewsToday.filter( (t)=> { return (t.hour >= '01' && t.hour <= '10') })
  let arrNewsTodaySeparetedByPeriod2 = arrNewsToday.filter( (t)=> { return (t.hour >= '12' && t.hour <= '15') })
  let arrNewsTodaySeparetedByPeriod3 = arrNewsToday.filter( (t)=> { return (t.hour >= '16' && t.hour <= '23') })

  arrNewsTodaySeparetedByPeriod1 = arrNewsTodaySeparetedByPeriod1.sort(function(a,b){ return b.improvementFR - a.improvementFR})
  arrNewsTodaySeparetedByPeriod2 = arrNewsTodaySeparetedByPeriod2.sort(function(a,b){ return b.improvementFR - a.improvementFR})
  arrNewsTodaySeparetedByPeriod3 = arrNewsTodaySeparetedByPeriod3.sort(function(a,b){ return b.improvementFR - a.improvementFR})

  const arrWrap = [arrNewsTodaySeparetedByPeriod1,arrNewsTodaySeparetedByPeriod2,arrNewsTodaySeparetedByPeriod3]
  let strperoid = ['Morning','Noon','Evening']
  for (let x =0;  x < arrWrap.length; x++){
    

    const strRows = arrWrap[x].map((objNews,i) => `<tr> 
                <td>${i+1}</td> 
                <td>${objNews.time}</td> 
                <td>${objNews.symbol}</td> 
                <td>${objNews.title}</td> 
                <td>${objNews.lastProfit.toLocaleString()}</td>
                <td>${objNews.curProfit.toLocaleString()}</td>
                <td class="${(objNews.improvementFR>0)? 'colorGreen':'colorRed'}">${objNews.improvementFR.toLocaleString()}</td>
                <td><a href="https://www.set.or.th${objNews.link}" onclick="window.open(this.href,'_blank','width=900,height=900'); return false;">รายละเอียด ${objNews.symbol}</a></td> 
                </tr>`).join('')
    /*   
    <td>${objNews.curPE.toLocaleString()}</td>
    <td>${objNews.price}</td>

    <th>Cur PE</th>
    <th>Price</th>
    */
    const strTableNews = `
        <table>
          <thead style="color:white;text-align: center;">
            <tr> 
            <th>No.</th>
            <th style="width:150px;">Time</th>
            <th style="width:60px;">Symbol</th>
            <th>Title ${strperoid[x]}</th>
            <th>Profit From</th>
            <th>Profit To</th> 
            <th>%Improvement</th>
            <th>Link</th>
            </tr>
          </thead>
          <tbody>
            ${strRows}
          </tbody>
          </table>
    `
    document.getElementById(div + (x+1) ).innerHTML = strTableNews
  }
  
  if (period === 4) {

    const strJson = JSON.stringify(arrNewsToday)
    const d = new Date()
    const strDate = d.toLocaleString().replace(/[,:\/]/g,'-')
    const filename = 'C:\\Users\\nevada\\Documents\\Yodchai\\dataFR\\datafr-' + strDate + (FlagToday?'-today':'-pass') + minusDay.toString() + '.json'
    console.log('filename save' ,filename)
    fs.writeFileSync(filename, strJson)
    console.log('Save successfully', filename)

  }

}

function processNewsTodayFR(period) {
  processNewsToday(true,period)
}


function processNewsTodayFR1() {
  processNewsTodayFR(1)
}


function loodFrFromFile(FlagToday=false) {
  const textinputname = FlagToday ? 'jsonFileName' : 'jsonFileName2'
  const progresstextname = FlagToday ? 'progressFR' : 'progressOldFR'
  const filename = document.getElementById(textinputname).value.trim()
  const displayError = document.getElementById(progresstextname)

  if (filename === '') {
    displayError.innerHTML = 'please input file name'
    return
  }
  const fullfilename = 'C:\\Users\\nevada\\Documents\\Yodchai\\dataFR\\' + filename + '.json'

  try {
    const jsonString = fs.readFileSync(fullfilename)
    let arrNewsTodayFR = JSON.parse(jsonString)
    //const arrTempFixSet100 = ['AAV','ACE','ADVANC','AEONTS','AMATA','AOT','AP','AWC','BANPU','BBL','BCH','BCP','BCPG','BDMS','BEC','BEM','BGRIM','BH','BJC','BPP','BTS','CBG','CENTEL','CHG','CK','CKP','COM7','CPALL','CPF','CPN','CRC','DOHOME','DTAC','EA','EGCO','EPG','ESSO','GFPT','GLOBAL','GPSC','GULF','GUNKUL','HANA','HMPRO','INTUCH','IRPC','IVL','JAS','JMT','KBANK','KCE','KKP','KTB','KTC','LH','MAJOR','MEGA','MINT','MTC','ORI','OSP','PLANB','PRM','PSH','PTG','PTT','PTTEP','PTTGC','QH','RATCH','RBF','RS','SAWAD','SCB','SCC','SCGP','SGP','SIRI','SPALI','SPRC','STA','STEC','SUPER','TASCO','TCAP','THANI','TISCO','TKN','TMB','TOA','TOP','TPIPP','TQM','TRUE','TTW','TU','TVO','VGI','WHA','WHAUP','BAM','DELTA','STGT','NER']
    //const arrTempFixSet50 = ['ADVANC','AOT','AWC','BBL','BDMS','BEM','BGRIM','BH','BJC','BPP','BTS','CBG','CPALL','CPF','CPN','CRC','DTAC','EA','EGCO','GLOBAL','GPSC','GULF','HMPRO','INTUCH','IRPC','IVL','KBANK','KTB','KTC','LH','MINT','MTC','OSP','PTT','PTTEP','PTTGC','RATCH','SAWAD','SCB','SCC','SCGP <ST>','TISCO','TMB','TOA','TOP','TRUE','TTW','TU','VGI','WHA','BAM','DELTA','STGT']
    //arrNewsTodayFR = arrNewsTodayFR.filter(function(a){return  arrTempFixSet100.find(function(b){return b==a.symbol}) })
    showNewsTodayFR(arrNewsTodayFR,0,FlagToday)
    displayError.innerHTML = arrNewsTodayFR.length.toString()

  } catch(err) {
    console.log(err)
    displayError.innerHTML = err
  }



}

function processNewsTodayNotFR() {
  processNewsToday(false)
}

function processNewsOldFR() {
  processNewsPass(true)
}

function strToFloatFR(str) {
  let strNum = str.replace(/,/g,'').replace(/\(แก้ไข\)/g,'')
  const isNegative = (strNum.indexOf('(')>=0)? true : false
  strNum = strNum.replace('(','').replace(')','')
  let temp = parseFloat(strNum);
  let numFloat = temp ? temp : 0.0
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
  //console.log('posBegin',posBegin,'posEnd',posEnd,'subString',subString)
  //let posSpace = subString.indexOf(' ')
  let arrstr = subString.split(/\s+/)
  let strProfitCurrent =  arrstr[0] ? arrstr[0] : "0" //subString.slice(0,posSpace).trim()
  let strProfitLast = arrstr[1] ? arrstr[1] : "0" //subString.slice(posSpace).trim()

  let numProfitCurrent = strToFloatFR(strProfitCurrent)
  let numProfitLast = strToFloatFR(strProfitLast)

  //search for  กำไร (ขาดทุน) เป็นeps
  let posBeginEPS = str.indexOf(strFixEPS,posEnd)
  let posEndEPS = str.indexOf('\n',posBeginEPS)
  let subStringEPS = str.slice(posBeginEPS + strFixEPS.length, posEndEPS).trim()
  //console.log('posBeginEPS',posBeginEPS,'posEndEPS',posEndEPS,'subStringEPS',subStringEPS)
  //let posSpaceEPS = subStringEPS.indexOf(' ')
  let arrstrEPS = subStringEPS.split(/\s+/)
  let strProfitCurrentEPS = arrstrEPS[0] ? arrstrEPS[0] : "0" //subStringEPS.slice(0,posSpaceEPS).trim()
  let strProfitLastEPS = arrstrEPS[1] ? arrstrEPS[1] : "0" //subStringEPS.slice(posSpaceEPS).trim()
  let numEPSCurrent = strToFloatFR(strProfitCurrentEPS)
  let numEPSLast = strToFloatFR(strProfitLastEPS)
  //let objStock = getStockPrice(element.symbol)
  //console.log('objStock',objStock)
  //let stockPrice = ( objStock != undefined)? objStock.price : 0


  if (numProfitCurrent > 0) {
    element.improvementFR  = parseFloat((numProfitCurrent-numProfitLast)*100/ Math.abs(numProfitLast))
  } else {
    element.improvementFR =parseFloat( -Math.abs(Math.abs(numProfitCurrent)-Math.abs(numProfitLast))*100/ Math.abs(numProfitLast) ) //-100.00  cannot combine must be minus to push loss less than before.
    if (numProfitLast < 0) element.improvementFR = element.improvementFR + -100.00 
    else element.improvementFR = element.improvementFR + -200.00;
  }
  

  if (Object.is(NaN,element.improvementFR) ) element.improvementFR =0;
  element.curPE = 0
  element.lastProfit = numProfitLast
  element.curProfit = numProfitCurrent
  element.lastEPS = numEPSLast
  element.curEPS = numEPSCurrent
  element.price = 0 //stockPrice

  //console.log(i, element.symbol,'element.lastProfit',element.lastProfit,'element.curProfit',element.curProfit,'element.lastEPS',element.lastEPS,'element.curEPS',element.curEPS,'element.improvementFR',element.improvementFR,'element.curPE',element.curPE,'stockPrice',stockPrice)

}


function getAndCalFRImprove(arr,delayGetDetailFR,FRflag=false){

  const progressdiv = FRflag ? 'progressOldFR' : 'progressFR'
  const progressFR = document.getElementById(progressdiv)
  const lenFR = arr.length.toString()
  arr.forEach((element,i) => {
    
    setTimeout(() => {
      axios('https://www.set.or.th' + element.link).then(function (response){


        searchFRprofit(response.data,element,i)

        progressFR.innerHTML=(i+1).toString() + '/' + lenFR //.toString()

      }).catch(function (error){
        console.log(element.symbol, 'getAndCalFRImprove axios error',error.message)
      })
    }, (i+2)*delayGetDetailFR);


  })
}

function getAllStockLastPrice(){
  const url1 = 'https://www.settrade.com/C13_MarketSummary.jsp?detail=STOCK_TYPE&order=N&market=SET&type=S'  // set ตอนเช้า ยังมีราคาอยู่
  const url2 = 'https://www.settrade.com/C13_MarketSummary.jsp?detail=STOCK_TYPE&order=N&market=mai&type=S'  // mai ตอนเช้า ไม่มีราคา
  arrAllStockPrice = []
  axios(url1).then(function (response){

      arrAllStockPrice = arrAllStockPrice.concat(set100.wrapHtmlParserSet100(response.data))
      //console.log('arrAllStockPrice',arrAllStockPrice)

  }).catch(function (error){
      console.log('getAllStockLastPrice axios error 1',error.message,url1)
  })

  axios(url2).then(function (response){

    arrAllStockPrice = arrAllStockPrice.concat(set100.wrapHtmlParserSet100(response.data)) 
    //console.log('arrAllStockPrice',arrAllStockPrice)

  }).catch(function (error){
    console.log('getAllStockLastPrice axios error 2',error.message,url2)
  })

}

function processNewsToday(FRflag=false,period) {
  let xhttp = new XMLHttpRequest()

  //const urlTodayNews = 'https://www.set.or.th/set/todaynews.do?period=all&language=th&country=TH&market=' //actualy this is start page with no parameter. when search it will goto page searchtodaynews.do
  const urlTodayNews   = 'https://classic.set.or.th/set/searchtodaynews.do?source=company&symbol=&securityType=S&newsGroupId=&headline=&submit=%E0%B8%84%E0%B9%89%E0%B8%99%E0%B8%AB%E0%B8%B2&language=th&country=TH'
  const urlTodayNewsFR = 'https://classic.set.or.th/set/searchtodaynews.do?source=company&symbol=&securityType=S&newsGroupId=&headline=%E0%B8%AA%E0%B8%A3%E0%B8%B8%E0%B8%9B%E0%B8%9C%E0%B8%A5%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%94%E0%B8%B3%E0%B9%80%E0%B8%99%E0%B8%B4%E0%B8%99%E0%B8%87%E0%B8%B2%E0%B8%99&submit=%E0%B8%84%E0%B9%89%E0%B8%99%E0%B8%AB%E0%B8%B2&language=th&country=TH'
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {

      if(!FRflag){
        let arrNewsToday = newsToday.wrapHtmlParserNewsToday(this.responseText)
        showNewsToday([shareFunc.newsTodayObject('Retriving data..','','','') ]) // call to show retriving data message it will show immedietly 
        setTimeout(showNewsToday, 500,arrNewsToday)
      }else{
        let arrNewsTodayFR = newsTodayFR.wrapHtmlParserNewsTodayFR(this.responseText,false,period)
        //arrNewsTodayFR = arrNewsTodayFR.filter(function(s) { return s.symbol == 'WORLD'})
        if (arrAllStockPrice.length === 0)  getAllStockLastPrice()
        //console.log('processNewsToday arrAllStockPrice',arrAllStockPrice)
        getAndCalFRImprove(arrNewsTodayFR,delayGetDetailFR)
        setTimeout(showNewsTodayFR, (arrNewsTodayFR.length+4) * delayGetDetailFR,arrNewsTodayFR,period)
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
          <tr> <th>No.</th> <th style="width:180px;">Time</th> <th style="width:60px;">Symbol</th> <th>Title</th> </tr>
        </thead>
        <tbody>
          ${strRows}
        </tbody>
        </table>
  `
  document.getElementById('newspasslist').innerHTML = strTableNews
  document.getElementById('numOfPassNews').innerHTML = arrNews.length.toString() + ' news'
}
async function processNewsPassFlagFalse() {
  console.log('arguments',arguments)
  processNewsPass(false)
}

async function processNewsPass(FRflag=false){

  // know bug เนื่องจากหน้าจอ ค้นหาของจริง จะใส่วันหยุด เป็น from to ไม่ได้ แต่ program กำหนดวันเอง จากจำนวนวันย้อนหลัง ทำให้มีวันหยุด ทำให้ข้อมูลเบิ้ล เช่น วันนี้วันอาทิตย์แล้วค้นย้อน 2 วันใน เพื่อให้ได้ข้อมูลวันศุกร์ เอ๊ะ หรือว่าเพราะ 29-feb-2020 
  let strBtn = ''
  let strInputDays = ''
  if (!FRflag){
    strBtn = 'btnRefreshPassNews'
    strInputDays = 'passday'
  }else{
    strBtn = 'btnRefreshOldNewsFR'
    strInputDays = 'passdayFR'
  }

  document.getElementById(strBtn).disabled =true
  if(!FRflag){
    showNewsPass([shareFunc.newsTodayObject('Retriving data..','','','',0,'','00') ])
  }else{
    // now enable save file then below show will create file
  }
  
  const inputPassDay = document.getElementById(strInputDays)

  const intPassDay = isNaN(parseInt(inputPassDay.value)) ? 0 : parseInt(inputPassDay.value)

  const arrPassNews = intPassDay == 0 ? [shareFunc.newsTodayObject('Invalid number of days.','','','',0,'','00') ] : await newsPass.getAllNumberOfPageAndProcess(intPassDay,FRflag)
  
  //console.log('arrPassNews',arrPassNews)
  if(!FRflag){
    showNewsPass(arrPassNews) 
  }else{
    if (arrAllStockPrice.length === 0)  getAllStockLastPrice()
    getAndCalFRImprove(arrPassNews,delayGetDetailFR,true)
    setTimeout(showNewsTodayFR, (arrPassNews.length+4) * delayGetDetailFR,arrPassNews,4,false,-intPassDay)
  }
  
  document.getElementById(strBtn).disabled =false


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
  const rectoshow = 20 //15
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
const arrFixSet50 = []  // fix some move between from set50 set100 and  array is not updated then it remove from set100 list
//['ADVANC','AOT','AWC','BBL','BDMS','BEM','BGRIM','BH','BJC','BPP','BTS','CBG','CPALL','CPF','CPN','CRC','DELTA','DTAC','EA','EGCO','GLOBAL','GPSC','GULF','HMPRO','INTUCH','IRPC','IVL','KBANK','KTB','KTC','LH','MINT','MTC','OSP','PTT','PTTEP','PTTGC','RATCH','SAWAD','SCB','SCC','TCAP','TISCO','TMB','TOA','TOP','TRUE','TU','VGI','WHA']

function processSet100Set50(url,idDivGain,idDivLoss,titleGain,titleLoss){
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {

      let arrObjSet = set100.wrapHtmlParserSet100(this.responseText)
      
      if (titleGain === 'SET 100 Top Gainer') {
        arrObjSet = arrObjSet.filter((x)=>{ return (arrFixSet50.findIndex( (a)=>{ return a === x.symbol } ) < 0)  })
      }
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
  const d = new Date()
  document.getElementById("labelTimeSet100").innerHTML = "Data as of: " + d.toLocaleString()
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

function diffofDay(xdate){
  const today = new Date()
  const diff = parseInt( Math.ceil((xdate-today)/(24*3600*1000)) )
  if (diff > 0) 
    return '+' + diff.toString()
  else
    return  diff.toString()
}

function colorForRowCalendar(xx){
  if (xx=='XE')
    return 'colorRed'
  else
    return 'colorBlue'
}

function showSet100Calendar(arr){
  
  const strRows = arr.map((obj,i) => `<tr class="${colorForRowCalendar(obj.xx)}"> 
                  <td>${i+1}</td>
                  <td>${ diffofDay(obj.xdate) + ' : ' + nameDayofWeek(obj.xdate.getDay()) + ' ' + obj.xdate.getDate() +'-'+ (obj.xdate.getMonth()+1) +'-'+ obj.xdate.getFullYear()}</td> 
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
  //use in xd xm calendar to filter only set100 stock
  const url1 = 'https://www.settrade.com/C13_MarketSummary.jsp?detail=SET100&order=N&industry=&sector=&market=SET&sectorName=O_SET100'

  let arrStockSet100 = []
  axios(url1).then(function (response){

      arrStockSet100 = set100.wrapHtmlParserSet100(response.data)
      // add special BAM
      arrStockSet100.push(shareFunc.stockObject('BAM','strVolume',0,'strChange',0,'strFlag',0,0,0,0))

      let arrStockSet100CalendarXD = arrAllStockCalendarXD.filter( (x)=>{ return arrStockSet100.findIndex((s)=>{return s.symbol === x.symbol})>=0 || x.xx.match(/^XE/)}) 
      arrStockSet100CalendarXD = arrStockSet100CalendarXD.filter( (x) => {
              const today = new Date()
              const yesterday = today.setDate(today.getDate()-5)
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
        let arrAllStockCalendarXD = arrAllStockCalendar.filter((obj)=>{ return obj.xx !== 'XM' && !obj.xx.match(/^P/)  }) 

        //console.log('arrAllStockCalendar',arrAllStockCalendar)
        //console.log('arrAllStockCalendarXD',arrAllStockCalendarXD)
        filterStockSet100andShow(arrAllStockCalendarXD) 

    }).catch( function(error){ console.log('refreshStockCalendar axios2 error',error.message) })

  }).catch(function (error){
      console.log('refreshStockCalendar axios error',error.message)
  })
}

function showStockInfo(arrStockInfoObj) {
    console.log(arrStockInfoObj)
    const strRows = arrStockInfoObj.map((objStockInfo,i) => `<tr> 
                <td>${i+1}</td> 
                <td>${objStockInfo.symbol}</td> 
                <td>${objStockInfo.businessType}</td> 
                </tr>`).join('')
 
    const strTableNews = `
        <table>
          <thead style="color:white;text-align: center;">
            <tr> 
            <th>No.</th>
            <th style="width:150px;">Symbol</th>
            <th style="width:600px;">Business</th>
            </tr>
          </thead>
          <tbody>
            ${strRows}
          </tbody>
          </table>
    `
    document.getElementById('divStockInfo').innerHTML = strTableNews
}

function GetStockInfo(paraSymblo) {
  let arrAllSymbol = ['2S','3K-BAT','7UP','A','A5','AAV','ABICO','ABM','ABPIF','ACAP','ACC','ACE','ACG','ADB','ADD','ADVANC','AEONTS','AF','AFC','AGE','AH','AHC','AI','AIE','AIMCG','AIMIRT','AIRA','AIT','AJ','AJA','AKP','AKR','ALL','ALLA','ALLY','ALPHAX','ALT','ALUCON','AMA','AMANAH','AMARIN','AMATA','AMATAR','AMATAV','AMC','AMR','ANAN','AOT','AP','APCO','APCS','APEX','APP','APURE','AQ','AQUA','ARIN','ARIP','ARROW','AS','ASAP','ASEFA','ASIA','ASIAN','ASIMAR','ASK','ASN','ASP','ASW','ATP30','AU','AUCT','AWC','AYUD','B','B52','BA','BAFS','BAM','BANPU','BAY','BBGI','BBIK','BBL','BC','BCH','BCP','BCPG','BCT','BDMS','BE8','BEAUTY','BEC','BEM','BEYOND','BFIT','BGC','BGRIM','BGT','BH','BIG','BIOTEC','BIS','BIZ','BJC','BJCHI','BKD','BKI','BKKCP','BLA','BLAND','BLESS','BLISS','BM','BOFFICE','BOL','BPP','BR','BRI','BROCK','BROOK','BRR','BRRGIF','BSBM','BSM','BTNC','BTS','BTSGIF','BTW','BUI','BWG','B-WORK','BYD','CAZ','CBG','CCET','CCP','CEN','CENTEL','CEYE','CFRESH','CGD','CGH','CHARAN','CHAYO','CHEWA','CHG','CHIC','CHO','CHOTI','CHOW','CI','CIG','CIMBT','CITY','CIVIL','CK','CKP','CM','CMAN','CMC','CMO','CMR','CNT','COLOR','COM7','COMAN','COTTO','CPALL','CPANEL','CPF','CPH','CPI','CPL','CPN','CPNCG','CPNREIT','CPR','CPT','CPTGF','CPW','CRANE','CRC','CRD','CSC','CSP','CSR','CSS','CTARAF','CTW','CV','CWT','D','DCC','DCON','DDD','DELTA','DEMCO','DHOUSE','DIF','DIMET','DITTO','DMT','DOD','DOHOME','DPAINT','DREIT','DRT','DTAC','DTCI','DUSIT','DV8','EA','EASON','EASTW','ECF','ECL','EE','EFORL','EGATIF','EGCO','EKH','EMC','EP','EPG','ERW','ERWPF','ESSO','ESTAR','ETC','ETE','EVER','F&D','FANCY','FE','FLOYD','FMT','FN','FNS','FORTH','FPI','FPT','FSMART','FSS','FTE','FTI','FTREIT','FUTUREPF','FVC','GAHREIT','GBX','GC','GCAP','GEL','GENCO','GFPT','GGC','GIFT','GJS','GL','GLAND','GLOBAL','GLOCON','GLORY','GPI','GPSC','GRAMMY','GRAND','GREEN','GROREIT','GSC','GSTEEL','GTB','GULF','GUNKUL','GVREIT','GYT','HANA','HARN','HEMP','HENG','HFT','HL','HMPRO','HPF','HPT','HTC','HTECH','HUMAN','HYDRO','ICC','ICHI','ICN','IFEC','IFS','IHL','IIG','III','ILINK','ILM','IMH','IMPACT','IND','INET','INETREIT','INGRS','INOX','INSET','INSURE','INTUCH','IP','IRC','IRCP','IRPC','IT','ITD','ITEL','IVL','J','JAK','JAS','JASIF','JCK','JCKH','JCT','JDF','JKN','JMART','JMT','JP','JR','JTS','JUBILE','JWD','K','KAMART','KASET','KBANK','KBS','KBSPIF','KC','KCAR','KCC','KCE','KCM','KDH','KEX','KGI','KIAT','KISS','KK','KKC','KKP','KOOL','KPNPF','KSL','KTB','KTBSTMR','KTC','KTIS','KUMWEL','KUN','KWC','KWI','KWM','KYE','L&E','LALIN','LANNA','LDC','LEE','LEO','LH','LHFG','LHHOTEL','LHK','LHPF','LHSC','LIT','LOXLEY','LPF','LPH','LPN','LRH','LST','LUXF','M','MACO','MAJOR','MAKRO','MALEE','MANRIN','MATCH','MATI','MAX','MBAX','MBK','MC','M-CHAI','MCOT','MCS','MDX','MEGA','MENA','META','METCO','MFC','MFEC','MGT','MICRO','MIDA','M-II','MILL','MINT','MIPF','MIT','MITSIB','MJD','MJLF','MK','ML','MNIT','MNIT2','MNRF','MODERN','MONO','MOONG','MORE','M-PAT','MPIC','MSC','MST','M-STOR','MTC','MTI','MUD','MVP','NATION','NBC','NC','NCAP','NCH','NCL','NDR','NEP','NER','NETBAY','NEW','NEWS','NEX','NFC','NINE','NKI','NNCL','NOBLE','NOK','NOVA','NPK','NRF','NSI','NSL','NTV','NUSA','NV','NVD','NWR','NYT','OCC','OGC','OHTL','OISHI','ONEE','OR','ORI','OSP','OTO','PACE','PACO','PAF','PAP','PATO','PB','PCSGH','PDG','PDJ','PEACE','PERM','PF','PG','PHOL','PICO','PIMO','PIN','PJW','PK','PL','PLANB','PLANET','PLAT','PLE','PLUS','PM','PMTA','POLAR','POMPUI','POPF','PORT','POST','PPF','PPM','PPP','PPPM','PPS','PR9','PRAKIT','PRAPAT','PREB','PRECHA','PRG','PRIME','PRIN','PRINC','PRM','PRO','PROEN','PROS','PROSPECT','PROUD','PSG','PSH','PSL','PSTC','PT','PTC','PTECH','PTG','PTL','PTT','PTTEP','PTTGC','PYLON','Q-CON','QH','QHHR','QHOP','QHPF','QLT','QTC','RAM','RATCH','RBF','RCL','RICHY','RJH','RML','ROCK','ROH','ROJNA','RP','RPC','RPH','RS','RSP','RT','RWI','S','S & J','S11','SA','SAAM','SABINA','SABUY','SAFARI','SAK','SALEE','SAM','SAMART','SAMCO','SAMTEL','SANKO','SAPPE','SAT','SAUCE','SAWAD','SAWANG','SC','SCB','SCC','SCCC','SCG','SCGP','SCI','SCM','SCN','SCP','SDC','SE','SEAFCO','SEAOIL','SECURE','SE-ED','SELIC','SENA','SENAJ','SFLEX','SFP','SFT','SGF','SGP','SHANG','SHR','SHREIT','SIAM','SICT','SIMAT','SINGER','SIRI','SIRIP','SIS','SISB','SITHAI','SK','SKE','SKN','SKR','SKY','SLM','SLP','SMART','SMD','SMIT','SMK','SMPC','SMT','SNC','SNNP','SNP','SO','SOLAR','SONIC','SORKON','SPA','SPACK','SPALI','SPC','SPCG','SPG','SPI','SPRC','SPRIME','SPVI','SQ','SR','SRICHA','SRIPANWA','SSC','SSF','SSP','SSPF','SSS','SSSC','SST','SSTRT','STA','STANLY','STARK','STC','STEC','STECH','STGT','STHAI','STI','STOWER','STP','STPI','SUC','SUN','SUPER','SUPEREIF','SUSCO','SUTHA','SVH','SVI','SVOA','SVT','SWC','SYMC','SYNEX','SYNTEC','TACC','TAE','TAKUNI','TAPAC','TASCO','TC','TCAP','TCC','TCCC','TCJ','TCMC','TCOAT','TEAM','TEAMG','TEKA','TFFIF','TFG','TFI','TFM','TFMAMA','TGH','TGPRO','TH','THAI','THANA','THANI','THCOM','THE','THG','THIP','THL','THMUI','THRE','THREL','TIDLOR','TIF1','TIGER','TIPCO','TIPH','TISCO','TITLE','TK','TKC','TKN','TKS','TKT','TLHPF','TLI','TM','TMC','TMD','TMI','TMILL','TMT','TMW','TNDT','TNH','TNITY','TNL','TNP','TNPC','TNPF','TNR','TOA','TOG','TOP','TOPP','TPA','TPAC','TPBI','TPCH','TPCS','TPIPL','TPIPP','TPLAS','TPOLY','TPP','TPRIME','TPS','TQM','TQR','TR','TRC','TRITN','TRT','TRU','TRUBB','TRUE','TRV','TSC','TSE','TSF','TSI','TSR','TSTE','TSTH','TTA','TTB','TTCL','TTI','TTLPF','TTT','TTW','TU','TU-PF','TVDH','TVI','TVO','TVT','TWP','TWPC','TWZ','TYCN','U','UAC','UBE','UBIS','UEC','UKEM','UMI','UMS','UNIQ','UOBKH','UP','UPA','UPF','UPOIC','URBNPF','UREKA','UTP','UV','UVAN','VARO','VCOM','VGI','VIBHA','VIH','VL','VNG','VPO','VRANDA','W','WACOAL','WAVE','WFX','WGE','WHA','WHABT','WHAIR','WHART','WHAUP','WICE','WIIK','WIN','WINMED','WINNER','WORK','WORLD','WP','WPH','XO','XPG','YGG','YONG','YUASA','ZEN','ZIGA']
  let urlFactSheet = 'https://www.set.or.th/api/set/factsheet/$SYMBOL/profile?lang=th' 

  let arrStockInfoObj = []

  console.log('hello GetStockInfo arrAllSymbol.length =', arrAllSymbol.length)
  arrAllSymbol.forEach((strSymbol,i) => {
    
    setTimeout(() => {
      axios(urlFactSheet.replace('$SYMBOL',strSymbol)).then(function (response){
        arrStockInfoObj.push(response.data)

      }).catch(function (error){
        console.log(strSymbol, ' ',error.message)
      })
    }, (i+2)*delayGetDetailFR);
    console.log(i)

  })

  setTimeout(showStockInfo, (arrAllSymbol.length+4) * delayGetDetailFR,arrStockInfoObj)


}

function clearAllData() {
  for(let i=0;i<recToProcess.length;i++){
    document.getElementById(recToProcess[i].displayDiv).innerHTML = ''
    document.getElementById(recToProcess[i].displayDiv2).innerHTML = ''
  }

  const arrDivToShowData = ['set100col1','set100col2','set50col1','set50col2','newstodaylist','newspasslist','newsstocklist'
                            ,'newstodaylistFR1','newstodaylistFR2','newstodaylistFR3','set100swingcol1','set100swingcol2','stockCalendar'
                            ,'newsoldlistFR1','newsoldlistFR2','newsoldlistFR3']
  arrDivToShowData.forEach(div => document.getElementById(div).innerHTML = '' )


}

function Showtab(tabName){
  const tabSet100 = document.getElementById("set100tContainer")
  const tabSetMai = document.getElementById("resultContainer")
  const tabNews = document.getElementById("newscontainer")
  tabSet100.classList.add('hide')
  tabSetMai.classList.add('hide')
  tabNews.classList.add('hide')

  if (tabName === 'SET100') 
    tabSet100.classList.remove('hide')
  else if (tabName ==='SETMAI')
    tabSetMai.classList.remove('hide')
  else if (tabName ==='NEWS')
    tabNews.classList.remove('hide')

}


function startProgram() {

  document.getElementById("switchFilter").addEventListener("click", startProcessDataWithDelay)
  document.getElementById("btnRefresh").addEventListener("click", startProcessDataWithDelay)
  document.getElementById("btnAutoRefresh").addEventListener("click", setAutoRefresh)


  document.getElementById("btnRefreshTodayNews").addEventListener("click", processNewsTodayNotFR)
  document.getElementById("btnRefreshPassNews").addEventListener("click", processNewsPassFlagFalse)
  document.getElementById("btnRefreshStockNews").addEventListener("click", processNewsStock)
  document.getElementById("btnRefreshSet100").addEventListener("click", processSet100Set50Call)

  document.getElementById("btnRefreshTodayNewsFR1").addEventListener("click", function() {processNewsTodayFR(1)} )
  document.getElementById("btnRefreshTodayNewsFR4").addEventListener("click",  function() {processNewsTodayFR(4)})
  document.getElementById("btnRefreshTodayNewsFR5").addEventListener("click", function() {loodFrFromFile(true)})

  document.getElementById("btnRefreshOldNewsFR").addEventListener("click", processNewsOldFR)
  document.getElementById("btnPassNewsLoadfile").addEventListener("click", function() {loodFrFromFile(false)})
  

  document.getElementById("btnHideSetMai").addEventListener("click", hideunhideSetMai)
  document.getElementById("btnHideSet100").addEventListener("click", hideunhideSet100)

  document.getElementById("btnRefreshSetMai").addEventListener("click", refreshSetMai)

  document.getElementById("btnRefreshset100swing").addEventListener("click", refreshSet100Swing)
  
  document.getElementById("btnRefreshStockCalendar").addEventListener("click", refreshStockCalendar)

  document.getElementById("btnGetStockInfo").addEventListener("click", GetStockInfo)

  
  

  document.getElementById("btnClear").addEventListener("click", clearAllData)

  document.getElementById("btnShowSet100").addEventListener("click", function() { Showtab('SET100') })

  document.getElementById("btnShowSetMai").addEventListener("click", function() { Showtab('SETMAI') })

  document.getElementById("btnShowNews").addEventListener("click", function() { Showtab('NEWS') })
  
  Showtab('SET100')
  //startProcessDataWithDelay() 

  //console.log(planArr.planArr)

}

document.addEventListener('DOMContentLoaded', startProgram)



//})()