const setupArr = [
    '0-พักตัวรอพุ่ง มาเช้า 11โมง เที่ยง เปิดบ่าย บ่ายสาม บ่ายสี่ มาเย็นต้องเข้า(WHA,AAV)',
    '1-กำลังทำ low ต้องหาจังหวะดราม่า เทแรงห่อเย็น(PTG)',
    '2-รอย่อเช้า แล้วเข้า(PTG)',
    '3-หุ้น Floor รอเล่นเด้งจาก Floor (ACE,THANI)',
    '4-หุ้น เด้งจาก floor รอเทขอสอง รับเล่นเด้งอีกที (ACE)',
    '5-ลงแรงรับที่แนวรับ (PLANB)',
    '6-มันกำลังวิ่ง อะไรไม่รู้ volume เข้า',
    '7-มีปันผลเยอะ ถ้าตลาดลงแรง มันจะเด้งได้ดี หรือมีจังหวะเล่นวิ่งขึ้นเพื่อโดดลงวัน XD',
    '8-หุ้นมีข่าว วิเคราะห์ดีๆ จะเปิดโดดแล้ววิ่ง ข่าวเย็น เช้า เที่ยง'

]
const planArr =[
    {symbol: 'ADVANC',date:'06-04-2020',plan: 'none'},
    {symbol: 'AEONTS',date:'06-04-2020',plan: 'none'},
    {symbol: 'AMATA',date:'06-04-2020',plan: 'none'},
    {symbol: 'AOT',date:'06-04-2020',plan: 'none'},
    {symbol: 'AP',date:'06-04-2020',plan: 'none'},
    {symbol: 'AWC',date:'06-04-2020',plan: 'none'},
    {symbol: 'BANPU',date:'06-04-2020',plan: 'none'},
    {symbol: 'BBL',date:'06-04-2020',plan: 'none'},
    {symbol: 'BCH',date:'06-04-2020',plan: 'none'},
    {symbol: 'BCP',date:'06-04-2020',plan: 'none'},
    {symbol: 'BCPG',date:'06-04-2020',plan: 'none'},
    {symbol: 'BDMS',date:'06-04-2020',plan: 'none'},
    {symbol: 'BEC',date:'06-04-2020',plan: 'none'},
    {symbol: 'BEM',date:'06-04-2020',plan: 'none'},
    {symbol: 'BGC',date:'06-04-2020',plan: 'none'},
    {symbol: 'BGRIM',date:'06-04-2020',plan: 'none'},
    {symbol: 'BH',date:'06-04-2020',plan: 'none'},
    {symbol: 'BJC',date:'06-04-2020',plan: 'none'},
    {symbol: 'BPP',date:'06-04-2020',plan: 'none'},
    {symbol: 'BTS',date:'06-04-2020',plan: 'none'},
    {symbol: 'CBG',date:'06-04-2020',plan: 'none'},
    {symbol: 'CENTEL',date:'06-04-2020',plan: 'none'},
    {symbol: 'CHG',date:'06-04-2020',plan: 'none'},
    {symbol: 'CK',date:'06-04-2020',plan: 'none'},
    {symbol: 'CKP',date:'06-04-2020',plan: 'none'},
    {symbol: 'COM7',date:'06-04-2020',plan: 'none'},
    {symbol: 'CPALL',date:'06-04-2020',plan: 'none'},
    {symbol: 'CPF',date:'06-04-2020',plan: 'none'},
    {symbol: 'CPN',date:'06-04-2020',plan: 'none'},
    {symbol: 'CRC',date:'06-04-2020',plan: 'none'},
    {symbol: 'DELTA',date:'06-04-2020',plan: 'none'},
    {symbol: 'DTAC',date:'06-04-2020',plan: 'none'},
    {symbol: 'EA',date:'06-04-2020',plan: 'none'},
    {symbol: 'EGCO',date:'06-04-2020',plan: 'none'},
    {symbol: 'EPG',date:'06-04-2020',plan: 'none'},
    {symbol: 'ERW',date:'06-04-2020',plan: 'none'},
    {symbol: 'ESSO',date:'06-04-2020',plan: 'none'},
    {symbol: 'GFPT',date:'06-04-2020',plan: 'none'},
    {symbol: 'GLOBAL',date:'06-04-2020',plan: 'none'},
    {symbol: 'GPSC',date:'06-04-2020',plan: 'none'},
    {symbol: 'GULF',date:'06-04-2020',plan: 'none'},
    {symbol: 'GUNKUL',date:'06-04-2020',plan: 'none'},
    {symbol: 'HANA',date:'06-04-2020',plan: 'none'},
    {symbol: 'HMPRO',date:'06-04-2020',plan: 'none'},
    {symbol: 'INTUCH',date:'06-04-2020',plan: 'none'},
    {symbol: 'IRPC',date:'06-04-2020',plan: 'none'},
    {symbol: 'IVL',date:'06-04-2020',plan: 'none'},
    {symbol: 'JAS',date:'06-04-2020',plan: 'none'},
    {symbol: 'JMT',date:'06-04-2020',plan: 'none'},
    {symbol: 'KBANK',date:'06-04-2020',plan: 'none'},
    {symbol: 'KCE',date:'06-04-2020',plan: 'none'},
    {symbol: 'KKP',date:'06-04-2020',plan: 'none'},
    {symbol: 'KTB',date:'06-04-2020',plan: 'none'},
    {symbol: 'KTC',date:'06-04-2020',plan: 'none'},
    {symbol: 'LH',date:'06-04-2020',plan: 'none'},
    {symbol: 'MAJOR',date:'06-04-2020',plan: 'none'},
    {symbol: 'MBK',date:'06-04-2020',plan: 'none'},
    {symbol: 'MEGA',date:'06-04-2020',plan: 'none'},
    {symbol: 'MINT',date:'06-04-2020',plan: 'none'},
    {symbol: 'MTC',date:'06-04-2020',plan: 'none'},
    {symbol: 'ORI',date:'06-04-2020',plan: 'none'},
    {symbol: 'OSP',date:'06-04-2020',plan: 'none'},
    {symbol: 'PLANB',date:'06-04-2020',plan: 'none'},
    {symbol: 'PRM',date:'06-04-2020',plan: 'none'},
    {symbol: 'PSH',date:'06-04-2020',plan: 'none'},
    {symbol: 'PSL',date:'06-04-2020',plan: 'none'},
    {symbol: 'PTG',date:'06-04-2020',plan: 'none'},
    {symbol: 'PTT',date:'06-04-2020',plan: 'none'},
    {symbol: 'PTTEP',date:'06-04-2020',plan: 'none'},
    {symbol: 'PTTGC',date:'06-04-2020',plan: 'none'},
    {symbol: 'QH',date:'06-04-2020',plan: 'none'},
    {symbol: 'RATCH',date:'06-04-2020',plan: 'none'},
    {symbol: 'RS',date:'06-04-2020',plan: 'none'},
    {symbol: 'SAWAD',date:'06-04-2020',plan: 'none'},
    {symbol: 'SCB',date:'06-04-2020',plan: 'none'},
    {symbol: 'SCC',date:'06-04-2020',plan: 'none'},
    {symbol: 'SGP',date:'06-04-2020',plan: 'none'},
    {symbol: 'SPALI',date:'06-04-2020',plan: 'none'},
    {symbol: 'SPRC',date:'06-04-2020',plan: 'none'},
    {symbol: 'STA',date:'06-04-2020',plan: 'none'},
    {symbol: 'STEC',date:'06-04-2020',plan: 'none'},
    {symbol: 'STPI',date:'06-04-2020',plan: 'none'},
    {symbol: 'SUPER',date:'06-04-2020',plan: 'none'},
    {symbol: 'TASCO',date:'06-04-2020',plan: 'none'},
    {symbol: 'TCAP',date:'06-04-2020',plan: 'none'},
    {symbol: 'THAI',date:'06-04-2020',plan: 'none'},
    {symbol: 'THANI',date:'06-04-2020',plan: 'none'},
    {symbol: 'THG',date:'06-04-2020',plan: 'none'},
    {symbol: 'TISCO',date:'06-04-2020',plan: 'none'},
    {symbol: 'TKN',date:'06-04-2020',plan: 'none'},
    {symbol: 'TMB',date:'06-04-2020',plan: 'none'},
    {symbol: 'TOA',date:'06-04-2020',plan: 'none'},
    {symbol: 'TOP',date:'06-04-2020',plan: 'none'},
    {symbol: 'TPIPP',date:'06-04-2020',plan: 'none'},
    {symbol: 'TQM',date:'06-04-2020',plan: 'none'},
    {symbol: 'TRUE',date:'06-04-2020',plan: 'none'},
    {symbol: 'TTW',date:'06-04-2020',plan: 'none'},
    {symbol: 'TU',date:'06-04-2020',plan: 'none'},
    {symbol: 'VGI',date:'06-04-2020',plan: 'none'},
    {symbol: 'WHA',date:'06-04-2020',plan: 'none'},
    {symbol: 'BAM',date:'06-04-2020',plan: 'none'},
    {symbol: 'DOHOME',date:'06-04-2020',plan: 'none'},
    {symbol: 'AAV',date:'06-04-2020',plan: 'none'}
]

module.exports.planArr = planArr
module.exports.setup = setupArr