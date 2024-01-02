FROM node:16-alpine
RUN apk add g++ make py3-pip

ARG NODE_ENV=production
ARG PORT=8000

ENV PORT=8000
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app
COPY . .
RUN npm install


EXPOSE 8000
CMD [ "npm", "run", "start" ]
