const path = require('path');
const { describe, it, before, after } = require('mocha');
const axios = require('axios');
const { expect } = require('chai');
const packageJson = require('../package.json');

const { create } = require('../lib/server.js');

describe('server', function () {
  let server;
  let url;

  before(async () => {
    server = await create({ validationLevel: 'strict' }).listen();
    url = `http://localhost:${server.address().port}`;
  });

  after(async () => {
    await server.close();
  });

  const mjmlPayload = `
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-image width="100px" src="https://mjml.io/assets/img/logo-small.png"></mj-image>
        <mj-divider border-color="#F45E43"></mj-divider>
        <mj-text font-size="20px" color="#F45E43" font-family="helvetica">Hello World</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
  `;

  it('renders valid mjml', async () => {
    const res = await makeReq(url, { data: mjmlPayload });
    expect(res.status).to.eql(200);
    expect(res.data.html).to.include('<!doctype html>');
    expect(res.data.mjml).to.eql(mjmlPayload);
    expect(res.data.mjml_version).to.eql(packageJson.dependencies.mjml);
    expect(res.data.errors).to.eql([]);
  });

  it('returns 400 on errors', async () => {
    const res = await makeReq(url, { data: '<mj-text foo=bar>hello</mj-text>' });
    expect(res.status).to.eql(400);
    expect(res.data).to.eql({
      message: 'Failed to compile mjml',
      level: 'error',
      errors: [{
        line: 1,
        message: 'Attribute foo is illegal',
        tagName: 'mj-text',
        formattedMessage: `Line 1 of ${path.resolve(__dirname, '..')} (mj-text) — Attribute foo is illegal`
      }]
    });
  });

  it('returns 404 on invalid endpoints', async () => {
    const res = await makeReq(url, { path: '/' });
    expect(res.status).to.eql(404);
    expect(res.data).to.eql({ message: "You're probably looking for /v1/render" });
  });

  // The old API did not pass a json object containing the key mjml. The entire
  // payload was a mjml document.
  it('is backwards compatible with the old API', async () => {
    const res = await axios({
      method: 'POST',
      url: url + '/v1/render',
      headers: { 'Content-Type': '' },
      data: mjmlPayload,
      validateStatus: false
    });

    expect(res.status).to.eql(200);
    expect(res.data.html).to.include('<!doctype html>');
    expect(res.data.errors).to.eql([]);
  });
});

describe('with --max-body', function () {
  let server;
  let url;

  before(async () => {
    server = await create({ maxBody: '10' }).listen();
    url = `http://localhost:${server.address().port}`;
  });

  after(async () => {
    await server.close();
  });

  it('returns 413 for payloads larger than --max-body', async () => {
    const data = 'o'.repeat(10);
    const res = await makeReq(url, { data: `<mj-text>${data}</mj-text>` });
    expect(res.status).to.eql(413);
  });
});

const makeReq = (url, { method = 'POST', path = '/v1/render', data = '' } = {}) => {
  return axios({
    method: 'POST',
    url: url + path,
    data: { mjml: data },
    validateStatus: false
  });
};
