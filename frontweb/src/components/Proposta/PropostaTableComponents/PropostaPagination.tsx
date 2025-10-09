import React from 'react';
import { Pagination } from 'react-bootstrap';

interface PropostaPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PropostaPagination: React.FC<PropostaPaginationProps> = ({
  page,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  // Limitar o número de botões de página visíveis
  const getVisiblePages = () => {
    const maxVisiblePages = 5;
    let startPage = Math.max(0, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages - 1);

    // Ajustar startPage se não tivermos páginas suficientes no final
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    const visiblePages = [];
    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i);
    }
    return visiblePages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="d-flex justify-content-center mt-3">
      <Pagination>
        <Pagination.First
          onClick={() => onPageChange(0)}
          disabled={page === 0}
        />
        <Pagination.Prev
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
        />

        {visiblePages.map((pageNum) => (
          <Pagination.Item
            key={pageNum}
            active={pageNum === page}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum + 1}
          </Pagination.Item>
        ))}

        <Pagination.Next
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
        />
        <Pagination.Last
          onClick={() => onPageChange(totalPages - 1)}
          disabled={page >= totalPages - 1}
        />
      </Pagination>
    </div>
  );
};

export default PropostaPagination;
