# Stage 1: Build React Application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Pass build arguments for Vite environment variables
ARG VITE_AUTH_API=http://localhost:5001/api/auth
ARG VITE_RESTAURANT_API=http://localhost:5002/api
ARG VITE_ORDER_API=http://localhost:5003/api/orders
ARG VITE_DELIVERY_API=http://localhost:5004/api/deliveries
ARG VITE_CUSTOMER_API=http://localhost:5005/api/customers

ENV VITE_AUTH_API=$VITE_AUTH_API
ENV VITE_RESTAURANT_API=$VITE_RESTAURANT_API
ENV VITE_ORDER_API=$VITE_ORDER_API
ENV VITE_DELIVERY_API=$VITE_DELIVERY_API
ENV VITE_CUSTOMER_API=$VITE_CUSTOMER_API

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
