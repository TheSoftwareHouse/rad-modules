FROM node:14-alpine3.12

WORKDIR /app
COPY . .

RUN npm config set unsafe-perm true
RUN npm config set unsafe-perm true && \
  apk add --no-cache bash git py-pip make && \
  rm -rf .git && \
  npm i --no-package-lock

ENV CHROME_BIN=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/lib/chromium/ \
    CHROMIUM_PATH=/usr/bin/chromium-browser \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN cd /app/services/gateway && npm i --no-package-lock
RUN cd /app/services/security && npm i --no-package-lock
RUN cd /app/services/scheduler && npm i --no-package-lock
RUN cd /app/services/mailer && npm i --no-package-lock
RUN cd /app/services/notifications && npm i --no-package-lock
RUN cd /app/services/pdf && npm i --no-package-lock

RUN cd /app && npm run build

