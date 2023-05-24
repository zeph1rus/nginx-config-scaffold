FROM alpine:latest
RUN apk add nginx nodejs npm
COPY MY_CONFDIR_CHANGE_ME /etc/nginx
RUN mkdir /opt/app
WORKDIR "/opt/app"
COPY "entrypoint.sh" "."
RUN chmod u+x entrypoint.sh
RUN npm i @zeph1rus/nginx-config-scaffold
ENTRYPOINT ["./entrypoint.sh"]