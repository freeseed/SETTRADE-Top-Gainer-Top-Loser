'use strict';
const regexDW = /\d\d\d\d\w/
const regexSET = /SET/
const regexTSD = /TSD/
const regexmai = /mai/
const regexNewsSource = [regexDW,regexSET,regexTSD,regexmai]


const regex1 = /ต้อน/
const regex2 = /-W/
const regex3 = /วันซื้อขายวันสุดท้ายของ/
const regex4 = /สรุปผลการดำเนินงาน/
const regex5 = /การห้ามซื้อหรือขาย/
const regex6 = /หุ้นเพิ่มทุน/
const regex7 = /พ้นเหตุ/
const regexNeedTopic = [regex1,regex2,regex3,regex4,regex5,regex6,regex7]

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

function newsTodayObject(time, symbol, source, title){
  return {
      time: time,
      symbol: symbol,
      source: source,
      title: title
  }
}

module.exports.isNeedTopics = isNeedTopics
module.exports.isDWSETTSDmai = isDWSETTSDmai
module.exports.newsTodayObject = newsTodayObject


