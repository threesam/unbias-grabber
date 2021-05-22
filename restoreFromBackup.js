require('dotenv').config()

//requiring path and fs modules
const path = require('path')
const fs = require('fs')
const faunadb = require('faunadb'),
  q = faunadb.query

// init faunadb
const client = new faunadb.Client({ secret: process.env.FAUNA_KEY })

//joining path of directory 
const directoryPath = path.join(__dirname, 'data')

const getData = () => {
  //passsing directoryPath and callback function
  fs.readdir(directoryPath, (err, files) => {
    //handling error
    if (err) {
      return console.log('Unable to scan directory: ' + err)
    }
    //listing all files using forEach
    files.forEach(file => {
      // get file data
      const buffer = fs.readFileSync(`${directoryPath}/${file}`)
      const dailyData = JSON.parse(buffer)
      console.log('dailyData', dailyData)

      client.query(
        q.Create(
          q.Collection('unbias'),
          {
            data: { ...dailyData }
          }
        )
      ).catch(e => console.error(e))
    })
  })
}

getData()
