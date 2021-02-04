FROM node:14-alpine3.12 as build

WORKDIR /app

COPY . ./

RUN cd ./services/pdf && npm i && ./node_modules/.bin/tsc --skipLibCheck

FROM node:14-alpine3.12

## Installs latest Chromium package.
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" > /etc/apk/repositories \
    && echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
    && echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
    && echo "http://dl-cdn.alpinelinux.org/alpine/v3.11/main" >> /etc/apk/repositories \
    && apk upgrade -U -a \
    && apk add --no-cache \
    xvfb \
    libstdc++ \
    chromium \
    harfbuzz \
    nss \
    freetype \
    ttf-freefont \
    wqy-zenhei \
    && rm -rf /var/cache/* \
    && mkdir /var/cache/apk

ENV CHROME_BIN=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/lib/chromium/ \
    CHROMIUM_PATH=/usr/bin/chromium-browser \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

RUN mkdir -p ./build/ && mkdir -p /tmp/pdf
COPY --from=build /app/services/pdf/build/ /app/build/
COPY --from=build /app/services/pdf/package.json /app/build/services/pdf/package.json
COPY --from=build /app/services/pdf/docker/prod/docker-entrypoint.sh /docker-entrypoint.sh

RUN cd ./build/services/pdf && npm i --production
RUN chmod +x /docker-entrypoint.sh
EXPOSE 50050

WORKDIR /app/build/services/pdf

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD [""]