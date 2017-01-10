FROM node:latest
#FROM ubuntu:latest

# Application Setup

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Clone repo
#RUN git clone https://github.com/reTHINK-project/scenario-service-implementation.git
#COPY scenario-service-implementation/nodejs_rethink_module_lwm2m/rethink-lwm2m/* /usr/src/app/

# Copy app files
COPY . /usr/src/app

# Install dependencies
RUN npm install

# Expose http interface of lwm2m-server
EXPOSE 8000

# Expose lwm2m
EXPOSE 5683

CMD [ "npm", "start" ]