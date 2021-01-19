const request = require('superagent')
const asyncQ = require('async').queue
const cheerio = require('cheerio')
const fs = require('fs')

const config = {
  startPage: 1,
  // targetUrl: 'https://danbooru.donmai.us/'
  targetUrl: 'https://danbooru.donmai.us/posts?tags=hiten_%28hitenkei%29+'
}

function getHtml(url = '') {
  return new Promise((resolve, reject) => {
    request.get(url).end((err, res) => {
      !!err ? reject() : resolve(cheerio.load(res.text))
    })
  })
}

function getImageUrl() {
  return new Promise(async (resolve, reject) => {
    try {
      let $ = await getHtml(config.targetUrl),
      list = []
      $(`#posts-container`).each((idx, element) => {
        let children = element.children.filter(item => item.name == 'article') || []
        children.forEach((item, idx) => {
          list.push(item.attribs[`data-large-file-url`])
          // console.log(item.attribs[`data-large-file-url`])
        })
      })
      resolve(list)
    } catch (error) {
      reject(error)
    }
  })
}

function save(list = []) {
  list.forEach((url, idx) => {
    request.get(url).end((err, res) => {
      if(!err) {
        let img = res.body
        fs.writeFile(`./image/${idx}.jpg`, img, (err) => {
          if(!!err) {
            console.log(err)
          } else {
            console.log(url, ' saved')
          }
        })
      }
    })
  })
  return 
}


async function test() {
  await getImageUrl().then(list => {
    save(list)
  })
}

test()