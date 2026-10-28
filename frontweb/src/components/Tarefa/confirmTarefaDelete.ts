// Shared by every page that can delete a tarefa, so the warning stays identical.
// Deleting is a soft-delete that drops the tarefa from metrics; archiving keeps it
// counted and can be undone, so the prompt points users there when in doubt.
export const confirmTarefaDelete = (): boolean =>
  window.confirm(
    'Tem a certeza que deseja apagar esta tarefa?\n\n' +
      'A tarefa deixa de aparecer e de contar para as métricas. ' +
      'Se pretender apenas guardá-la para uma eventual reativação, use "Arquivar" na edição da tarefa.'
  );
