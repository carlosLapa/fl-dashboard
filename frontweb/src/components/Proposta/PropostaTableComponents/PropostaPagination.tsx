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

  return (
    <div className="d-flex justify-content-center mt-3">
      <Pagination>
        <Pagination.Prev
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
        />
        {[...Array(totalPages)].map((_, idx) => (
          <Pagination.Item
            key={idx}
            active={idx === page}
            onClick={() => onPageChange(idx)}
          >
            {idx + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
        />
      </Pagination>
    </div>
  );
};

export default PropostaPagination;
