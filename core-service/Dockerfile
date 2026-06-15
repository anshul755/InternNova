# ── Build stage ─────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /build
COPY pom.xml ./
# Download dependencies first (cache layer — speeds up rebuilds)
RUN mvn dependency:go-offline -q 2>/dev/null || true
COPY src/ ./src/
RUN mvn clean package -DskipTests -q

# ── Runtime stage ───────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8080
USER appuser

# JVM heap capped at 512MB — Oracle free tier has 24GB, plenty safe
ENV JAVA_TOOL_OPTIONS="-Xmx512m"

HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=5 \
  CMD wget -q -T 10 -O /dev/null http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
