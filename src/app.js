'use-strict'

const settings = require('./settings')

const Client = require('bitcoin-core')
const data = require(settings.data)

const Loader = {
  sent: 0,
  remaining: data,
}

Loader.client = new Client({
  username: settings.user,
  password: settings.pass,
  port: settings.port,
  host: settings.host,
})

if (settings.start > 0) {
  Loader.remaining.splice(0, settings.start - 1)
}

Loader.client.getInfo().then((info) => {
  Loader.send()
}).catch((e) => {
  console.log('error: ', e)
})

Loader.send = () => {
  if (Loader.remaining.length <= 0) {
    console.log('No more addresses')
    return
  }

  if (Loader.sent === settings.num) {
    console.log('max sends reached')
    return
  }

  console.log('next address ('+(Loader.sent+1)+'):', Loader.remaining[0])

  Loader.client.sendToAddress(Loader.remaining[0], settings.amount).then((txid) => {
    if (!txid) {
      console.log('no txid returned')
      return
    }
    console.log('txid', txid)
    Loader.remaining.splice(0,1)
    Loader.sent++
    Loader.send()
  }).catch((e) => {
    console.log('failed to send', e)
    return
  })


}
