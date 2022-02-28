#################################################
# Base image for the application container
#################################################
FROM node:14-alpine

# We specify this variable for the correct execution of the libraries in production mode
ENV NODE_ENV production

# We define the working directory in /usr/src/app/
WORKDIR /usr/src/app

# We copy the application files
COPY certs /usr/src/app/certs/
COPY config /usr/src/app/config/
COPY src /usr/src/app/src/
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/


# We install the dependencies that the app needs
RUN npm ci --only=production --ignore-scripts

# Indicates the port that the container exposes
EXPOSE 3445

# Command that is executed when the container is started
CMD ["node", "src/server.js"]
