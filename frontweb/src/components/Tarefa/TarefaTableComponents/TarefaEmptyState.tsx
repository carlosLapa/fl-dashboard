import React from 'react';

interface TarefaEmptyStateProps {
  message?: string;
}

const TarefaEmptyState: React.FC<TarefaEmptyStateProps> = ({
  message = 'Não existem tarefas',
}) => {
  return (
    <tr>
      <td colSpan={9} className="text-center py-4">
        {message}
      </td>
    </tr>
  );
};

export default TarefaEmptyState;
