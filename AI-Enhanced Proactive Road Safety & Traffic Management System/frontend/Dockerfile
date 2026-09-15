FROM node:18-alpine

WORKDIR /app

COPY package.json .
# We don't have package-lock.json since we didn't run npm install locally
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
