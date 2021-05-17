require('dotenv').config()

const NewsAPI = require('newsapi')
const fs = require('fs')
const newsapi = new NewsAPI(process.env.NEWS_API_KEY)
const { format } = require('date-fns')

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}

// To query sources
// All options are optional
async function getData() {
  try {
    const fetch = await newsapi.v2.sources({
      language: 'en',
      country: 'us',
      category: 'general'
    })

    const sources = await fetch.sources
      .map(source => source.id)

    const data = await Promise.all(sources.map(async (source) => {
      const response = await newsapi.v2.everything({
        sources: `${source}`
      })

      const titles = await Promise.all(response.articles.map(article => {
        return article.title
      }).filter(onlyUnique))

      return {
        source,
        titles
      }
    }))

    data.date = Date.now()
    console.log(data)

    // timestamp and log results
    fs.writeFileSync(`./web/public/data/${format(Date.now(), 'yyyy-MM-dd')}.json`, JSON.stringify(data))

    return data
  } catch (e) {
    console.error(e)
  }
}

getData()