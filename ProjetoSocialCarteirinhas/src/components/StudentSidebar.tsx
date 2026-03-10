import { useState } from 'react';
import { Student } from '../types';
import { Search } from 'lucide-react';

interface StudentSidebarProps {
    students: Student[];
    selectedStudent: Student | null;
    onSelectStudent: (student: Student) => void;
}

export function StudentSidebar({ students, selectedStudent, onSelectStudent }: StudentSidebarProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStudents = students.filter(student =>
        student.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.cpfLimpo.includes(searchTerm)
    );

    return (
        <div className="w-80 border-r border-gray-200 bg-white h-[calc(100vh-4rem)] flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Alunos ({students.length})</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou CPF..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {filteredStudents.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">Nenhum aluno encontrado</div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {filteredStudents.map(student => (
                            <li
                                key={student.cpfLimpo}
                                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedStudent?.cpfLimpo === student.cpfLimpo ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                onClick={() => onSelectStudent(student)}
                            >
                                <div className={`font-medium truncate ${student.problema ? 'text-orange-500' : student.gerada ? 'text-red-600' : 'text-gray-800'}`}>
                                    {student.nome} {student.problema && ' (Problema)'}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                    <span>CPF: {student.cpf}</span>
                                    <span>Mat: {student.matricula}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
