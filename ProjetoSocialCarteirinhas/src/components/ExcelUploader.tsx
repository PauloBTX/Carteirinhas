import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { Student } from '../types';
import { Upload } from 'lucide-react';

interface ExcelUploaderProps {
    onDataLoaded: (students: Student[]) => void;
}

export function ExcelUploader({ onDataLoaded }: ExcelUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });

            const respostasSheetName = "Respostas ao formulário 1";
            const matriculasSheetName = "Matriculas";

            const respostasSheet = wb.Sheets[respostasSheetName] || wb.Sheets[wb.SheetNames[0]]; // fallback to first sheet
            const matriculasSheet = wb.Sheets[matriculasSheetName];

            const respostasData = XLSX.utils.sheet_to_json<any>(respostasSheet);
            const matriculasData = matriculasSheet ? XLSX.utils.sheet_to_json<any>(matriculasSheet) : [];

            // Create a map of clean CPF -> Matricula
            const matriculaMap = new Map<string, string>();
            matriculasData.forEach(row => {
                const cpfKey = Object.keys(row).find(k => k.toUpperCase().includes('CPF'));
                const matKey = Object.keys(row).find(k => k.toUpperCase().includes('MATRICULA'));

                const cpfRaw = cpfKey ? row[cpfKey] : null;
                const matriculaRaw = matKey ? row[matKey] : null;

                if (cpfRaw && matriculaRaw) {
                    const cleanCpf = String(cpfRaw).replace(/\D/g, '').padStart(11, '0');
                    matriculaMap.set(cleanCpf, String(matriculaRaw));
                }
            });

            const students: Student[] = respostasData.map((row) => {
                const cpfKeyResp = Object.keys(row).find(k => k.toUpperCase().includes('CPF DO ALUNO') || k.toUpperCase() === 'CPF');
                const cpfRaw = cpfKeyResp ? row[cpfKeyResp] : null;
                const cleanCpf = cpfRaw ? String(cpfRaw).replace(/\D/g, '').padStart(11, '0') : '';

                const modalidadeKey = Object.keys(row).find(k => k.toUpperCase().includes('ESCOLHA UMA MODALIDADE'));
                const rawModalidade = modalidadeKey ? row[modalidadeKey] : "";
                let modalidade = "";
                let horario = "";

                if (rawModalidade) {
                    const dashSplit = String(rawModalidade).split('-');
                    if (dashSplit.length > 0) {
                        modalidade = dashSplit[0].trim();
                        if (dashSplit.length > 1) {
                            const afterDash = dashSplit.slice(1).join('-');
                            const parenSplit = afterDash.split('(');
                            horario = parenSplit[0].trim();
                        }
                    }
                }

                const nomeKey = Object.keys(row).find(k => k.toUpperCase().includes('NOME COMPLETO DO ALUNO') || k.toUpperCase() === 'NOME');
                const nome = nomeKey ? row[nomeKey] : "Desconhecido";

                const matricula = cleanCpf && matriculaMap.has(cleanCpf) ? matriculaMap.get(cleanCpf)! : "Pendente";

                const dataNascKey = Object.keys(row).find(k => k.toUpperCase().includes('DATA DE NASCIMENTO'));
                let dataNascimentoValue = dataNascKey ? row[dataNascKey] : "";
                let dataNascimento = "";

                if (dataNascimentoValue !== undefined && dataNascimentoValue !== null && dataNascimentoValue !== "") {
                    // Force parsing if value looks like an Excel serial date (e.g., 38366)
                    const asNumber = Number(dataNascimentoValue);
                    if (!isNaN(asNumber) && asNumber > 20000 && asNumber < 60000) {
                        try {
                            dataNascimento = XLSX.SSF.format('dd/mm/yyyy', asNumber);
                        } catch (e) {
                            dataNascimento = String(dataNascimentoValue);
                        }
                    } else {
                        dataNascimento = String(dataNascimentoValue);
                    }
                }

                return {
                    nome,
                    cpf: String(cpfRaw || ""),
                    cpfLimpo: cleanCpf,
                    modalidade,
                    horario,
                    matricula,
                    dataNascimento,
                    fotoUrl: `${import.meta.env.BASE_URL}images/Fotos Projeto Social/${cleanCpf}.jpg` // fallback to .jpg, will handle alternatives in the editor
                };
            }).filter(s => s.cpfLimpo); // Only keep rows with a valid CPF

            onDataLoaded(students);
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-10 h-10 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">Fazer Upload da Planilha (.xlsx)</h3>
            <p className="text-sm text-gray-500 mt-1">Apenas arquivos Excel com as abas Respostas e Matriculas</p>
            <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
            />
        </div>
    );
}
