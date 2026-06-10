FROM mcr.microsoft.com/devcontainers/typescript-node:4-24-trixie

WORKDIR /workspace

COPY ./ /workspace/
RUN npm install
RUN npm run build

CMD ["npm", "start"]