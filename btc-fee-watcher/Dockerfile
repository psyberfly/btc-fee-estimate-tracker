# Use an official Node.js runtime as the base image
FROM node:18

USER root
ENV USER_ID=1300
RUN usermod -u $USER_ID node
RUN mkdir -p /home/node/app
RUN mkdir -p /home/node/winston && mkdir /home/node/.keys

RUN openssl genrsa -out /home/node/.keys/sats_sig.pem 4096
RUN openssl rsa -in /home/node/.keys/sats_sig.pem -outform PEM -pubout -out /home/node/.keys/sats_sig.pub

RUN chown -R node /home/node/app /home/node/.keys /home/node/winston
RUN npm install -g typescript mocha ts-node


USER node
WORKDIR /home/node/app
COPY --chown=node:node package*.json ./
RUN npm install
COPY --chown=node:node . .

ENV SERVER_PORT=3561
ENV WSS_PORT=3572
ENV PATH_TO_CSV="/home/node/app/assets/fee_estimate_history.csv"

EXPOSE 3561
EXPOSE 3572

CMD npx prisma db push && npx tsc && npm start
