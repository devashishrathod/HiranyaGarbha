import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    // Calculate the range of page numbers to display
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5; // Show at most 5 page numbers at a time
        
        if (totalPages <= maxPagesToShow) {
            // If we have 5 or fewer pages, show all of them
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Always include first page
            pageNumbers.push(1);
            
            // Calculate the middle range
            let startPage, endPage;
            
            if (currentPage <= 3) {
                startPage = 2;
                endPage = 4;
            } else if (currentPage >= totalPages - 2) {
                startPage = totalPages - 3;
                endPage = totalPages - 1;
            } else {
                startPage = currentPage - 1;
                endPage = currentPage + 1;
            }
            
            // Add ellipsis after page 1 if needed
            if (startPage > 2) {
                pageNumbers.push('...');
            }
            
            // Add the middle range of pages
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
            
            // Add ellipsis before the last page if needed
            if (endPage < totalPages - 1) {
                pageNumbers.push('...');
            }
            
            // Always include last page
            pageNumbers.push(totalPages);
        }
        
        return pageNumbers;
    };

    // If there's only one page, don't show pagination
    if (totalPages <= 1) return null;

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex items-center space-x-1">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                    currentPage === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-blue-600 hover:bg-blue-100'
                }`}
            >
                Prev
            </button>
            
            {/* Page Numbers */}
            {pageNumbers.map((page, index) => (
                <React.Fragment key={index}>
                    {page === '...' ? (
                        <span className="px-3 py-1">...</span>
                    ) : (
                        <button
                            onClick={() => typeof page === 'number' && onPageChange(page)}
                            className={`px-3 py-1 rounded-md ${
                                currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-blue-100'
                            }`}
                        >
                            {page}
                        </button>
                    )}
                </React.Fragment>
            ))}
            
            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:bg-blue-100'
                }`}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;