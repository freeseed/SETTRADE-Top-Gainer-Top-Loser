
const fs = require('fs')
let strJson = JSON.stringify({ x:1,y:2,z:4})
let d = new Date()
let filename = 'C:\\Users\\nevada\\Documents\\Yodchai\\dataFR\\datafr-' + d.toLocaleString().replace(/[,:\/]/g,'-') + '.json'
console.log('Hi ',strJson, new Date())
try {
    fs.writeFileSync(filename, strJson )   
    console.log('Save file successfully.')
} catch (error) {
    console.log(error)
}

