FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# ✅ Run install inside Docker (not using node_modules from host)
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
