FROM node:lts-slim

RUN apt-get update && apt-get install avahi-utils -y
 
WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
 
RUN npm ci
 
COPY . .
 
ENV energyid ''
ENV p1 ''

CMD npx hw2energyid--energyid=${energyid} --p1=${p1} -r
