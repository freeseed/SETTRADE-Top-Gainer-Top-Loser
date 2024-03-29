'use strict';
const regexDW = /\d\d\d\d\w/
const regexSET = /^SET/    //bug if not put ^ in isDWSETTSDmai it will remove stock such as INSET
const regexTSD = /^TSD/
const regexmai = /^mai/
const regTHAINVDR = /^THAINVDR/
const regexNewsSource = [regexDW,regexSET,regexTSD,regexmai,regTHAINVDR]


const regex1 = /(^สรุปผลการดำเนินงาน)/     //don't remove it use in FR pass news filter
//const regex2 = /(-W)/
const regex3 = /(วันซื้อขายวันสุดท้ายของ)/
const regex4 =  /(เพิ่มทุน)/  
const regex5 = /(การห้ามซื้อหรือขาย)/
//const regex6 = /(ปันผล)/
const regex7 = /(พ้นเหตุ)/
const regex8 = /(เพิ่มสินค้า)/
const regex9 = /(หุ้นที่ตรา)/
const regex10 = /(SP)/
const regex11 = /(กำกับการ)/
const regex12 = /(ขอพักการขาย)/
const regex13 = /(เริ่มซื้อขาย)/
const regexNeedTopic = [regex1,regex3,regex4,regex5,regex7,regex8,regex9,regex10,regex11,regex12,regex13] //regex2 regex6

const regexFR = /สรุปผลการดำเนินงาน/

function isDWSETTSDmai(str) {
    for(let i =0; i < regexNewsSource.length ; i++){
      if (str.match(regexNewsSource[i])) return true
    }
  
    return false
}

function isNeedTopics(str) {
  for(let i =0; i < regexNeedTopic.length ; i++){
      if (str.match(regexNeedTopic[i])) return true
    }
  
    return false
}

function isNeedTopicsFR(str) {
  if (str.match(regexFR)) 
    return true 
  else 
    return false
}

function newsTodayObject(time, symbol, source, title, page, link, hour, improvementFR, lastProfit, curProfit, lastEPS, curEPS, curPE, price){
  return {
      time: time,
      symbol: symbol,
      source: source,
      title: title,
      page: page,
      link: link,
      improvementFR : improvementFR,
      lastProfit: lastProfit,
      curProfit: curProfit,
      lastEPS: lastEPS,
      curEPS: curEPS,
      curPE: curPE,
      price: price,
      hour:hour
  }
}

function stockObject(symbol, volume, price, change, percentChange, flag, high, low,swingPercent,stepPrice){
  return {
      symbol: symbol,
      volume: volume,
      price: price,
      change: change,
      percentChange: percentChange,
      flag: flag,
      high: high,
      low: low,
      swingPercent: swingPercent,
      stepPrice: stepPrice
  }
}

function calendarObject(symbol, xx, xdate,url){
  return {
      symbol: symbol,
      xx: xx,
      xdate: xdate,
      url: url
  }
}

function highlightNewsTopic(strTopic){
  let res = strTopic
  for(let i =0; i < regexNeedTopic.length ; i++){
    res = res.replace(regexNeedTopic[i], '<b style="color:white;">$1</b>') 
  }

  return res

}


/*
function textToInt(str){
  str = str.trim().replace(/,/g,'')
  return isNaN(parseInt(str)) ? 0 : parseInt(str)
}
*/
module.exports.isNeedTopics = isNeedTopics
module.exports.isNeedTopicsFR = isNeedTopicsFR
module.exports.isDWSETTSDmai = isDWSETTSDmai
module.exports.newsTodayObject = newsTodayObject
module.exports.highlightNewsTopic = highlightNewsTopic
module.exports.stockObject = stockObject
//module.exports.textToInt = textToInt
module.exports.calendarObject = calendarObject


