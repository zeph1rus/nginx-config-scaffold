const {expect, it} = require('@jest/globals')

const {getNginxProxies, getNginxUpstreams} = require('../parseConfig')


const hostnameObject = [
    "www.i.am.a.proxy.site.com",
    "single_upstream",
    "multiple_upstreams"
]

const upstreamObject = [
    "i.am.multiple.servers.1",
    "i.am.multiple.servers.2",
    "i.am.multiple.servers.3",
    "i.am.one.server"
]



it('Test Getting Proxy Hostnames', async () => {
    const result = await getNginxProxies('./testdata')
    hostnameObject.forEach(hn => expect(result).toContain(hn))
})

it('Test Getting Upstream Hostnames', async () => {
    const result = await getNginxUpstreams('./testdata')
    upstreamObject.forEach(us => expect(result).toContain(us))
})