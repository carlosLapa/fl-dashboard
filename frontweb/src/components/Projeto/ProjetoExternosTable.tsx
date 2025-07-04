import React from 'react';
import { Table, Badge } from 'react-bootstrap';
import { Externo } from '../../types/externo';
import { Link } from 'react-router-dom';

interface ProjetoExternosTableProps {
  externos: Externo[];
}

const ProjetoExternosTable: React.FC<ProjetoExternosTableProps> = ({
  externos,
}) => {
  if (!externos || externos.length === 0) {
    return (
      <p className="text-muted">
        Não há colaboradores externos associados a este projeto.
      </p>
    );
  }

  // Function to format specialist areas into badges
  const renderEspecialidades = (especialidades: string[]) => {
    return especialidades.map((especialidade, index) => (
      <Badge bg="secondary" className="me-1 mb-1" key={index}>
        {especialidade.replace('_', ' ')}
      </Badge>
    ));
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <div className="table-responsive">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telemóvel</th>
            <th>Preço</th>
            <th>Fase do Projeto</th>
            <th>Especialidades</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {externos.map((externo) => (
            <tr key={externo.id}>
              <td>{externo.name}</td>
              <td>{externo.email}</td>
              <td>{externo.telemovel}</td>
              <td>{formatCurrency(externo.preco)}</td>
              <td>{externo.faseProjeto.replace('_', ' ')}</td>
              <td>
                <div className="d-flex flex-wrap">
                  {renderEspecialidades(externo.especialidades)}
                </div>
              </td>
              <td>
                <Link
                  to={`/externos/${externo.id}/details`}
                  className="btn btn-sm btn-info me-2"
                >
                  Detalhes
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ProjetoExternosTable;
