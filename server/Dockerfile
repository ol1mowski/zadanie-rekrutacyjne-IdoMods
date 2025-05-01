FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

RUN npm run build

EXPOSE $PORT

CMD ["npm", "start"] 