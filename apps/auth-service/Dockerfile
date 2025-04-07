FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./
COPY tsconfig*.json ./

# 서비스 및 공통 라이브러리 소스 코드 복사
COPY apps/auth-service ./apps/auth-service
COPY libs/common ./libs/common

# 의존성 설치
RUN npm ci

# 공통 라이브러리 빌드
RUN npm run build:common

# 서비스 빌드
RUN npm run build:auth

# 실행 이미지
FROM node:18-alpine AS runtime
WORKDIR /app

# 환경 변수 설정
ENV NODE_ENV=production

# 필요한 파일만 복사
COPY --from=builder /app/dist/apps/auth-service ./
COPY --from=builder /app/libs/common/dist ./node_modules/@work-better/common
COPY --from=builder /app/libs/common/package.json ./node_modules/@work-better/common/package.json

# 프로덕션 의존성만 설치
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/auth-service/package*.json ./
RUN npm ci --omit=dev

# 서비스 실행
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3002/health || exit 1
CMD ["node", "main.js"] 