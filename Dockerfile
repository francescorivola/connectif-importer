ARG NODE_IMAGE_TAG
ARG CLI_VERSION

FROM node:${NODE_IMAGE_TAG}

RUN npm i -g connectif-importer@${CLI_VERSION}

USER node
WORKDIR /home/node

ENTRYPOINT [ "connectif-importer" ]

CMD [ "0", "--version" ]