const Debug = require('debug')
Debug.enable('plebbit-js:*,-plebbit-js:client-manager:resolveTextRecord:trace,-plebbit-js:trace')
const Plebbit = require('@plebbit/plebbit-js')
const fs = require('fs')

// const testSub = '12D3KooWG3XbzoVyAE6Y9vHZKF64Yuuu4TjdgQKedk14iYmTEPWu'
const testSub = 'business-and-finance.eth'

let lastTimestamp = Date.now()

;(async () => {
  console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n')
  console.log('starting')
  const plebbit = await Plebbit({pubsubHttpClientsOptions: ['https://pubsubprovider.xyz/api/v0', 'https://plebpubsub.live/api/v0']})
  console.log(plebbit.pubsubHttpClientsOptions)
  plebbit.on('error', e => console.log('error event', e.message))
  const signer = await plebbit.createSigner()
  const comment = await plebbit.createComment({
    signer,
    subplebbitAddress: testSub,
    title: 'title',
    content: 'content'
  })
  comment.on('publishingstatechange', state => console.log('---------- publishing state', state))
  for (const clientType in comment.clients) {
    const clientTypes = comment.clients[clientType]
    for (const clientUrl in clientTypes) {
      const client = clientTypes[clientUrl]
      client.on?.('statechange', state => {
        if (state !== 'stopped') {
          const ms = Date.now() - lastTimestamp
          lastTimestamp = Date.now()
          console.log('----------', clientUrl, state, ms + 'ms')
        }
      })
    }
  }
  comment.on('challenge', (challenge) => {
    fs.appendFileSync('debug.log', 'success\n')
    console.log('challenge:', challenge.challengeRequestId)
    console.log('done')
    process.exit()
  })
  try {
    await comment.publish()
    console.log('challenge request id:', comment._challengeRequest.challengeRequestId)
  }
  catch (e) {
    console.log('try catch publish')
    console.log(e)
    // throw e
  }
})()
