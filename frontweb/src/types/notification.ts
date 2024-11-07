export interface Notification {
    id: number;
    type: string;
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

export type NotificationInsertDTO = Omit<Notification, 'id' | 'user' | 'tarefa' | 'projeto'> & {
    userId: number;
    tarefaId: number;
    projetoId: number;
};

export type NotificationUpdateDTO = Partial<Omit<Notification, 'user' | 'tarefa' | 'projeto'>> & {
    id: number;
    userId: number;
    tarefaId: number;
    projetoId: number;
};