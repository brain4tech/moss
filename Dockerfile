FROM oven/bun

RUN mkdir /moss
WORKDIR /moss

ADD src src
ADD package.json package.json
RUN bun install

CMD bun run src/index.ts
