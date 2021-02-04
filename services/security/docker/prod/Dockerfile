FROM node:14-alpine3.12 as build

WORKDIR /app

COPY . ./

RUN cd ./services/security && npm i && ./node_modules/.bin/tsc --skipLibCheck

FROM node:14-alpine3.12

WORKDIR /app

RUN mkdir -p ./build/
COPY --from=build /app/services/security/build/ /app/build/
COPY --from=build /app/services/security/package.json /app/build/services/security/package.json
COPY --from=build /app/services/security/docker/prod/docker-entrypoint.sh /docker-entrypoint.sh

RUN mkdir -p /app/services/security/init-data-volume/
COPY --from=build /app/services/security/init-data-volume/ /app/services/security/init-data-volume/

RUN mkdir -p /app/services/security/utils/mailer/templates/
COPY --from=build /app/services/security/src/utils/mailer/templates/ /app/services/security/src/utils/mailer/templates/

RUN mkdir -p /app/services/security/swagger
COPY --from=build /app/services/security/swagger/ /app/services/security/swagger/

RUN cd ./build/services/security && npm i --production
RUN chmod +x /docker-entrypoint.sh
EXPOSE 50050

WORKDIR /app/build/services/security

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD [""]
