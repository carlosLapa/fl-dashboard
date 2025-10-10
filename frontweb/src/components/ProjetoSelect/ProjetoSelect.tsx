import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { getAllProjetos } from '../../services/projetoService';

interface ProjetoSelectProps {
  selectedProjetoId?: number;
  onChange: (projetoId: number | undefined, projetoDesignacao?: string) => void;
  className?: string;
  isDisabled?: boolean;
  placeholder?: string;
  required?: boolean;
}

const ProjetoSelect: React.FC<ProjetoSelectProps> = ({
  selectedProjetoId,
  onChange,
  className = '',
  isDisabled = false,
  placeholder = 'Selecione um projeto...',
  required = false,
}) => {
  const [projetos, setProjetos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjetos = async () => {
      try {
        setIsLoading(true);
        const response = await getAllProjetos();
        setProjetos(response.content || []);
        setError(null);
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        setError('Falha ao carregar a lista de projetos.');
        toast.error('Não foi possível carregar a lista de projetos.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjetos();
  }, []);

  const options = projetos.map((projeto) => ({
    value: projeto.id,
    label: projeto.designacao,
  }));

  const selectedOption = selectedProjetoId !== undefined
    ? options.find((option) => option.value === selectedProjetoId)
    : null;

  const handleChange = (selectedOption: any) => {
    console.log("ProjetoSelect onChange:", selectedOption);
    
    // Extrair valores do objeto selecionado ou undefined se nada foi selecionado
    // Garantir que o ID é um número quando presente
    const projetoId = selectedOption ? Number(selectedOption.value) : undefined;
    const projetoDesignacao = selectedOption ? selectedOption.label : undefined;
    
    console.log(`ProjetoSelect - Preparando valores: ID=${projetoId} (${typeof projetoId}), Designação=${projetoDesignacao}`);

    // Passar tanto o ID quanto a designação
    onChange(projetoId, projetoDesignacao);
  };

  return (
    <div className={`projeto-select-container ${className}`}>
      <Select
        className="projeto-select"
        classNamePrefix="projeto-select"
        options={options}
        value={selectedOption}
        onChange={handleChange}
        isDisabled={isDisabled}
        isLoading={isLoading}
        isClearable={true}
        placeholder={placeholder}
        aria-label="Selecione um projeto"
        aria-required={required}
        noOptionsMessage={() => "Nenhum projeto encontrado"}
        loadingMessage={() => "Carregando projetos..."}
      />
      {error && <div className="text-danger mt-1">{error}</div>}
    </div>
  );
};

export default ProjetoSelect;