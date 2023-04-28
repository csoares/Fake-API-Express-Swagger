FROM node:18-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY app/package*.json ./
RUN npm install
COPY app .
EXPOSE 3000
CMD ["npm", "run", "start"]