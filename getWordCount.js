const fs = require('fs')
const stringTokenizer = require('string-punctuation-tokenizer')
const prepositions = require('title-case-minors')
const uselessWords = prepositions
  .concat([
    'has', 'new', 'says', 'one', 'over', 'are', 'not', 'first', 'about',
    'this', 'into', 'was', 'after', 'what', 'will', 'have', 'like', 'back',
    'day', 'year', 'month', 'reuters', 'say', 'two', 'just', 'you', 'its', 'get',
    'still', 'here', 'may',
  ])




// list files in data directory
const dataDir = './web/public/data/'
const files = fs.readdirSync(dataDir)
const data = files.map(file => {
  return {
    date: file.substr(0, file.length - 5), // remove file extension
    data: JSON.parse(fs.readFileSync(dataDir + file, 'utf8'))
  }
})

function getAllTitles(json) {
  return json
    .map(day => day.data
      .map(item => item.titles)
      .flat()
    )
}

function mapWordsToSources(json) {
  const obj = []
  const data = json.map(day => day.data).map((item, index) => {
    return {
      item: item.source,
      index
    }
  })
  const sources = json.map(item => item.data.map(item => {
    obj.push({
      source: item.source
    })
  }))


  return data
}

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

  const filtered = sortedCount.filter(tuple => tuple[1] > 3)

  return filtered
}

const allTitles = getAllTitles(data)
const allWords = getWordsfromTitles(allTitles)
const sortedWords = countAndSortWords(allWords)
console.log('sortedWords', sortedWords)
fs.writeFileSync(`./web/public/data/allWords.json`, JSON.stringify(sortedWords))

// console.log(sortedWords)