FROM node:20-alpine
WORKDIR /app
COPY . .
EXPOSE 8080
RUN npm install
CMD ["npm","start"]