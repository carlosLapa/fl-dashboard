import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { ClienteDTO } from '../../types/cliente';
import { getAllClientes } from '../../services/clienteService';

interface ClienteSelectProps {
  selectedClienteId?: number;
  onChange: (clienteId: number | undefined, clienteName?: string) => void;
  className?: string;
  isDisabled?: boolean;
  placeholder?: string;
  required?: boolean;
}

const ClienteSelect: React.FC<ClienteSelectProps> = ({
  selectedClienteId,
  onChange,
  className,
  isDisabled = false,
  placeholder = 'Selecione o cliente...',
  required = false,
}) => {
  const [clientes, setClientes] = useState<ClienteDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setIsLoading(true);
        const data = await getAllClientes();
        setClientes(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching clientes:', err);
        setError('Não foi possível carregar a lista de clientes.');
        toast.error('Falha ao carregar a lista de clientes.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientes();
  }, []);

  const options = clientes.map((cliente) => ({
    value: cliente.id,
    label: cliente.name,
  }));

  const value = selectedClienteId
    ? options.find((option) => option.value === selectedClienteId)
    : null;

  const handleChange = (selectedOption: any) => {
    onChange(
      selectedOption ? selectedOption.value : undefined,
      selectedOption ? selectedOption.label : undefined
    );
  };

  return (
    <>
      <Select
        options={options}
        value={value}
        onChange={handleChange}
        className={`cliente-select ${className || ''}`}
        classNamePrefix="select"
        isDisabled={isDisabled || isLoading}
        placeholder={isLoading ? 'Carregando clientes...' : placeholder}
        noOptionsMessage={() => 'Nenhum cliente encontrado'}
        isClearable={!required}
      />
      {error && <div className="text-danger small mt-1">{error}</div>}
    </>
  );
};

export default ClienteSelect;