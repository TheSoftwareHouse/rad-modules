FROM node:14-alpine3.12 as build

WORKDIR /app

COPY . ./

RUN cd ./services/mailer && npm i && ./node_modules/.bin/tsc --skipLibCheck

FROM node:14-alpine3.12

WORKDIR /app

RUN mkdir -p ./build/
COPY --from=build /app/services/mailer/build/ /app/build/
COPY --from=build /app/services/mailer/package.json /app/build/services/mailer/package.json
COPY --from=build /app/services/mailer/docker/prod/docker-entrypoint.sh /docker-entrypoint.sh

RUN mkdir -p /app/services/mailer/mail-templates/
COPY --from=build /app/services/mailer/mail-templates/ /app/services/mailer/mail-templates/

RUN mkdir -p /app/services/mailer/swagger
COPY --from=build /app/services/mailer/swagger/ /app/services/mailer/swagger/

RUN cd ./build/services/mailer && npm i --production
RUN chmod +x /docker-entrypoint.sh
EXPOSE 50050

WORKDIR /app/build/services/mailer

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD [""]