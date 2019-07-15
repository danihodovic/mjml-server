# mjml-http-server

A self-hosted alternative to the mjml API. Built with express.

#### Why?

You're writing an app in another language than Javascript and need to interop
with MJML. Instead of embedding NodeJS in your Python image you can call MJML
compilation over HTTP.

You can alternatively use the [MJML API](https://mjml.io/api), but it's
currently invite only and has privacy implications (do you want your emails to
be sent to yet another third party?).

For an elaborate discussion see: https://github.com/mjmlio/mjml/issues/340

#### Usage

```
docker run -p 15500:15500 danihodovic/mjml-server

$ http POST localhost:15500
HTTP/1.1 400 Bad Request
Connection: keep-alive
Content-Length: 70
Content-Type: text/html; charset=utf-8
Date: Mon, 15 Jul 2019 09:27:07 GMT
ETag: W/"46-U/vqnFpPpjcCarDMmfOu1LVRVAw"
X-Powered-By: Express

Encountered an error while compiling mjml. Check your server logs
```
