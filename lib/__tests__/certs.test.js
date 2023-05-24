const {expect, it} = require('@jest/globals')

const {getSelfSignedCert} = require('../createCert')
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

it('Test Creating Cert', async () => {
    const selfSignedCert = await getSelfSignedCert('www.example.com')
    // it is enough for us to just check that the function generates a valid cert format
    expect(selfSignedCert).toHaveProperty('cert')
    expect(selfSignedCert.cert).toContain('BEGIN CERTIFICATE')
    expect(selfSignedCert).toHaveProperty('fingerprint')
    expect(selfSignedCert).toHaveProperty('private')
    expect(selfSignedCert.private).toContain('PRIVATE KEY')
})