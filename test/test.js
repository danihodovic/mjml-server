const { describe, it, before, after } = require('mocha')
const axios = require('axios')
const assert = require('assert')

const { create } = require('../lib/server.js')

describe('server', function () {
  let server
  let url

  before(async () => {
    server = await create({ validationLevel: 'strict' }).listen()
    url = `http://localhost:${server.address().port}`
  })

  after(async () => {
    await server.close()
  })

  it('renders', async () => {
    const res = await makeReq(url, { data: '<mj-text>hello</mj-text>' })
    assert(res.status, 200)
    assert(res.data.html.includes('<!doctype html>'))
  })

  it('returns 400 on errors', async () => {
    const res = await makeReq(url, { data: '<mj-text>hello' })
    assert(res.status, 400)
  })

  it('returns 404 on invalid endpoints', async () => {
    const res = await makeReq(url, { path: '/' })
    assert(res.status, 404)
    assert(res.data, "You're probably looking for /v1/render")
  })
})

const makeReq = (url, { method = 'POST', path = '/v1/render', data = '' } = {}) => {
  return axios({
    method: 'POST',
    url: url + path,
    data: '<mj-text>hello</mj-text>',
    validateStatus: false
  })
}
