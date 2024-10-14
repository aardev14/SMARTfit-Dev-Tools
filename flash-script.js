
document.getElementById('compareBtn').addEventListener('click', function () {
    const hexFile1 = document.getElementById('hexFile1').files[0];
    const hexFile2 = document.getElementById('hexFile2').files[0];

    if (!hexFile1 || !hexFile2) {
        alert('Please upload both files.');
        return;
    }

    // Show the loading spinner
    toggleSpinner(true);

    // Read both files and compare
    Promise.all([readFile(hexFile1), readFile(hexFile2)])
        .then(([hexData1, hexData2]) => {
            const cleanedHexData1 = cleanData(hexData1);
            const cleanedHexData2 = cleanData(hexData2);

            const processedHexData1 = processHexFile(cleanedHexData1);
            const processedHexData2 = processHexFile(cleanedHexData2);

            const comparison = compareFiles(processedHexData1, processedHexData2);
            displayResults(comparison, processedHexData1, processedHexData2);
        })
        .catch(err => console.error(err))
        .finally(() => {
            // Hide the loading spinner after processing
            toggleSpinner(false);
        });
});

function toggleSpinner(show) {
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = show ? 'block' : 'none';
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result.split('\n'));
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// Function to clean non-printable characters from data
function cleanData(lines) {
    return lines.map(line => line.replace(/[^\x20-\x7E]/g, ''));  // Remove non-printable characters
}

function processHexFile(hexLines) {
    return hexLines
        .filter(line => line.length >= 43)  // Remove lines shorter than 43 characters
        .map(line => {
            const data = line.slice(9, -2);  // Ignore first 9 chars, last 2
            return data.slice(0, 32).match(/.{1,2}/g).join(' ');  // Group every 2 characters and join with space
        });
}

function compareFiles(hexLines1, hexLines2) {
    const totalLines = Math.min(hexLines1.length, hexLines2.length);
    let matchingLines = 0;
    let diffLines = [];

    for (let i = 0; i < totalLines; i++) {
        if (hexLines1[i].trim() === hexLines2[i].trim()) {
            matchingLines++;
        } else {
            diffLines.push(i + 1);  // Line numbers start from 1
        }
    }

    return {
        total: totalLines,
        matching: matchingLines,
        different: diffLines
    };
}

function displayResults(comparison, processedHexData1, processedHexData2) {
    const percentage = (comparison.matching / comparison.total * 100).toFixed(2);
    document.getElementById('percentage').textContent = percentage;
    document.getElementById('diffCount').textContent = comparison.different.length;

    document.getElementById('result').style.display = 'block';

    const processedHexSection1 = document.getElementById('processedHex1');
    processedHexSection1.innerHTML = processedHexData1
        .map((line, index) => {
            const hexLineNumber = (index * 0x10).toString(16).toUpperCase().padStart(5, '0');
            const lineNumber = `<span class="line-number">${hexLineNumber}</span>`;
            const content = comparison.different.includes(index + 1) 
                ? `<span class="diff">${line}</span>` 
                : line;
            return `<span style="color: blue">${lineNumber}</span> ${content}`;
        })
        .join('<br>');

    const processedHexSection2 = document.getElementById('processedHex2');
    processedHexSection2.innerHTML = processedHexData2
        .map((line, index) => {
            const hexLineNumber = (index * 0x10).toString(16).toUpperCase().padStart(5, '0');
            const lineNumber = `<span class="line-number">${hexLineNumber}</span>`;
            const content = comparison.different.includes(index + 1) 
                ? `<span class="diff">${line}</span>` 
                : line;
            return `<span style="color: blue">${lineNumber}</span> ${content}`;
        })
        .join('<br>');
}
