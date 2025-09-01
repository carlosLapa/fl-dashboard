import React from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { Externo } from '../../types/externo';

interface ExternosSelectProps {
  allExternos: Externo[];
  selectedExternos: Externo[];
  onChange: (externos: Externo[]) => void;
  className?: string;
  isDisabled?: boolean;
  placeholder?: string;
  showToastOnDuplicate?: boolean;
}

const ExternosSelect: React.FC<ExternosSelectProps> = ({
  allExternos = [],
  selectedExternos = [],
  onChange,
  className,
  isDisabled = false,
  placeholder = 'Selecione os colaboradores externos...',
  showToastOnDuplicate = true,
}) => {
  const options = allExternos.map((externo) => ({
    value: externo.id,
    label: `${externo.name} (${externo.email})`,
  }));

  const value = selectedExternos.map((externo) => ({
    value: externo.id,
    label: `${externo.name} (${externo.email})`,
  }));

  const handleChange = (selectedOptions: any) => {
    if (!selectedOptions) {
      onChange([]);
      return;
    }

    // Extrair os IDs selecionados
    const selectedIds = selectedOptions.map(
      (option: any) => option.value as number
    );

    // Verificar duplicações com conversão de tipo explícita
    const uniqueIds = [...new Set(selectedIds)] as number[];

    if (uniqueIds.length < selectedIds.length && showToastOnDuplicate) {
      toast.warning(
        'Não é possível adicionar o mesmo colaborador externo mais de uma vez.'
      );
    }

    // Filtrar os externos selecionados
    const newSelectedExternos = allExternos.filter((externo) =>
      uniqueIds.includes(externo.id)
    );

    // Verificar se algum externo já estava selecionado
    const previousIds = selectedExternos.map((ext) => ext.id);
    const addedIds = uniqueIds.filter(
      (id: number) => !previousIds.includes(id)
    );

    // Verificar se há tentativa de adicionar duplicatas
    const alreadySelectedIds = uniqueIds.filter(
      (id: number) => previousIds.includes(id) && addedIds.includes(id)
    );

    if (alreadySelectedIds.length > 0 && showToastOnDuplicate) {
      toast.warning(
        'Alguns colaboradores já estão selecionados e não podem ser adicionados novamente.'
      );
    }

    onChange(newSelectedExternos);
  };

  return (
    <Select
      isMulti
      options={options}
      value={value}
      onChange={handleChange}
      className={`basic-multi-select ${className || ''}`}
      classNamePrefix="select"
      isDisabled={isDisabled}
      placeholder={placeholder}
      noOptionsMessage={() => 'Nenhum colaborador externo encontrado'}
      isClearable={true}
    />
  );
};

export default ExternosSelect;
