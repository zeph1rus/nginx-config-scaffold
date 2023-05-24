#!/usr/bin/env sh
npx nginx-config-scaffold --basedir /etc/nginx --upstreams --proxies
nginx -t