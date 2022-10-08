FROM node:16-alpine

WORKDIR /app
COPY . .

RUN npm config set unsafe-perm true
RUN npm config set unsafe-perm true && \
  apk add --no-cache bash git py-pip make && \
  rm -rf .git && \
  npm i --no-package-lock

RUN cd /app/services/security && npm i --no-package-lock

RUN cd /app && npm run build

