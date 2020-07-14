check_github_credentials() {
    if [ -z $GH_NAME ] && [ -z $GH_EMAIL ] && [ -z $GH_TOKEN ]
    then
        echo "ERROR: github login, email or token is missing."
        exit 1
    fi
}

echo "Preparing swagger.json files to Redoc."

check_github_credentials &&
git config --global user.name "${GH_NAME}" &&
git config --global user.email "${GH_EMAIL}" &&
git clone https://$GH_NAME:$GH_TOKEN@github.com/TheSoftwareHouse/rad-modules-api-docs.git &&
cp ./api-docs/index.html ./rad-modules-api-docs/ &&
cp ./api-docs/mailer.json ./rad-modules-api-docs/ &&
cp ./api-docs/notifications.json ./rad-modules-api-docs/ &&
cp ./api-docs/scheduler.json ./rad-modules-api-docs/ &&
cp ./api-docs/security.json ./rad-modules-api-docs/ &&
cp ./api-docs/gateway.json ./rad-modules-api-docs/ &&
cp ./api-docs/pdf.json ./rad-modules-api-docs/ &&
cd ./rad-modules-api-docs &&
git add . &&
git commit -m "Update Redoc files." &&
git push origin master &&
cd ..
rm -rf ./rad-modules-api-docs/