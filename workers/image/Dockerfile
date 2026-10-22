FROM node:22-alpine
WORKDIR /app
RUN npm install -g pnpm@10
COPY package.json pnpm-workspace.yaml ./
RUN pnpm install
COPY . .
CMD ["pnpm", "start"]
