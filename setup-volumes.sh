#!/bin/bash

# 볼륨 디렉토리 생성
mkdir -p docker/volumes/{postgres,mongodb,redis}
mkdir -p docker/init

# 권한 설정
chmod -R 777 docker/volumes/postgres
chmod -R 777 docker/volumes/mongodb
chmod -R 777 docker/volumes/redis

echo "Volume directories created successfully!" 