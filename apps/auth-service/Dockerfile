FROM node:18-alpine AS builder

# 소스 코드 복사
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY apps/auth-service ./apps/auth-service
COPY libs/common ./libs/common

# 의존성 설치
RUN npm install

# common 라이브러리 빌드
RUN npm run build:common

# 서비스 빌드
RUN npm run build:auth

# 실행 이미지
FROM node:18-alpine
WORKDIR /app

# 환경 변수 설정
ENV NODE_ENV=production

# 빌드된 결과물 복사
COPY --from=builder /app/dist/apps/auth-service ./
COPY --from=builder /app/libs/common/dist ./node_modules/@work-better/common
COPY --from=builder /app/libs/common/package.json ./node_modules/@work-better/common/package.json

# 실행에 필요한 package.json 복사
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/auth-service/package*.json ./
RUN npm install --production

# 서비스 실행
EXPOSE 3002
CMD ["node", "main.js"] 