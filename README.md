# nginx-config-scaffold

`nginx-config-scaffold` is a tool to help you scaffold out nginx config dependencies, such as hostnames for upstreams and proxy destinations, and to create dummy certificates to allow you to test nginx configs (using `nginx -t`) without having to have your full nginx environment available.

## Installing

Install with `npm install @zeph1rus/nginx-config-scaffold`

You'll need a version of Node.JS greater that `10.0.0`, greater than 16 is HIGHLY RECOMMENDED!

## Running

If you're testing nginx configs in an ephemeral CI environment such as Github Actions, Gitlab, or Bitbucket cloud,  just install nginx, copy your config to the nginx config directory, and run 

`npx run nginx-config-scaffold --basedir <your-config-dir>`

by default we only create certificates, if you wish for your `/etc/hosts` to be updated with proxies or upstreams there are additional parameters to add

### Parameters

        --basedir <baseDir>    Directory to scan configs from recursively
        --upstreams            Add upstreams to hosts file
        --proxies              Add proxy hosts to hosts file
        --dryrun               Don't make changes, just tell me what it would do
        --help/-h              This help

## Running in a Dockerfile

We've provided a sample dockerfile and entrypoint.sh to allow you to build a docker image and use that to test.  You will want to update `MY_CONFDIR_CHANGE_ME` to match your config directory

When run this container will exit with a non-zero exit code if the test fails

### Dockerfile

    FROM alpine:latest
    RUN apk add nginx nodejs npm
    COPY MY_CONFDIR_CHANGE_ME /etc/nginx
    RUN mkdir /opt/app
    WORKDIR "/opt/app"
    COPY "lib" "/opt/app/lib"
    COPY "cli.js" "."
    COPY "entrypoint.sh" "."
    RUN chmod u+x entrypoint.sh
    COPY "package.json" "."
    RUN npm install
    ENTRYPOINT ["./entrypoint.sh"]

### entrypoint.sh

    #!/usr/bin/env sh
    node cli.js --basedir /etc/nginx --upstreams --proxies
    nginx -t
