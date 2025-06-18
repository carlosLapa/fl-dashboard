import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { Projeto } from '../../../types/projeto';
import { getProjetosAPI } from '../../../api/requestsApi';

interface ProjetoAutocompleteProps {
  value: string;
  onChange: (projetoId: string, projetoName: string) => void;
  placeholder?: string;
  className?: string;
}

const ProjetoAutocomplete: React.FC<ProjetoAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Filtrar por projeto',
  className = '',
}) => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [filteredProjetos, setFilteredProjetos] = useState<Projeto[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Fetch all projetos when the component mounts
  useEffect(() => {
    const fetchProjetos = async () => {
      try {
        console.log('ProjetoAutocomplete - Fetching projetos...');
        const response = await getProjetosAPI(0, 1000);
        console.log(
          'ProjetoAutocomplete - Fetched projetos:',
          response.content
        );
        setProjetos(response.content);
      } catch (error) {
        console.error('ProjetoAutocomplete - Error fetching projetos:', error);
      }
    };
    fetchProjetos();
  }, []);

  // Initialize searchText from value prop
  useEffect(() => {
    if (value && projetos.length > 0) {
      const projeto = projetos.find((p) => p.id.toString() === value);
      if (projeto && searchText !== projeto.designacao) {
        setSearchText(projeto.designacao);
      }
    } else if (!value && searchText) {
      setSearchText('');
    }
  }, [value, projetos, searchText]);

  // Filter projetos based on user input
  useEffect(() => {
    if (searchText) {
      const filtered = projetos.filter((projeto) =>
        projeto.designacao.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredProjetos(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setFilteredProjetos([]);
      setShowDropdown(false);
    }
  }, [searchText, projetos]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchText(newValue);

    // If the input is cleared, also clear the projetoId
    if (newValue === '') {
      onChange('', '');
    }
  };

  const handleSelectProjeto = (projeto: Projeto) => {
    setSearchText(projeto.designacao);
    onChange(projeto.id.toString(), projeto.designacao);
    setShowDropdown(false);
  };

  return (
    <div className={`position-relative ${className}`}>
      <Form.Control
        type="text"
        placeholder={placeholder}
        value={searchText}
        onChange={handleInputChange}
        onFocus={() => {
          if (filteredProjetos.length > 0) {
            setShowDropdown(true);
          }
        }}
        onBlur={() => {
          // Delay hiding the dropdown to allow for clicks
          setTimeout(() => setShowDropdown(false), 200);
        }}
      />
      {showDropdown && (
        <div
          className="position-absolute w-100 bg-white border rounded shadow-sm"
          style={{
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {filteredProjetos.map((projeto) => (
            <div
              key={projeto.id}
              className="p-2 border-bottom"
              style={{ cursor: 'pointer' }}
              onMouseDown={() => handleSelectProjeto(projeto)}
            >
              {projeto.designacao}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjetoAutocomplete;
