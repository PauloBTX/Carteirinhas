export class SheetsAPI {
    constructor() {
        this.token = null;
    }

    async getAuthToken() {
        return new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({ interactive: true }, (token) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    this.token = token;
                    resolve(token);
                }
            });
        });
    }

    async fetchSpreadsheetDetails(spreadsheetId) {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Failed to fetch spreadsheet details: ${response.status} ${response.statusText} - ${text}`);
        }
        return response.json();
    }

    async getSheetValues(spreadsheetId, range) {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch sheet values');
        return response.json();
    }

    async updateValues(spreadsheetId, range, values) {
        const body = {
            values: values
        };
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error('Failed to update sheet values');
        return response.json();
    }

    async batchUpdateValues(spreadsheetId, data, valueInputOption = "RAW") {
        const body = {
            valueInputOption: valueInputOption,
            data: data
        };
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error('Failed to batch update sheet values');
        const json = await response.json();
        console.log("Batch Update Response:", json);
        return json;
    }

    async appendValues(spreadsheetId, range, values, valueInputOption = "RAW") {
        const body = {
            values: values
        };
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=${valueInputOption}&insertDataOption=INSERT_ROWS`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Failed to append sheet values: ${text}`);
        }
        return response.json();
    }
}
