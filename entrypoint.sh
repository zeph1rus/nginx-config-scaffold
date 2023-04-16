#!/usr/bin/env sh
node index.js --baseDir /etc/nginx --upstreams
nginx -t
