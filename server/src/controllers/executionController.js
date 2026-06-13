const executionService = require('../services/executionService');

async function execute(req, res) {
    try {
        const { code, language } = req.body;
        const output = await executionService.executeCode(code, language);
        res.json({ run: { output } });
    } catch (error) {
        console.error('Code execution error:', error);
        res.status(500).json({ error: 'Execution failed: ' + error.message });
    }
}

module.exports = { execute };
