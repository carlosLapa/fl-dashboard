export enum NotificationType {
  TAREFA_ATRIBUIDA = 'TAREFA_ATRIBUIDA',
  TAREFA_STATUS_ALTERADO = 'TAREFA_STATUS_ALTERADO',
  TAREFA_PRAZO_PROXIMO = 'TAREFA_PRAZO_PROXIMO',
  TAREFA_CONCLUIDA = 'TAREFA_CONCLUIDA',
  NOTIFICACAO_GERAL = 'NOTIFICACAO_GERAL',
  PROJETO_ATUALIZADO = 'PROJETO_ATUALIZADO',
}

export interface Notification {
  id: number;
  type: NotificationType;
  content: string;
  isRead: boolean;
  createdAt: string;
  relatedId: number | null;
  user?: {
    id: number;
    name: string;
  };
  tarefa?: {
    id: number;
    descricao: string;
  };
  projeto?: {
    id: number;
    designacao: string;
  };
}

export type NotificationInsertDTO = Omit<
  Notification,
  'id' | 'user' | 'tarefa' | 'projeto'
> & {
  userId: number;
  tarefaId: number;
  projetoId: number;
};

export type NotificationUpdateDTO = Partial<
  Omit<Notification, 'user' | 'tarefa' | 'projeto'>
> & {
  id: number;
  userId: number;
  tarefaId: number;
  projetoId: number;
};
