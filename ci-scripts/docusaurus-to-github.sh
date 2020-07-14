check_github_credentials() {
    if [ -z $GH_NAME ] && [ -z $GH_EMAIL ] && [ -z $GH_TOKEN ]
    then
        echo "ERROR: github login, email or token is missing."
        exit 1
    fi
}

check_github_credentials &&
cp ./CHANGELOG docusaurus/docs/changelog.md &&
git config --global user.name "${GH_NAME}" &&
git config --global user.email "${GH_EMAIL}" &&
echo "machine github.com login ${GH_NAME} password ${GH_TOKEN}" > ~/.netrc &&
cd ./docusaurus/website &&
npm install &&
GIT_USER="${GH_NAME}" npm run publish-gh-pages