export type StatusType = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export interface Task {
    id: number;
    descricao: string;
    status: StatusType;
    prioridade: string;
    prazoEstimado: string;
    prazoReal: string;
    projeto: {
      id: number;
      nome: string;
    };
    users: {
      id: number;
      username: string;
    }[];
  }
  