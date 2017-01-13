## TODO: EVALUATE IF NEEDED

FROM nginx:stable


# Application Setup

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app


# Copy app files
COPY . /usr/src/app


# Expose http/s
EXPOSE 80
EXPOSE 443