document.getElementById('compareBtn').addEventListener('click', function () {
    const hexFile = document.getElementById('hexFile').files[0];
    const txtFile = document.getElementById('txtFile').files[0];

    if (!hexFile || !txtFile) {
        alert('Please upload both files.');
        return;
    }

    // Read both files and compare
    Promise.all([readFile(hexFile), readFile(txtFile)])
        .then(([hexData, txtData]) => {
            const cleanedHexData = cleanData(hexData);
            const cleanedTxtData = cleanData(txtData);

            const processedHexData = processHexFile(cleanedHexData);
            const processedTxtData = processTxtFile(cleanedTxtData);

            const comparison = compareFiles(processedHexData, processedTxtData);
            displayResults(comparison, processedHexData, processedTxtData);
        })
        .catch(err => console.error(err));
});

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
        .map((line, index) => {
            const data = line.slice(9, -2);  // Ignore first 9 chars, last 2
            return data.slice(0, 32).match(/.{1,2}/g).join(' ');  // Group every 2 characters and join with space
        });
}

function processTxtFile(txtLines) {
    // Step 1: Join all lines and replace non-printable characters
    let entireFile = txtLines.join('')  // Join all lines into one string
        .replace(/[^\x20-\x7E]/g, '')   // Remove non-printable characters
        .replace(/\n|\r/g, '');         // Remove new line and carriage return characters

    // Step 2: Split the string by spaces to get all the hex values
    let hexArray = entireFile.split(/\s+/);  // Split by any whitespace

    let result = [];
    let currentLine = [];

    // Step 3: Iterate through the array and group valid 2-character hex pairs
    hexArray.forEach(part => {
        if (/^[A-Fa-f0-9]{2}$/.test(part)) {  // Ensure it's a valid 2-character hex string
            currentLine.push(part);  // Add valid hex to current line
            if (currentLine.length === 16) {  // When we have 16 hex pairs
                result.push(currentLine.join(' '));  // Join with spaces and add to result
                currentLine = [];  // Reset current line
            }
        }
    });

    // Step 4: If there are leftover hex pairs, push them as a final line
    if (currentLine.length > 0) {
        result.push(currentLine.join(' '));
    }

    // Step 5: Print the resulting lines (each with 16 hex pairs)
    console.log('Processed Text File Result:', result);

    // Step 6: Return the result
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
            diffLines.push(i + 1);  // Line numbers start from 1
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
    const diffLinesList = document.getElementById('diffLines');
    diffLinesList.innerHTML = '';
    comparison.different.forEach(line => {
        const li = document.createElement('li');
        li.textContent = `Line ${line}`;
        diffLinesList.appendChild(li);
    });

    document.getElementById('result').style.display = 'block';

    // Display processed hex and txt files side by side with line numbers
    const processedHexSection = document.getElementById('processedHex');
    const processedTxtSection = document.getElementById('processedTxt');

    processedHexSection.innerHTML = processedHexData
        .map((line, index) => {
            const lineNumber = `<span class="line-number">${index + 1}</span>`;
            const content = comparison.different.includes(index + 1) 
                ? `<span class="diff">${line}</span>` 
                : line;
            return lineNumber + ' ' + content;
        })
        .join('\n');

    processedTxtSection.innerHTML = processedTxtData
        .map((line, index) => {
            const lineNumber = `<span class="line-number">${index + 1}</span>`;
            const content = comparison.different.includes(index + 1) 
                ? `<span class="diff">${line}</span>` 
                : line;
            return lineNumber + ' ' + content;
        })
        .join('\n');
}
