FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000

# Start the application
CMD ["npm", "start"]