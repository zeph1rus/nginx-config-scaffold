const createSkeleton = require("./lib/skeletonCreate")
const  argv = require('minimist')(process.argv.slice(2), {
    default: {
        baseDir: false,
        help: false,
        h: false,
        upstreams: false,
        u: false,
        dryrun: false
    },
});


function printHelp() {
    console.log("nginx-config-scaffold: A tool to scaffold out nginx certs + dns so that you can test configs in CI environments")
    console.log("Params: " +
        "\n --baseDir <baseDir> Directory to scan configs from. Defaults to current working directory \n" +
        " --upstreams/-u add upstreams to hosts file \n" +
        "--dryrun don't make changes, just tell me what it would do \n" +
        " --help/-h this help ")
}

async function main() {
    if (argv.help === true || argv.h === true || argv.baseDir === false) {
        printHelp()
        return
    }

    const FLAG_UPSTREAMS = (argv.upstreams === true || argv.u === true)
    const FLAG_DRYRUN = argv.dryrun

    await createSkeleton.createSkeleton(argv.baseDir, FLAG_UPSTREAMS, FLAG_DRYRUN)
}

void main()