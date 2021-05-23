require('dotenv').config()
const NewsAPI = require('newsapi')
const fs = require('fs')
const newsapi = new NewsAPI(process.env.NEWS_API_KEY)
const { format } = require('date-fns')
const stringTokenizer = require('string-punctuation-tokenizer')
const prepositions = require('title-case-minors')
const uselessWords = prepositions
  .concat([
    'has', 'new', 'says', 'one', 'over', 'are', 'not', 'first', 'about',
    'this', 'into', 'was', 'after', 'what', 'will', 'have', 'like', 'back',
    'day', 'year', 'month', 'reuters', 'say', 'two', 'just', 'you', 'its', 'get',
    'still', 'here', 'may',
  ])

const faunadb = require('faunadb'),
  q = faunadb.query

const client = new faunadb.Client({ secret: process.env.FAUNA_KEY })


function getWordsfromTitles(titles) {
  return titles
    .map(title => stringTokenizer.tokenize({ text: `${title}` })) // turn title into array of words
    .flat()
    .map(word => word.toLowerCase())
    .filter(item => Number.isNaN(+item) && item.length > 2) // filter out numbers and words shorter than two letters
    .filter(item => !uselessWords.includes(item)) // filter prepositions and other short undescriptive words
}

function countAndSortWords(words) {
  const count = words
    .reduce((map, word) => {
      map[word] = (map[word] || 0) + 1
      return map
    }, Object.create(null))


  const sortedCount = Object.entries(count)
    .sort((a, b) => b[1] - a[1])

  return count
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}

// To query sources
// All options are optional
async function getData() {
  try {
    const category = "general" // politics

    const fetch = await newsapi.v2.sources({
      language: 'en',
      country: 'us',
      category
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

      const words = getWordsfromTitles(titles)

      const sortedWords = countAndSortWords(words)

      return {
        source,
        words: sortedWords
      }
    }))
    
    const day = {
      date: Date.now(),
      category,
      sources: data
    }

    // timestamp and log results
    fs.writeFileSync(`./data/${format(Date.now(), 'yyyy-MM-dd')}.json`, JSON.stringify(day))

    client.query(
      q.Create(
        q.Collection('unbias'),
        {
          data: { ...day }
        }
      )
    ).catch(e => console.error(e))

    return day
  } catch (e) {
    console.error(e)
  }
}

getData()

