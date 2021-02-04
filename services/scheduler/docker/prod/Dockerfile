FROM node:14-alpine3.12 as build

WORKDIR /app

COPY . ./

RUN cd ./services/scheduler && npm i && ./node_modules/.bin/tsc --skipLibCheck

FROM node:14-alpine3.12

WORKDIR /app

RUN mkdir -p ./build/
COPY --from=build /app/services/scheduler/build/ /app/build/
COPY --from=build /app/services/scheduler/package.json /app/build/services/scheduler/package.json
COPY --from=build /app/services/scheduler/docker/prod/docker-entrypoint.sh /docker-entrypoint.sh

RUN mkdir -p /app/services/scheduler/init-data-volume/
COPY --from=build /app/services/scheduler/init-data-volume/ /app/services/scheduler/init-data-volume/

RUN mkdir -p /app/services/scheduler/swagger
COPY --from=build /app/services/scheduler/swagger/ /app/services/scheduler/swagger/

RUN cd ./build/services/scheduler && npm i --production
RUN chmod +x /docker-entrypoint.sh
EXPOSE 50050

WORKDIR /app/build/services/scheduler

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD [""]
