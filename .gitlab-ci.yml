image: node:latest

cache:
  paths:
  - node_modules/

job:
  script:
  - apt-get update -qy
  - apt-get install -y ruby ruby-dev rubygems-integration
  - npm install
  - gem install --no-rdoc --no-ri dpl
  - dpl --provider=heroku --app=YOUR-APP --api-key=API KEY OF YOU
# change app name and api key if necessary
