document.getElementById('compareBtn').addEventListener('click', function () {
    const hexFile = document.getElementById('hexFile').files[0];
    const txtFile = document.getElementById('txtFile').files[0];

    if (!hexFile || !txtFile) {
        alert('Please upload both files.');
        return;
    }

    console.log("Hex file: ", hexFile.name);
    console.log("Text file: ", txtFile.name);

    Promise.all([readFile(hexFile), readFile(txtFile)])
        .then(([hexData, txtData]) => {
            console.log("Hex data read successfully");
            console.log("Text data read successfully");

            const cleanedHexData = cleanData(hexData);
            const cleanedTxtData = cleanData(txtData);

            console.log("Cleaned Hex Data: ", cleanedHexData);
            console.log("Cleaned Text Data: ", cleanedTxtData);

            const processedHexData = processHexFile(cleanedHexData);
            const processedTxtData = processTxtFile(cleanedTxtData);

            console.log("Processed Hex Data: ", processedHexData);
            console.log("Processed Text Data: ", processedTxtData);

            const comparison = compareFiles(processedHexData, processedTxtData);
            displayResults(comparison, processedHexData, processedTxtData);
        })
        .catch(err => console.error("Error processing files: ", err));
});

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            console.log("File read: ", file.name);
            resolve(event.target.result.split('\\n'));
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

function cleanData(lines) {
    return lines.map(line => line.replace(/[^\x20-\x7E]/g, ''));
}

function processHexFile(hexLines) {
    return hexLines
        .filter(line => line.length >= 43)
        .map((line, index) => {
            const data = line.slice(9, -2);
            return data.slice(0, 32).match(/.{1,2}/g).join(' ');
        });
}

function processTxtFile(txtLines) {
    let entireFile = txtLines.join('')
        .replace(/[^\x20-\x7E]/g, '')
        .replace(/\\n|\\r/g, '');

    entireFile = entireFile.replace(/\\s+/g, ',');

    let hexArray = entireFile.split(',');

    let result = [];
    let currentLine = [];

    hexArray.forEach(part => {
        if (/^[A-Fa-f0-9]{2}$/.test(part)) {
            currentLine.push(part);
            if (currentLine.length === 16) {
                result.push(currentLine.join(' '));
                currentLine = [];
            }
        }
    });

    return result;
}

function compareFiles(hexLines, txtLines) {
    const totalLines = Math.min(hexLines.length, txtLines.length);
    let matchingLines = 0;
    let diffLines = [];

    for (let i = 0; i < totalLines; i++) {
        if (hexLines[i].trim() === txtLines[i].trim()) {
            matchingLines++;
        } else {
            diffLines.push(i + 1);
        }
    }

    return {
        total: totalLines,
        matching: matchingLines,
        different: diffLines
    };
}

function displayResults(comparison, processedHexData, processedTxtData) {
    const percentage = (comparison.matching / comparison.total * 100).toFixed(2);
    document.getElementById('percentage').textContent = percentage;
    document.getElementById('diffCount').textContent = comparison.different.length;

    document.getElementById('result').style.display = 'block';

    const processedHexSection = document.getElementById('processedHex');
    const processedTxtSection = document.getElementById('processedTxt');

    processedHexSection.innerHTML = processedHexData
        .map((line, index) => {
            const lineNumber = `<span class="line-number">${index + 1}</span> `;
            const content = comparison.different.includes(index + 1) ? `<span class="diff">${line}</span>` : line;
            return lineNumber + content;
        })
        .join('\\n');

    processedTxtSection.innerHTML = processedTxtData
        .map((line, index) => {
            const lineNumber = `<span class="line-number">${index + 1}</span> `;
            const content = comparison.different.includes(index + 1) ? `<span class="diff">${line}</span>` : line;
            return lineNumber + content;
        })
        .join('\\n');
}
