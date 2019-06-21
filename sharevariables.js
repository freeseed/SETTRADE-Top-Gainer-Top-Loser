'use strict';
const regexDW = /\d\d\d\d\w/
const regexSET = /SET/
const regexTSD = /TSD/
const regexmai = /mai/
const regTHAINVDR = /THAINVDR/
const regexNewsSource = [regexDW,regexSET,regexTSD,regexmai,regTHAINVDR]


const regex1 = /เริ่มซื้อขาย/
const regex2 = /-W/
const regex3 = /วันซื้อขายวันสุดท้ายของ/
const regex4 = /สรุปผลการดำเนินงาน/
const regex5 = /การห้ามซื้อหรือขาย/
const regex6 = /เพิ่มทุน/
const regex7 = /พ้นเหตุ/
const regex8 = /เพิ่มสินค้า/
const regex9 = /หุ้นที่ตรา/
const regex10 = /SP/
const regex11 = /กำกับการ/
const regexNeedTopic = [regex1,regex2,regex3,regex4,regex5,regex6,regex7,regex8,regex9,regex10,regex11]

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

function newsTodayObject(time, symbol, source, title, page){
  return {
      time: time,
      symbol: symbol,
      source: source,
      title: title,
      page: page
  }
}

module.exports.isNeedTopics = isNeedTopics
module.exports.isDWSETTSDmai = isDWSETTSDmai
module.exports.newsTodayObject = newsTodayObject


