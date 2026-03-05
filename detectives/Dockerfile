FROM oven/bun:latest

WORKDIR /app

# install dependencies first (layer cache)
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# copy source
COPY . .

CMD ["bun", "run", "index.ts"]
