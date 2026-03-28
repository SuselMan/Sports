FROM node:20-alpine AS build
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./backend/
COPY shared/ ./shared/
RUN cd backend && npm ci
COPY backend/ ./backend/
RUN cd backend && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/backend/package.json /app/backend/package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/backend/dist ./dist/
EXPOSE 4000
CMD ["node", "dist/backend/src/index.js"]
