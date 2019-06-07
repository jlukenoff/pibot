#image to build upon
FROM node:7.6-alpine

#make the directory within container for source code to live
RUN mkdir -p /src/app

#tell docker where the source should live
WORKDIR /src/app

#Move source code to WORKDIR
COPY . /src/app

#Install dependencies
RUN npm install

#Build JS packages
RUN npm run build

#Expose container port
EXPOSE 3000

#start app
CMD [ "npm", "start" ]