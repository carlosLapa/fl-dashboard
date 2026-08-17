import { TAREFA_STATUS_LABELS } from '../constants/tarefaStatus';
import { PROJETO_STATUS_LABELS } from '../constants/projetoStatus';

const STATUS_TOKEN_PATTERN = new RegExp(
  `\\b(${[
    ...Object.keys(TAREFA_STATUS_LABELS),
    ...Object.keys(PROJETO_STATUS_LABELS),
  ].join('|')})\\b`,
  'g'
);

const STATUS_LABELS: Record<string, string> = {
  ...TAREFA_STATUS_LABELS,
  ...PROJETO_STATUS_LABELS,
};

export const formatNotificationContent = (content: string): string =>
  content.replace(STATUS_TOKEN_PATTERN, (match) => `"${STATUS_LABELS[match]}"`);
