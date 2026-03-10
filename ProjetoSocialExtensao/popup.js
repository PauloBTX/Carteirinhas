import { CONFIG } from './config.js';
import { SheetsAPI } from './utils/sheets_api.js';
import { generateMatricula, validateMatricula } from './utils/matricula_logic.js';

const statusDiv = document.getElementById('status');
const btnSync = document.getElementById('btn-sync');
const btnDownload = document.getElementById('btn-download-photos');

function showStatus(message, type = 'loading') {
    statusDiv.textContent = message;
    statusDiv.className = type;
    statusDiv.style.display = 'block';
}

async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
}

// Helper to get column letter (1 -> A, 2 -> B)
function getColumnLetter(colIndex) {
    let temp, letter = '';
    while (colIndex > 0) {
        temp = (colIndex - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        colIndex = (colIndex - temp - 1) / 26;
    }
    return letter;
}

function getSpreadsheetIdFromUrl(url) {
    const matches = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (matches && matches[1]) {
        return matches[1];
    }
    throw new Error("Não foi possível identificar o ID da planilha na URL.");
}

async function handleGerarMatricula() {
    try {
        showStatus('Iniciando...', 'loading');
        btnMatricula.disabled = true;

        // 1. Check URL
        const tab = await getCurrentTab();
        if (!tab.url.startsWith("https://docs.google.com/spreadsheets")) {
            throw new Error(`Esta extensão só funciona em planilhas do Google Sheets.\nURL Atual: ${tab.url}`);
        }

        // 2. Auth & Init
        const api = new SheetsAPI();
        await api.getAuthToken();
        showStatus('Autenticado via Google API. Lendo planilha...', 'loading');

        // 3. Get Spreadsheet Details
        const spreadsheetId = getSpreadsheetIdFromUrl(tab.url);

        const metadata = await api.fetchSpreadsheetDetails(spreadsheetId);
        const sheet = metadata.sheets.find(s => s.properties.title === CONFIG.TARGET_SHEET_NAME);

        if (!sheet) {
            throw new Error(`Aba "${CONFIG.TARGET_SHEET_NAME}" não encontrada.`);
        }

        // 4. Fetch Header Row to find columns
        const sheetTitle = CONFIG.TARGET_SHEET_NAME;
        const headerRange = `${sheetTitle}!A1:Z1`;
        const headerData = await api.getSheetValues(spreadsheetId, headerRange);

        if (!headerData.values || headerData.values.length === 0) {
            throw new Error("Planilha vazia ou sem cabeçalho na linha 1.");
        }

        const headers = headerData.values[0];
        const matriculaIndex = headers.indexOf(CONFIG.COLUMNS.NEW_MATRICULA);

        if (matriculaIndex === -1) throw new Error(`Coluna "${CONFIG.COLUMNS.NEW_MATRICULA}" não encontrada.`);

        // 5. Fetch All Data
        const dataRange = `${sheetTitle}!A2:Z${sheet.properties.gridProperties.rowCount}`;
        const responseData = await api.getSheetValues(spreadsheetId, dataRange);
        const rows = responseData.values || [];

        let updatedCount = 0;
        const updates = [];

        showStatus(`Processando ${rows.length} linhas...`, 'loading');

        // 6. Iterate and Process
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + 2;

            // Use row number as ID (native line ID)
            const id = rowNumber;
            const currentMatricula = row[matriculaIndex];

            let needsUpdate = false;

            if (!currentMatricula) {
                needsUpdate = true;
            } else {
                const isValid = await validateMatricula(currentMatricula, id);
                if (!isValid) {
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                const newMatricula = await generateMatricula(id);
                updatedCount++;
                updates.push({
                    range: `'${sheetTitle}'!${getColumnLetter(matriculaIndex + 1)}${rowNumber}`,
                    values: [[newMatricula]]
                });
            }
        }

        if (updatedCount > 0) {
            showStatus(`Atualizando ${updatedCount} matrículas em lote...`, 'loading');
            await api.batchUpdateValues(spreadsheetId, updates);
        }

        showStatus(`Concluído! ${updatedCount} matrículas atualizadas.`, 'success');

    } catch (error) {
        console.error(error);
        const msg = error.message || error.toString();

        if (msg.includes("The user turned off browser signin")) {
            showStatus(
                `Erro de Autenticação: O login do navegador está desativado.\n` +
                `1. Vá em Configurações do Chrome > Você e o Google.\n` +
                `2. Ative "Permitir login no Chrome".\n` +
                `3. Tente novamente.`,
                'error'
            );
        } else {
            showStatus(`Erro: ${msg}`, 'error');
        }
    } finally {
        btnMatricula.disabled = false;
    }
}

// btnMatricula/btnQRCode removed from UI, listeners removed.

async function handleSyncMatriculas() {
    try {
        showStatus('Iniciando Sincronização...', 'loading');
        btnSync.disabled = true;

        // 1. Check URL & Auth
        const tab = await getCurrentTab();
        if (!tab.url.startsWith("https://docs.google.com/spreadsheets")) {
            throw new Error(`Esta extensão só funciona em planilhas do Google Sheets.`);
        }

        const api = new SheetsAPI();
        await api.getAuthToken();
        showStatus('Lendo dados...', 'loading');

        const spreadsheetId = getSpreadsheetIdFromUrl(tab.url);

        // 2. Read Source Config & Headers
        const sourceSheetName = CONFIG.TARGET_SHEET_NAME;
        const sourceMeta = await api.fetchSpreadsheetDetails(spreadsheetId);
        const sourceSheet = sourceMeta.sheets.find(s => s.properties.title === sourceSheetName);
        if (!sourceSheet) throw new Error(`Aba origem "${sourceSheetName}" não encontrada.`);

        const sourceHeaderRange = `'${sourceSheetName}'!A1:Z1`;
        const sourceHeaderResp = await api.getSheetValues(spreadsheetId, sourceHeaderRange);
        if (!sourceHeaderResp.values) throw new Error("Aba origem vazia.");
        const sourceHeaders = sourceHeaderResp.values[0];

        const srcNomeIndex = sourceHeaders.indexOf(CONFIG.SOURCE_COLUMNS.NOME);
        const srcCpfIndex = sourceHeaders.indexOf(CONFIG.SOURCE_COLUMNS.CPF);

        if (srcNomeIndex === -1) throw new Error(`Coluna Origem "Nome" não encontrada. Esperado: "${CONFIG.SOURCE_COLUMNS.NOME}"`);
        if (srcCpfIndex === -1) throw new Error(`Coluna Origem "CPF" não encontrada.`);

        // 3. Read Source Data
        const sourceDataRange = `'${sourceSheetName}'!A2:Z${sourceSheet.properties.gridProperties.rowCount}`;
        const sourceResp = await api.getSheetValues(spreadsheetId, sourceDataRange);
        const sourceRows = sourceResp.values || [];

        // 4. Prepare Destination
        const destSheetName = CONFIG.DEST_SHEET_NAME;

        // Verify existence using metadata to give better error
        const destSheet = sourceMeta.sheets.find(s => s.properties.title === destSheetName);
        if (!destSheet) {
            const availableNames = sourceMeta.sheets.map(s => s.properties.title).join(", ");
            throw new Error(`Aba destino "${destSheetName}" não encontrada.\nAbas disponíveis: ${availableNames}`);
        }

        // Read Dest Headers
        let destHeaders = [];
        const destHeaderRange = `'${destSheetName}'!A1:Z1`;
        const destHeaderResp = await api.getSheetValues(spreadsheetId, destHeaderRange);
        if (destHeaderResp.values && destHeaderResp.values.length > 0) {
            destHeaders = destHeaderResp.values[0];
        }

        // Initialize Dest Headers if empty
        if (destHeaders.length === 0) {
            destHeaders = [CONFIG.DEST_COLUMNS.NOME, CONFIG.DEST_COLUMNS.CPF, CONFIG.DEST_COLUMNS.MATRICULA];
            await api.updateValues(spreadsheetId, `'${destSheetName}'!A1:C1`, [destHeaders]);
        }

        const destNomeIndex = destHeaders.indexOf(CONFIG.DEST_COLUMNS.NOME);
        const destCpfIndex = destHeaders.indexOf(CONFIG.DEST_COLUMNS.CPF);
        const destMatriculaIndex = destHeaders.indexOf(CONFIG.DEST_COLUMNS.MATRICULA);

        if (destCpfIndex === -1) throw new Error(`Coluna Destino "CPF" não encontrada em "${destSheetName}".`);

        // 5. Read Existing CPFs in Destination
        const destDataRange = `'${destSheetName}'!A2:Z`;
        const destResp = await api.getSheetValues(spreadsheetId, destDataRange);
        const destRows = destResp.values || [];

        const existingCPFs = new Set();
        destRows.forEach(row => {
            if (row[destCpfIndex]) existingCPFs.add(row[destCpfIndex].trim());
        });

        // 6. Process Rows
        showStatus(`Processando ${sourceRows.length} registros...`, 'loading');

        const newRows = [];
        let skippedCount = 0;

        for (let i = 0; i < sourceRows.length; i++) {
            const row = sourceRows[i];
            const sourceRowNumber = i + 2; // ID based on Source Row

            const nome = row[srcNomeIndex];
            const cpf = row[srcCpfIndex];

            // Validate basic data presence
            if (!nome || !cpf) continue;

            const cleanCPF = cpf.trim();

            // Check Duplicate
            if (existingCPFs.has(cleanCPF)) {
                skippedCount++;
                continue;
            }

            // Generate Matricula
            const matricula = await generateMatricula(sourceRowNumber);

            // Build Row
            const newRow = new Array(destHeaders.length).fill("");
            if (destNomeIndex !== -1) newRow[destNomeIndex] = nome;
            if (destCpfIndex !== -1) newRow[destCpfIndex] = cleanCPF;
            if (destMatriculaIndex !== -1) newRow[destMatriculaIndex] = matricula;

            newRows.push(newRow);
            existingCPFs.add(cleanCPF);
        }

        // 7. Write to Destination
        if (newRows.length > 0) {
            showStatus(`Escrevendo ${newRows.length} linhas...`, 'loading');
            await api.appendValues(spreadsheetId, `'${destSheetName}'!A1`, newRows, 'USER_ENTERED');
            showStatus(`Concluído! ${newRows.length} adicionados. ${skippedCount} duplicados ignorados.`, 'success');
        } else {
            showStatus(`Tudo atualizado! ${skippedCount} registros já existiam.`, 'success');
        }

    } catch (error) {
        console.error(error);
        showStatus(`Erro: ${error.message}`, 'error');
    } finally {
        btnSync.disabled = false;
    }
}

btnSync.addEventListener('click', handleSyncMatriculas);

async function handleDownloadPhotos() {
    try {
        showStatus('Iniciando Download de Fotos...', 'loading');
        btnDownload.disabled = true;

        const tab = await getCurrentTab();
        const spreadsheetId = getSpreadsheetIdFromUrl(tab.url);
        const api = new SheetsAPI();
        await api.getAuthToken();

        const sheetName = CONFIG.TARGET_SHEET_NAME;
        const meta = await api.fetchSpreadsheetDetails(spreadsheetId);
        const sheet = meta.sheets.find(s => s.properties.title === sheetName);
        if (!sheet) throw new Error(`Aba "${sheetName}" não encontrada.`);

        // Read Headers
        const headerRows = await api.getSheetValues(spreadsheetId, `'${sheetName}'!A1:Z1`);
        if (!headerRows.values) throw new Error("Aba vazia.");
        const headers = headerRows.values[0];

        const cpfIndex = headers.indexOf(CONFIG.SOURCE_COLUMNS.CPF);
        const photoIndex = headers.indexOf(CONFIG.SOURCE_COLUMNS.FOTO);

        if (cpfIndex === -1) throw new Error("Coluna CPF não encontrada.");
        if (photoIndex === -1) throw new Error("Coluna Foto não encontrada.");

        // Read Data
        const data = await api.getSheetValues(spreadsheetId, `'${sheetName}'!A2:Z${sheet.properties.gridProperties.rowCount}`);
        const rows = data.values || [];

        let downloadCount = 0;

        showStatus(`Analisando ${rows.length} registros...`, 'loading');

        for (const row of rows) {
            const cpfRaw = row[cpfIndex];
            const photoUrl = row[photoIndex];

            if (!cpfRaw || !photoUrl) continue;

            const cpfClean = cpfRaw.replace(/[^\d]/g, ""); // Keep only digits
            if (!cpfClean) continue;

            // Handle multiple URLs (comma separated) - take the first one?
            // "https://drive.google.com..., https://..."
            const urls = photoUrl.split(',').map(s => s.trim());

            // Only download the first one for now or all? User said "download all photos".
            // Renaming "cpf + extension". If multiple, maybe "cpf_1.ext"?
            // User request suggests one photo per user ("renomeadas para o cpf do usuario").
            // I will take the first valid URL.

            const url = urls[0];

            // Convert Drive Open URL to Download URL
            // Format: https://drive.google.com/open?id=FILE_ID
            // Target: https://drive.google.com/uc?export=download&id=FILE_ID

            let downloadUrl = url;
            let fileExt = "jpg"; // default

            // Simple Drive ID extraction
            const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
            if (idMatch && idMatch[1]) {
                downloadUrl = `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
            }

            // Trigger Download
            // We use browser downloads API. 
            // Filename: `fotos/${cpfClean}.${fileExt}`
            // Note: We can't easily know the real extension without headers. Drive often returns jpeg.
            // Let's assume jpg for photo 3x4 unless we can detect. 
            // Actually, chrome.downloads can sometimes verify. 
            // Or we just omit extension and let browser decide? 
            // User wanted "cpf + extensao".
            // Safest is to try to guess or use .jpg. Most are jpg.

            await chrome.downloads.download({
                url: downloadUrl,
                filename: `fotos/${cpfClean}.jpg`,
                conflictAction: 'overwrite'
            });
            downloadCount++;

            // Artificial delay to avoid browser choking?
            await new Promise(r => setTimeout(r, 200));
        }

        showStatus(`Iniciado download de ${downloadCount} fotos. Verifique sua pasta Downloads/fotos.`, 'success');

    } catch (error) {
        console.error(error);
        showStatus(`Erro: ${error.message}`, 'error');
    } finally {
        btnDownload.disabled = false;
    }
}

btnDownload.addEventListener('click', handleDownloadPhotos);
