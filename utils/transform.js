const stringTokenizer = require('string-punctuation-tokenizer')
const prepositions = require('title-case-minors')
const uselessWords = prepositions
  .concat(['has', 'new', 'says', 'one', 'over', 'are', 'not', 'first', 'about', 'this', 'into', 'was', 'after', 'what', 'will', 'have', 'like', 'back', 'day', 'year', 'month', 'reuters' ])

const transform = input => {
  console.log(input)
  const titles = input
    .flat()
    .map(item => item.titles)
    .flat()

  const words = titles
    .map(title => stringTokenizer.tokenize({text: `${title}`})) // turn title into array of words
    .flat()
    .map(word => word.toLowerCase())
    .filter(item => Number.isNaN(+item) && item.length > 2) // filter out numbers and words shorter than two letters
    .filter(item => !uselessWords.includes(item))



  const count = words
    .reduce((map, word) => {
      map[word] = (map[word] || 0) + 1
      return map;
    }, Object.create(null))

  const sortedCount = Object.entries(count)
    .sort((a, b) => b[1] - a[1])
}

module.exports = item => transform(item)