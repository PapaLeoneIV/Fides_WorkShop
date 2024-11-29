FROM mcr.microsoft.com/playwright:v1.45.0
WORKDIR /app

ARG PLAYWRIGHT_BROWSERS_PATH=/ms-playwright-cache
ENV PLAYWRIGHT_BROWSERS_PATH=$PLAYWRIGHT_BROWSERS_PATH
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

COPY package*.json ./
RUN npm install

RUN npx playwright install-deps

COPY . .
CMD ["npm", "run", "e2e"]