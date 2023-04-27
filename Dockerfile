FROM alpine
EXPOSE 3030
WORKDIR /app
RUN apk add --update npm
COPY . .
RUN npm ci
CMD npm run start