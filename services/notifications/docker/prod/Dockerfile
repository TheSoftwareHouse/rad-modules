FROM node:14-alpine3.12 as build

WORKDIR /app

COPY . ./

RUN cd ./services/notifications && npm i && ./node_modules/.bin/tsc --skipLibCheck

FROM node:14-alpine3.12

WORKDIR /app

RUN mkdir -p ./build/
COPY --from=build /app/services/notifications/build/ /app/build/
COPY --from=build /app/services/notifications/package.json /app/build/services/notifications/package.json
COPY --from=build /app/services/notifications/docker/prod/docker-entrypoint.sh /docker-entrypoint.sh

RUN mkdir -p /app/services/notifications/swagger
COPY --from=build /app/services/notifications/swagger/ /app/services/notifications/swagger/

RUN cd ./build/services/notifications && npm i --production
RUN chmod +x /docker-entrypoint.sh
EXPOSE 50050
EXPOSE 30050

WORKDIR /app/build/services/notifications

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD [""]
