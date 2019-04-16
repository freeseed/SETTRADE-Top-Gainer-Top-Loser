
(function(){
let g_textResult=""
let g_subString=""
let g_switchFilter
let g_arrResult
const topValue="<h3>��Ť�ҫ��͢�� 20 �ѹ�Ѻ</h3>"
const topVolume="<h3>����ҳ���͢�� 20 �ѹ�Ѻ</h3>"
const topGain="<h3>�Ҥ�������� 20 �ѹ�Ѻ</h3>"
const topLoss="<h3>�Ҥ�Ŵŧ 20 �ѹ�Ѻ</h3>"
const endofTopLoss="</body>"
const objFilterParam = {minVolume: 200000, minLastPrice: 0.1 ,minUpDownStep : 2 }

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

function showInfo(strInfo){
  d= new Date()
  document.getElementById("InforBar").innerHTML = "Data as of: " + d.toLocaleString() 

}

function CheckVolume(obj) {

  //return obj.Volume > 1000000 && obj.LastPrice > 0.09 
  return obj.Volume >= objFilterParam.minVolume && obj.LastPrice >= objFilterParam.minLastPrice && obj.UpDownStep >= objFilterParam.minUpDownStep

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

function CreateDataObject(subString,strPlusMinus) {
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


  return DisplayFilterResult(arrObject.filter(CheckVolume),subString,strPlusMinus)
}

function loadDoc(i,isFilter) {
  let xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {

      substringHTML(this.responseText,i,isFilter)
    }else if ( this.response && this.status == 0){
      substringHTML("Error cannot load data please check console log. url:" + recToProcess[i].url,i)
      console.log("In else case of i=" + i)
    }
  };
  xhttp.open("GET", recToProcess[i].url, true)
  xhttp.send()
}

function substringHTML(textResult,i,isFilter) {

    let posBegin = textResult.indexOf(topGain)
    let posEnd = textResult.indexOf(topLoss)
    //g_textResult = textResult
    let subString = textResult.slice(posBegin ,posEnd)

    let lastIndex = subString.lastIndexOf("</div>")
    subString = subString.slice(0,lastIndex)
    subString = replaceTextToReadable(subString,i,"G")
    if (isFilter) subString = CreateDataObject(subString,"+")
    document.getElementById(recToProcess[i].displayDiv).innerHTML = subString

    posBegin = textResult.indexOf(topLoss)
    posEnd = textResult.indexOf(endofTopLoss)
    subString = textResult.slice(posBegin ,posEnd)
    subString = subString.replace(/<\/div>/g,"") + "</div>"
    subString = replaceTextToReadable(subString,i,"L")
    if (isFilter) subString = CreateDataObject(subString,"")
    document.getElementById(recToProcess[i].displayDiv2).innerHTML = subString
    //g_subString = subString
    

}

function replaceTextToReadable(subString,i,typeGorL) {
  let header = ""
  let newheader = ""
  if (typeGorL == 'G') {
    header = topGain
    newheader = " 20 Top Gainer</h5>"
  }else {
    header = topLoss
    newheader = " 20 Top Losser</h5>"
  }
  subString = subString.replace(header, "<h5 class='center-align'>" + recToProcess[i].header + newheader)
  subString = subString.replace("<th>��ѡ��Ѿ��</th>", "<th>หลักทรัพย์</th>")
  subString = subString.replace("<th>����ҳ<br />(���)</th>", "<th>ปริมาณ<br />(หุ้น)</th>")
  subString = subString.replace("<th>����ش</th>", "<th>ล่าสุด</th>")
  subString = subString.replace("<th>����¹<br />�ŧ</th>", "<th>เปลี่ยน<br />แปลง</th>")
  subString = subString.replace("<th>%����¹<br />�ŧ</th>", "<th>%เปลี่ยน<br />แปลง</th>")
  subString = subString.replace(/href=\"\/C13_FastQuote_Main.jsp\?txtSymbol=.*top\"/g, "")
  subString = subString.replace(/&nbsp;/g, "")

  return subString
}



function switchFilterClick () {
  startProcessData()
  console.log("Process Data " + Date().toString())
}

function startProcessData(){
  let switchFilter = document.getElementById("switchFilter")
  for(i=0;i<recToProcess.length;i++){
    loadDoc(i,switchFilter.checked)
  }
  showInfo("Complete laod data from SETTRADE.")
}


document.addEventListener('DOMContentLoaded', function() {
  let elems = document.querySelectorAll('.tooltipped')
  let instances = M.Tooltip.init(elems)


  document.getElementById("switchFilter").addEventListener("click", switchFilterClick)

  document.getElementById("btnRefresh").addEventListener("click", switchFilterClick)

  document.getElementById("lbFilter").dataset.tooltip = "minVolume = " + objFilterParam.minVolume.toLocaleString() + "<br> minPrice = " + objFilterParam.minLastPrice.toFixed(2) + "<br> minUpDownStep = " + objFilterParam.minUpDownStep

  startProcessData()
  }
)
})()