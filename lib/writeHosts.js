const fs  = require('node:fs')

/**
 * @method formatHostsEntry
 * @param hostname {string}
 * @param destination {string} IP To Point to
 * @return {string} formatted hostsfile entry
 */
function formatHostsEntry(hostname, destination) {
    return `${destination}\t\t${hostname}\n`
}

/**
 * @method addToHostsFile
 * @summary Appends an entry to the hosts file
 * @param hostname {string} - Hostname to write to hosts file
 * @param filename {string} - Hostname file to write to. Defaults to /etc/hosts
 * @param destination {string} - IP Address to Point entry to. Defaults to 127.0.0.1
 * @return {Promise<void>}
 */
function addToHostsFile(hostname, filename="/etc/hosts", destination="127.0.0.1") {
    const formattedEntry = formatHostsEntry(hostname, destination)
    try {
        fs.appendFileSync(filename, formattedEntry)
        console.log(`added to hostsfile ${formattedEntry}`)
    } catch(e) {
        console.error(`Couldn't update hostsfile with ${hostname} - Error: ${e}`)
    }
}

exports.addToHostsFile = addToHostsFile