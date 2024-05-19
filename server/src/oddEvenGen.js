import fs from 'fs';
import path from 'path';

const generateEvenOrOddScript = () => {
  const INT_MIN = Math.ceil(-2147483648);
  const INT_MAX = Math.ceil(-2147200000);
  const chunkSize = 1000000; // Adjust the chunk size as needed
  let script = 'const evenOrOdd = (req, res) => {\n';
  script += '  const { number } = req.body;\n\n';
  script += '  // manually determine if the number is even or odd\n';
  script += `  // starting from INT_MIN to INT_MAX\n`;

  fs.writeFileSync('evenOrOddScript.js', script);

  let line = '';

  for (let i = INT_MIN; i <= INT_MAX; i++) {
    const result = i % 2 === 0 ? 'even' : 'odd';
    line += `  if (number === ${i}) {\n    res.json({ result: "${result}" });\n  }\n`;

    // Update the file periodically
    if (i % chunkSize === 0) {
      console.log(`Progress: ${i}`);
        fs.appendFileSync('evenOrOddScript.js', line);
        line = '';
    }
  }
  fs.appendFileSync('evenOrOddScript.js', line);
  fs.appendFileSync('evenOrOddScript.js', '};\n');

  console.log('evenOrOddScript.js has been generated.');
};

// Start generating the script
generateEvenOrOddScript();
