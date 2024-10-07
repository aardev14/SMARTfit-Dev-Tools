
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
    // Remove non-printable characters and replace spaces with commas
    let cleanedContent = content.replace(/[^ -~]/g, '').replace(/\s+/g, ',');

    // Split content by commas and queue hex pairs
    const allPairs = cleanedContent.match(/.{1,2}/g) || [];

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
    // Print the count of all lines to the console
    console.log("Total expected lines:", expectedPairStrings.length);
    console.log("Total actual lines:", actualPairStrings.length);

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

        // Create elements for each line in Expected and Actual output columns
        const expectedDiv = document.createElement('div');
        expectedDiv.textContent = expectedLine;
        expectedDiv.className = matchClass;
        expectedOutput.appendChild(expectedDiv);

        const actualDiv = document.createElement('div');
        actualDiv.textContent = actualLine;
        actualDiv.className = matchClass;
        actualOutput.appendChild(actualDiv);
    });
}
