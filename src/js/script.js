import { parse } from 'ofx-js';

document.getElementById('processButton').addEventListener('click', function() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        if (file.name.slice(-4).toLowerCase() !== ".ofx") {
            alert('Por favor, selecione um arquivo OFX válido.');
            return;
        }

        const reader = new FileReader();

        reader.onload = async function(e) {
            const text = e.target.result;
            try {
                await processBankStatement(text);
            } catch (error) {
                console.error('Erro ao processar o extrato:', error);
                alert('Ocorreu um erro ao processar o extrato bancário. Verifique se o arquivo OFX está correto.');
            }
        };

        reader.readAsText(file);
    } else {
        alert('Por favor, selecione um arquivo de extrato bancário.');
    }
});

async function processBankStatement(ofxContent) {
    console.log("Processando o extrato bancário...");
    try {
        const ofxData = parse(ofxContent);
        const transactions = ofxData.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.STMTTRN;

        let totalDebit = 0;
        let totalCredit = 0;
        let debits = [];
        let credits = [];

        transactions.forEach(transaction => {
            const amount = parseFloat(transaction.TRNAMT);
            const memo = transaction.MEMO || 'Sem descrição';

            if (amount < 0) {
                totalDebit += Math.abs(amount);
                debits.push({ amount, memo });
            } else {
                totalCredit += amount;
                credits.push({ amount, memo });
            }
        });

        updateUI(totalDebit, totalCredit, debits, credits);
    } catch (error) {
        console.error('Erro ao processar o extrato:', error);
        alert('Ocorreu um erro ao processar o extrato bancário. Verifique se o arquivo OFX está correto.');
    }
}

function updateUI(totalDebit, totalCredit, debits, credits) {
    console.log("Atualizando a UI...");

    document.getElementById('totalEntradas').textContent = totalCredit.toFixed(2);
    document.getElementById('totalSaidas').textContent = totalDebit.toFixed(2);

    populateTable('entradasTable', credits);
    populateTable('saidasTable', debits);
}

function populateTable(tableId, transactions) {
    const tableBody = document.getElementById(tableId).querySelector('tbody');
    tableBody.innerHTML = ''; // Limpar tabela

    transactions.forEach(transaction => {
        let row = tableBody.insertRow();
        row.insertCell(0).textContent = transaction.amount.toFixed(2);
        row.insertCell(1).textContent = transaction.memo;
    });
}
