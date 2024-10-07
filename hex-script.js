
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

    //Clean the file by removing any messages from communication that may have snuck through.
    content = content.replace(/<[^>]*>/g, '');
    
    // Extract only two-character hex pairs (e.g., "0F", "A1") from the content
    const allPairs = content.match(/\b[0-9A-Fa-f]{2}\b/g) || [];

    // Print the count of all pairs to the console
    console.log("Total hex pairs:", allPairs.length);

    // Initialize variables and queues
    let hexPairCounter = 0;
    const expectedPairStrings = [];
    const actualPairStrings = [];
    let expectedPairs = [];
    let actualPairs = [];
    
    // Process AllPairs queue
    while (allPairs.length > 0) {
        // Dequeue 256 for ExpectedPairs
        expectedPairs = [];
        for (let i = 0; i < 256 && allPairs.length > 0; i++) {
            expectedPairs.push(allPairs.shift());
            hexPairCounter++;
        }
        const pair256 = expectedPairs[expectedPairs.length - 1];
        hexPairCounter = 0;

        // Dequeue 255 for ActualPairs and add pair256
        actualPairs = [];
        for (let i = 0; i < 255 && allPairs.length > 0; i++) {
            actualPairs.push(allPairs.shift());
            hexPairCounter++;
        }
        actualPairs.push(pair256); // Append the 256th pair
        hexPairCounter = 0;

        // Combine pairs into strings of 16 for Expected and Actual output
        for (let i = 0; i < 256; i += 16) {
            expectedPairStrings.push(expectedPairs.slice(i, i + 16).join(' '));
            actualPairStrings.push(actualPairs.slice(i, i + 16).join(' '));
        }
    }
    
    // Print the lines and their count to the console to debug.
    console.log("Total expected lines:", expectedPairStrings.length);
    console.log("Total actual lines:", actualPairStrings.length);
    console.log("Expected Pair Strings:", expectedPairStrings);
    console.log("Actual Pair Strings:", actualPairStrings);

    displayResults(expectedPairStrings, actualPairStrings);
}

function displayResults(expected, actual) {
    const expectedOutput = document.getElementById('expected-output');
    const actualOutput = document.getElementById('actual-output');

    // Clear previous output
    expectedOutput.innerHTML = '';
    actualOutput.innerHTML = '';

    expected.forEach((expectedLine, index) => {
        const actualLine = actual[index];
        const matchClass = expectedLine === actualLine ? 'match' : 'mismatch';

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
