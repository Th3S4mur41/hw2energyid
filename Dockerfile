FROM node:lts-slim

RUN apt-get update && apt-get install avahi-utils -y
 
WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
 
RUN npm ci
 
COPY . .
 
ENV energyid ''
# p1 is deprecated, use meter instead
ENV p1 ''
ENV meter ${p1}

CMD npx homewizard-webhooks --energyid=${energyid} --meter=${meter} -r
