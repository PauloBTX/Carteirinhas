import { useState } from 'react';
import { ExcelUploader } from './components/ExcelUploader';
import { StudentSidebar } from './components/StudentSidebar';
import { CardEditor } from './components/CardEditor';
import { Student } from './types';
import { FileUp } from 'lucide-react';

function App() {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [dirHandle, setDirHandle] = useState<any>(null);

    const handleSelectFolder = async () => {
        try {
            // @ts-ignore - File System Access API
            const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
            setDirHandle(handle);
        } catch (e) {
            console.error("User cancelled or API not supported", e);
        }
    };

    const handleDataLoaded = (data: Student[]) => {
        setStudents(data);
        if (data.length > 0) {
            setSelectedStudent(data[0]);
        }
    };

    const handleUpdateStudent = (updated: Student) => {
        setStudents(students.map(s => s.cpfLimpo === updated.cpfLimpo ? updated : s));
        if (selectedStudent?.cpfLimpo === updated.cpfLimpo) {
            setSelectedStudent(updated);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">Criação de Carteirinhas 2026</h1>
                </div>

                <div className="flex items-center gap-4">
                    {students.length > 0 && (
                        <button
                            onClick={handleSelectFolder}
                            className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${dirHandle ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            title="Navegadores bloqueiam criar pastas sozinhas. Se você escolher uma pasta aqui, os arquivos serão salvos lá automaticamente e de forma transparente pelo Chrome/Edge."
                        >
                            {dirHandle ? `📁 Destino: ${dirHandle.name}` : '📁 Escolher Pasta de Destino'}
                        </button>
                    )}
                    {students.length > 0 && (
                        <button
                            onClick={() => setStudents([])}
                            className="text-sm font-medium text-gray-500 hover:text-gray-800"
                        >
                            Limpar Dados
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {students.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        <div className="max-w-md w-full text-center">
                            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FileUp className="w-10 h-10 text-blue-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bem-vindo ao Gerador</h2>
                            <p className="text-gray-600 mb-8">
                                Para iniciar, faça o upload da planilha contendo as abas <br /><strong>Respostas ao formulário 1</strong> e <strong>Matriculas</strong>.
                            </p>
                            <ExcelUploader onDataLoaded={handleDataLoaded} />
                        </div>
                    </div>
                ) : (
                    <>
                        <StudentSidebar
                            students={students}
                            selectedStudent={selectedStudent}
                            onSelectStudent={setSelectedStudent}
                        />

                        <div className="flex-1 overflow-y-auto p-4 pl-[100px] bg-gray-50">
                            {selectedStudent ? (
                                <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
                                        Carteirinha: {selectedStudent.nome}
                                    </h2>
                                    <CardEditor
                                        student={selectedStudent}
                                        onUpdateStudent={handleUpdateStudent}
                                        dirHandle={dirHandle}
                                    />
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500">
                                    <p>Selecione um aluno na lista ao lado para visualizar e editar a carteirinha.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default App;
