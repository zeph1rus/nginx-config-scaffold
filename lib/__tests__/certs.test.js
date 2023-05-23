const {expect, it} = require('@jest/globals')

const {getNginxCerts} = require('../parseConfig')


const certObject1 = {
        "certFile": "/etc/ssl/nginx/my.cert.upstreams/my.cert.crt",
        "keyFile": "/etc/ssl/nginx/my.cert.upstreams/my.cert.key"
}

const certObject2 = {
        "certFile": "/etc/ssl/nginx/my.cert.dir/my.cert.crt",
        "keyFile": "/etc/ssl/nginx/my.cert.dir/my.cert.key"
}


it('Test Get Certificates', async () => {
    const result = await getNginxCerts('./testdata')
    console.log(result)
    expect(result).toContainEqual(certObject1)
    expect(result).toContainEqual(certObject2)
})