# Step 1: 使用 Maven + OpenJDK 21 build 專案
FROM maven:3.9.3-jdk-21-slim AS build

WORKDIR /app

# 複製 Maven 配置
COPY springboot-backend/pom.xml ./
RUN mvn dependency:go-offline

# 複製原始碼
COPY springboot-backend/src ./src

# Build 專案
RUN mvn clean package -DskipTests

# Step 2: 使用 OpenJDK 21 運行 jar
FROM openjdk:21-jdk-slim

WORKDIR /app

# 複製 build 後的 jar
COPY --from=build /app/target/maze-escape-0.0.1-SNAPSHOT.jar ./maze-escape.jar

# 啟動應用
CMD ["java", "-jar", "maze-escape.jar"]
