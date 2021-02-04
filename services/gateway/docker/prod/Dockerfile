FROM node:14-alpine3.12 as build

WORKDIR /app

COPY . ./

RUN cd ./services/gateway && npm i && ./node_modules/.bin/tsc --skipLibCheck

FROM node:14-alpine3.12

WORKDIR /app

RUN mkdir -p ./build/
COPY --from=build /app/services/gateway/build/ /app/build/
COPY --from=build /app/services/gateway/package.json /app/build/services/gateway/package.json
COPY --from=build /app/services/gateway/docker/prod/docker-entrypoint.sh /docker-entrypoint.sh

RUN mkdir -p /app/build/services/gateway/src/config/
COPY --from=build /app/services/gateway/src/config/proxy.json /app/build/services/gateway/src/config/proxy.json

RUN cd ./build/services/gateway && npm i --production
RUN chmod +x /docker-entrypoint.sh
EXPOSE 50050

WORKDIR /app/build/services/gateway

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD [""]