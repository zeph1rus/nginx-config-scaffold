#!/usr/bin/env sh
node cli.js --basedir /etc/nginx --upstreams --proxies
nginx -t
