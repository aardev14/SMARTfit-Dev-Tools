document.getElementById('processButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length === 0) {
        alert('Please select a file first.');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        processFile(event.target.result);
    };
    reader.readAsText(file);
});

function processFile(content) {
    // Clean the file by removing any messages from communication that may have snuck through.
    content = content.replace(/<[^>]*>/g, '');
    
    // Extract only two-character hex pairs (e.g., "0F", "A1") from the content
    const allPairs = content.match(/\b[0-9A-Fa-f]{2}\b/g) || [];

    // Print the count of all pairs to the console
    console.log("Total hex pairs:", allPairs.length);

    // Initialize variables and queues
    const expectedPairStrings = [];
    const actualPairStrings = [];
    
    // Process AllPairs queue
    while (allPairs.length > 0) {
        let expectedPairs = [];
        let actualPairs = [];

        // Dequeue 256 for ExpectedPairs
        for (let i = 0; i < 256 && allPairs.length > 0; i++) {
            expectedPairs.push(allPairs.shift());
        }
        const pair256 = expectedPairs[expectedPairs.length - 1];

        // Dequeue 255 for ActualPairs and add pair256
        for (let i = 0; i < 255 && allPairs.length > 0; i++) {
            actualPairs.push(allPairs.shift());
        }
        actualPairs.push(pair256); // Append the 256th pair

        // Combine pairs into strings of 16 for Expected and Actual output
        for (let i = 0; i < 256; i += 16) {
            expectedPairStrings.push(expectedPairs.slice(i, i + 16).join(' '));
            actualPairStrings.push(actualPairs.slice(i, i + 16).join(' '));
        }
    }
    
    // Compare the processed lines
    const comparison = comparePairs(expectedPairStrings, actualPairStrings);

    // Pass the comparison and processed data to displayResults
    displayResults(comparison, expectedPairStrings, actualPairStrings);
}

function comparePairs(expected, actual) {
    const totalLines = Math.min(expected.length, actual.length);
    let matchingLines = 0;
    let diffLines = [];

    for (let i = 0; i < totalLines; i++) {
        if (expected[i].trim() === actual[i].trim()) {
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

function displayResults(comparison, expected, actual) {
    const percentage = (comparison.matching / comparison.total * 100).toFixed(2);
    document.getElementById('percentage').textContent = percentage;
    document.getElementById('diffCount').textContent = comparison.different.length;

    const resultDiv = document.getElementById('result');
    const expectedOutput = document.getElementById('expected-output');
    const actualOutput = document.getElementById('actual-output');

    // Ensure the result div is visible
    resultDiv.style.display = 'block';

    // Clear previous output
    expectedOutput.innerHTML = '';
    actualOutput.innerHTML = '';

    expected.forEach((expectedLine, index) => {
        const actualLine = actual[index];
        const matchClass = comparison.different.includes(index + 1) ? 'mismatch' : 'match';

        // Calculate and format line number in hexadecimal
        const hexLineNumber = (index * 0x10).toString(16).toUpperCase().padStart(5, '0');
        const lineNumberHTML = `<span class="line-number" style="color: blue;">${hexLineNumber}</span>`;

        // Create elements for each line in Expected and Actual output columns
        const expectedDiv = document.createElement('div');
        expectedDiv.innerHTML = `${lineNumberHTML} <span class="${matchClass}">${expectedLine}</span>`;
        expectedOutput.appendChild(expectedDiv);

        const actualDiv = document.createElement('div');
        actualDiv.innerHTML = `${lineNumberHTML} <span class="${matchClass}">${actualLine}</span>`;
        actualOutput.appendChild(actualDiv);
    });
}
