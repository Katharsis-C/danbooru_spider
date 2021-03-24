const request = require('superagent')
const asyncQ = require('async').queue
const cheerio = require('cheerio')
const fs = require('fs')

const config = {
  startPage: 1,
  // targetUrl: 'https://danbooru.donmai.us/'
  // targetUrl: 'https://danbooru.donmai.us/posts?tags=hiten_%28hitenkei%29+'
  targetUrl: 'https://www.nasachina.cn/iotd'
}

// 获取网页html
function getHtml(url = '') {
  return new Promise((resolve, reject) => {
    request.get(url).end((err, res) => {
      // console.log(15, {err, res})
      !!err ? reject() : resolve(cheerio.load(res.text))
    })
  }).catch(err => {
    // console.log(18,err)
  })
}

//获取图片url
function getImageUrl() {
  return new Promise(async (resolve, reject) => {
    try {
      let $ = await getHtml(config.targetUrl),
      list = []
      $(`.post-thumbnail a img`).each((idx, element) => {
        // console.log(32, element)
        let children = element.attribs.srcset.split(',') || []
        let fullSrc = children[children.length - 1]
        list.push(fullSrc.match(/https?:\/\/.*.(jpeg|png|jpg)/gi))
      })
      resolve(list)
    } catch (error) {
      reject(error)
    }
  }).catch(err => {
    console.log(37, err)
  })
}

//保存
function save(list = []) {
  list.forEach((url, idx) => {
    request.get(url).end((err, res) => {
      if(!err) {
        let img = res.body
        fs.writeFile(`./image/${idx}.jpg`, img, (err) => {
          if(!!err) {
            console.log(55, err)
          } else {
            console.log(url, ' saved')
          }
        })
      } else {
        console.log(59, err)
      }
    })
  })
  return 
}


async function test() {
  await getImageUrl().then(list => {
    // console.log(60, list.flat())
    save(list.flat())
  })
}

test()