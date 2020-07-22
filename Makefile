install:
	npm i
	cd ./services/mailer && npm i
	cd ./services/notifications && npm i
	cd ./services/scheduler && npm i
	cd ./services/security && npm i
	cd ./services/gateway && npm i
	cd ./services/pdf && npm i

docker-build-dev:
	npm run docker-build-watcher
	npm run docker-build-security
	npm run docker-build-notifications
	npm run docker-build-mailer	
	npm run docker-build-scheduler
	npm run docker-build-gateway
	npm run docker-build-pdf

docker-build-prod:
	npm run docker-build-security-prod
	npm run docker-build-notifications-prod
	npm run docker-build-mailer-prod
	npm run docker-build-scheduler-prod
	npm run docker-build-gateway-prod
	npm run docker-build-pdf-prod

npm-install-in-all-build-services:	
	cd ./build/services/mailer && npm i
	cd ./build/services/notifications && npm i
	cd ./build/services/scheduler && npm i
	cd ./build/services/security && npm i
	cd ./build/services/gateway && npm i
	cd ./build/services/pdf && npm i

watch:
	npm run watch

clean:
	-docker rm $$(docker ps -aq -f name=rad-modules) -f
	-docker rm builder -f
	-rm -rf ./**/node_modules
	-docker rmi notifications-service -f
	-docker rmi gateway-service -f
	-docker rmi mailer-service -f
	-docker rmi scheduler-service -f
	-docker rmi security-service -f
	-docker rmi pdf-service -f
	-yes | docker volume prune

all:
	make install
	npm run docker-build-all-dev
