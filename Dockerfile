# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1
WORKDIR /usr/src/app

# install curl & git so we can install foundry
RUN apt-get -y update && apt-get install -y curl git

# install foundry
USER bun
ENV SHELL /bin/bash
RUN curl -L https://foundry.paradigm.xyz | bash
RUN /home/bun/.foundry/bin/foundryup
USER root
ENV PATH="/home/bun/.foundry/bin:${PATH}"

# copy the source code
COPY . .

# update suave example's .env file with docker-compatible localhost
RUN sed -i 's/SUAVE_RPC_URL_HTTP=.*/SUAVE_RPC_URL_HTTP=http:\/\/172.17.0.1:8545/' examples/suave/.env

# install the dependencies
RUN bun install

# run the app
EXPOSE 5173/tcp
WORKDIR /usr/src/app/examples
ENTRYPOINT [ "bash" ]
