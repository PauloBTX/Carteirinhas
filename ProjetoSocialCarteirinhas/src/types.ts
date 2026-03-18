export interface Student {
    nome: string;
    cpf: string;
    cpfLimpo: string;
    modalidade: string;
    horario: string;
    matricula: string;
    dataNascimento: string;
    fotoUrl: string; // usually cpfLimpo + .jpg/.png/.webp
    gerada?: boolean; // track if the card has been generated/saved
    problema?: boolean; // track if there's an issue with the card
    constaNaLista?: boolean; // track if CPF is in public/input/lista_arquivos.txt
}
