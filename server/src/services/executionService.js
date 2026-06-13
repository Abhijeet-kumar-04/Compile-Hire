async function executeCode(code, language) {
    const languageIds = {
        javascript: 93, // Node.js 18.15.0
        python: 71,     // Python 3.11.2
        cpp: 54,        // C++ (GCC 9.2.0)
        java: 62        // Java (OpenJDK 13.0.1)
    };

    const langId = languageIds[language] || 93;

    if (!process.env.RAPIDAPI_KEY) {
        throw new Error('RAPIDAPI_KEY is not configured on the server.');
    }

    const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPIDAPI_KEY
        },
        body: JSON.stringify({
            source_code: code,
            language_id: langId
        })
    });

    const result = await response.json();
    return result.stdout || result.stderr || result.compile_output || result.message || "Code executed successfully with no output.";
}

module.exports = { executeCode };
