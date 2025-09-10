package com.fl.dashboard.services;

import com.fl.dashboard.dto.*;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class SlackNotificationManagerService implements ApplicationContextAware {
    private static final Logger logger = LoggerFactory.getLogger(SlackNotificationManagerService.class);
    // Mapa para armazenar notificações pendentes por tarefa e tipo
    private final Map<String, SlackGroupedNotificationDTO> pendingNotifications = new ConcurrentHashMap<>();
    // Scheduler para enviar notificações pendentes
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private ApplicationContext applicationContext;

    @Autowired
    private SlackService slackService;

    public SlackNotificationManagerService() {
        // Iniciar o processador que envia as notificações a cada 3 segundos
        scheduler.scheduleAtFixedRate(this::processPendingNotifications, 3, 3, TimeUnit.SECONDS);
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }

    // Método para obter o TarefaService sob demanda
    private TarefaService getTarefaService() {
        return applicationContext.getBean(TarefaService.class);
    }

    /**
     * Adiciona uma notificação para uma tarefa e users.
     * Versão que aceita entidades para compatibilidade com código existente.
     */
    public void addNotification(String type, String title, Tarefa tarefa, User user) {
        if (!slackService.isEnabled() || !slackService.shouldSendNotificationType(type)) {
            return;
        }

        try {
            // Buscar a tarefa atualizada com todos os users usando o serviço obtido via ApplicationContext
            TarefaWithUsersDTO tarefaDTO = getTarefaService().findByIdWithUsers(tarefa.getId());

            // Buscar também informações do projeto
            try {
                TarefaWithUserAndProjetoDTO tarefaComProjeto =
                        getTarefaService().findByIdWithUsersAndProjeto(tarefa.getId());

                // Extrair projeto se disponível
                ProjetoDTO projeto = tarefaComProjeto.getProjeto();

                // Criar uma chave única para esta tarefa e tipo de notificação
                String key = generateNotificationKey(tarefa.getId(), type);

                // Sincronizar acesso ao mapa de notificações pendentes
                synchronized (pendingNotifications) {
                    // Verificar se já existe uma notificação pendente para esta tarefa e tipo
                    SlackGroupedNotificationDTO notification = pendingNotifications.get(key);

                    if (notification == null) {
                        // Criar uma notificação
                        notification = new SlackGroupedNotificationDTO(type, title, tarefaDTO);
                        // Adicionar o projeto se disponível
                        if (projeto != null) {
                            notification.setProjeto(projeto);
                        }
                        pendingNotifications.put(key, notification);
                    }

                    // O user já deve estar incluído na tarefa, mas por segurança:
                    if (user != null) {
                        notification.addUser(new UserDTO(user));
                    }
                }
            } catch (Exception e) {
                // Fallback para a versão sem projeto
                logger.debug("Could not load project for task {}: {}", tarefa.getId(), e.getMessage());

                String key = generateNotificationKey(tarefa.getId(), type);
                synchronized (pendingNotifications) {
                    SlackGroupedNotificationDTO notification = pendingNotifications.get(key);
                    if (notification == null) {
                        notification = new SlackGroupedNotificationDTO(type, title, tarefaDTO);
                        pendingNotifications.put(key, notification);
                    }
                    if (user != null) {
                        notification.addUser(new UserDTO(user));
                    }
                }
            }

            logger.debug("Added notification for task {} and user {} of type {}",
                    tarefa.getId(), user != null ? user.getId() : "null", type);
        } catch (Exception e) {
            logger.error("Error adding notification for task {}", tarefa.getId(), e);
        }
    }

    /**
     * Adiciona uma notificação para uma tarefa e múltiplos users.
     * Versão que aceita entidades para compatibilidade com código existente.
     */
    public void addNotification(String type, String title, Tarefa tarefa, List<User> users) {
        if (!slackService.isEnabled() || !slackService.shouldSendNotificationType(type)) {
            return;
        }

        try {
            // Buscar a tarefa atualizada com todos os users usando o serviço obtido via ApplicationContext
            TarefaWithUsersDTO tarefaDTO = getTarefaService().findByIdWithUsers(tarefa.getId());

            // Criar uma chave única para esta tarefa e tipo de notificação
            String key = generateNotificationKey(tarefa.getId(), type);

            // Sincronizar acesso ao mapa de notificações pendentes
            synchronized (pendingNotifications) {
                // Verificar se já existe uma notificação pendente para esta tarefa e tipo
                SlackGroupedNotificationDTO notification = pendingNotifications.get(key);

                if (notification == null) {
                    // Criar uma notificação
                    notification = new SlackGroupedNotificationDTO(type, title, tarefaDTO);
                    pendingNotifications.put(key, notification);
                }

                // Adicionar qualquer user adicional que possa não estar na tarefa
                if (users != null) {
                    List<UserDTO> userDTOs = users.stream()
                            .map(UserDTO::new)
                            .collect(Collectors.toList());
                    notification.addUsers(userDTOs);
                }
            }

            logger.debug("Added notification for task {} and {} users of type {}",
                    tarefa.getId(), users != null ? users.size() : 0, type);
        } catch (Exception e) {
            logger.error("Error adding notification for task {}", tarefa.getId(), e);
        }
    }

    /**
     * Adiciona uma notificação usando diretamente o ID da tarefa.
     * Versão recomendada para novos desenvolvimentos.
     */
    public void addNotification(String type, String title, Long tarefaId, List<UserDTO> additionalUsers) {
        if (!slackService.isEnabled() || !slackService.shouldSendNotificationType(type)) {
            return;
        }

        try {
            // Buscar a tarefa com todos os users usando o serviço obtido via ApplicationContext
            TarefaWithUsersDTO tarefaDTO = getTarefaService().findByIdWithUsers(tarefaId);

            // Criar uma chave única para esta tarefa e tipo de notificação
            String key = generateNotificationKey(tarefaId, type);

            // Sincronizar acesso ao mapa de notificações pendentes
            synchronized (pendingNotifications) {
                // Verificar se já existe uma notificação pendente para esta tarefa e tipo
                SlackGroupedNotificationDTO notification = pendingNotifications.get(key);

                if (notification == null) {
                    // Criar notificação
                    notification = new SlackGroupedNotificationDTO(type, title, tarefaDTO);
                    pendingNotifications.put(key, notification);
                }

                // Adicionar users adicionais se fornecidos
                if (additionalUsers != null && !additionalUsers.isEmpty()) {
                    notification.addUsers(additionalUsers);
                }
            }

            logger.debug("Added notification for task {} of type {}", tarefaId, type);
        } catch (Exception e) {
            logger.error("Could not find tarefa with ID {} for notification", tarefaId, e);
        }
    }

    /**
     * Adiciona conteúdo adicional a uma notificação existente ou cria uma.
     */
    public void addContentToNotification(String type, String title, Long tarefaId, String additionalContent) {
        if (!slackService.isEnabled() || !slackService.shouldSendNotificationType(type)) {
            return;
        }

        try {
            // Buscar a tarefa com todos os users usando o serviço obtido via ApplicationContext
            TarefaWithUsersDTO tarefaDTO = getTarefaService().findByIdWithUsers(tarefaId);

            // Criar uma chave única para esta tarefa e tipo de notificação
            String key = generateNotificationKey(tarefaId, type);

            // Sincronizar acesso ao mapa de notificações pendentes
            synchronized (pendingNotifications) {
                // Verificar se já existe uma notificação pendente para esta tarefa e tipo
                SlackGroupedNotificationDTO notification = pendingNotifications.get(key);

                if (notification == null) {
                    // Criar uma notificação
                    notification = new SlackGroupedNotificationDTO(type, title, tarefaDTO);
                    pendingNotifications.put(key, notification);
                }

                // Adicionar o conteúdo adicional
                notification.setAdditionalContent(additionalContent);
            }

            logger.debug("Added content to notification for task {} of type {}", tarefaId, type);
        } catch (Exception e) {
            logger.error("Could not add content to notification for task {}", tarefaId, e);
        }
    }

    /**
     * Processa as notificações pendentes e envia para o Slack.
     */
    private void processPendingNotifications() {
        // Capturar as notificações pendentes para processamento
        Map<String, SlackGroupedNotificationDTO> notificationsToProcess;

        synchronized (pendingNotifications) {
            if (pendingNotifications.isEmpty()) {
                return;
            }

            // Criar uma cópia do mapa atual usando o construtor parametrizado
            notificationsToProcess = new HashMap<>(pendingNotifications);
            pendingNotifications.clear();
        }

        // Processar cada notificação
        for (SlackGroupedNotificationDTO notification : notificationsToProcess.values()) {
            try {
                // Pular notificações vazias
                if (notification.getUsers().isEmpty()) {
                    logger.debug("Skipping notification without users for task {}",
                            notification.getTarefa().getId());
                    continue;
                }

                // Enviar a notificação diretamente usando o slackService
                boolean success = slackService.sendGroupedNotification(notification);

                if (success) {
                    logger.info("Sent grouped notification to Slack for task {} with {} users",
                            notification.getTarefa().getId(), notification.getUsers().size());
                } else {
                    logger.error("Failed to send grouped notification to Slack for task {}",
                            notification.getTarefa().getId());
                }
            } catch (Exception e) {
                logger.error("Error processing notification for task {}",
                        notification.getTarefa().getId(), e);
            }
        }
    }

    /**
     * Gera uma chave única para uma notificação baseada na tarefa e tipo.
     */
    private String generateNotificationKey(Long tarefaId, String type) {
        return tarefaId + "-" + type;
    }

    /**
     * Sobrecarga para compatibilidade com código existente
     */
    private String generateNotificationKey(Tarefa tarefa, String type) {
        return tarefa.getId() + "-" + type;
    }

    /**
     * Para fins de teste ou debug, retorna o número de notificações pendentes.
     */
    public int getPendingNotificationsCount() {
        synchronized (pendingNotifications) {
            return pendingNotifications.size();
        }
    }
}