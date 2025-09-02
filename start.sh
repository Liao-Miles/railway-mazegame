#!/bin/bash

# 更新套件清單
apt-get update -y

# 安裝 OpenJDK 21
apt-get install -y openjdk-21-jdk

# 確認 java 可用
java -version

# 啟動你的後端
java -jar springboot-backend/target/maze-escape-0.0.1-SNAPSHOT.jar

