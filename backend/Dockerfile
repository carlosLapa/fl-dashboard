FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENV CORS_ORIGINS=https://ferreiralapa-dashboard.pt
ENV SLACK_ENABLED=true
ENV SLACK_DEFAULT_CHANNEL=#fl-dashboard-notificacoes
ENV SLACK_NOTIFICATION_TYPES=TAREFA_ATRIBUIDA,TAREFA_STATUS_ALTERADO,PROJETO_CONCLUIDO,TAREFA_CONCLUIDA

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

CMD ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]