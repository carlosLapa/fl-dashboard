FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

COPY target/*.jar app.jar
EXPOSE 8080
ENV CORS_ORIGINS=https://ferreiralapa-dashboard.pt
ENV SLACK_ENABLED=true
ENV SLACK_DEFAULT_CHANNEL=#fl-dashboard-notificacoes
ENV SLACK_NOTIFICATION_TYPES=TAREFA_ATRIBUIDA,TAREFA_STATUS_ALTERADO,PROJETO_CONCLUIDO,TAREFA_CONCLUIDA

HEALTHCHECK --interval=45s --timeout=10s --start-period=120s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

CMD ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]