FROM node:16.15.0-alpine
RUN apk update && apk add tzdata
ENV TZ=Asia/Kuala_Lumpur
ENV npm_config_cache /app/.npm

RUN addgroup -g 1001 -S appuser && adduser -u 1001 -S appuser -G appuser

COPY .env .env
COPY ./ /app
WORKDIR /app

RUN chown -R appuser:appuser /app

USER appuser

RUN npm install
RUN npm run build

RUN mkdir -p /app/logs \
    && mkdir -p /app/logs/applications \
    && mkdir -p /app/logs/exceptions \
    && mkdir -p /app/logs/errors \
    && chmod -R 777 /app/logs

ENV SERVER_PORT_NUMBER 8501
ENV NODE_ENV development

EXPOSE 8501

#RUN  npx mikro-orm migration:create --initial

CMD ["npm", "run", "start:dev"]