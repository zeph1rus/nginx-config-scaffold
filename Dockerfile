FROM alpine:3.14
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