import React, { useState } from 'react';
import { Plus, Eye, Edit, Trash2, ClipboardPlus } from 'lucide-react';

const Table = ({
    columns,
    data,
    onRowClick,
    onAddNew,
    onView,
    onEdit,
    onDelete,
    title = 'Data List', // Default title if not provided
    addButtonText = 'Add New', // Default button text
    addButtonIcon = Plus, // Default icon, can be overridden
    onReport,

}) => {
    const [selectedRow, setSelectedRow] = useState(null);

    const handleRowSelect = (row) => {
        setSelectedRow(row);
        if (onRowClick) {
            onRowClick(row);
        }
    };
    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                {onAddNew && (
                    <button onClick={onAddNew} className="flex items-center bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">
                        {addButtonIcon && React.createElement(addButtonIcon, { className: "mr-2", size: 20 })}
                        {addButtonText}
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{column.title}</th>
                            ))}
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.map((row, index) => (
                            <tr key={index} onClick={() => handleRowSelect(row)} className={`hover:bg-gray-50 cursor-pointer ${selectedRow === row ? 'bg-blue-50' : ''}`}>
                                {/* {columns.map((column) => (
                                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row[column.key]}</td>
                                ))} */}
                                {columns.map((column) => (
                                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {column.render ? column.render(row) : row[column.key]} {/* you are using image to reder function but here you ware not redering*/}
                                    </td>
                                ))}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-center space-x-2">
                                        {onView && (<button onClick={(e) => { e.stopPropagation(); onView(row); }} className="text-blue-500 hover:text-blue-70 cursor-pointer" title="View Details"><Eye size={20} /></button>)}
                                        {onEdit && (<button onClick={(e) => { e.stopPropagation(); onEdit(row); }} className="text-yellow-500 hover:text-yellow-700" title="Edit"><Edit size={20} /></button>)}
                                        {onDelete && (<button onClick={(e) => { e.stopPropagation(); onDelete(row); }} className="text-red-500 hover:text-red-700" title="Delete"><Trash2 size={20} /></button>)}

                                        {/* add repeort */}
                                        {onReport && (<button onClick={(e) => { e.stopPropagation(); onReport(row); }} className="text-purple-500 hover:text-purple-700" title="Report"><ClipboardPlus size={20} /></button>)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {data.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                    No data found. {addButtonText} to get started.
                </div>
            )}
        </div>
    );
};

export default Table;