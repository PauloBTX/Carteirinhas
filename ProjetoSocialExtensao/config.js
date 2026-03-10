export const CONFIG = {
    SPREADSHEET_URL: "https://docs.google.com/spreadsheets/d/1_I8rRBXr8E8e4K8B7DPt7FlYVE3_87ypTTmo35syMhY/edit?resourcekey=&gid=1251372719#gid=1251372719",
    SPREADSHEET_ID: "1_I8rRBXr8E8e4K8B7DPt7FlYVE3_87ypTTmo35syMhY",
    TARGET_SHEET_NAME: "Respostas ao formulário 1",
    DEST_SHEET_NAME: "Matriculas",
    COLUMNS: {
        NEW_MATRICULA: "Nova Matrícula",
        QR_CODE: "QR Code Nova Matrícula",
        ID: "ID"
    },
    SOURCE_COLUMNS: {
        NOME: "Nome completo do aluno:",
        CPF: "CPF do aluno (formato: 000.000.000-00)\n(UMA inscrição por aluno).",
        FOTO: "imagem NÍTIDA da foto 3x4 \n(Foto atual, Não enviar recorte de fotografia)"
    },
    DEST_COLUMNS: {
        NOME: "NOME",
        CPF: "CPF",
        MATRICULA: "MATRICULA"
    }
};
