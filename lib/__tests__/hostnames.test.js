const {expect, it} = require('@jest/globals')

const {getNginxProxies, getNginxUpstreams, parseProxyUrl} = require('../parseConfig')


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

it('Parse Proxy Url', () => {
    expect(parseProxyUrl("https://www.i.am.a.proxy.site.com:443")).toBe("www.i.am.a.proxy.site.com")
    expect(parseProxyUrl("https://127.0.0.1:80")).toBe("127.0.0.1")
    expect(parseProxyUrl("ftps://upload.microsoft.com:21")).toBe("upload.microsoft.com")
    expect(parseProxyUrl("rtcp://3f89asdlhklasdf.media.videosite.tv:23130")).toBe("3f89asdlhklasdf.media.videosite.tv")
})