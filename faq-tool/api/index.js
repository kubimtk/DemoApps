// Vercel Serverless Function für FAQ-Tool
const { app } = require('../src/app');
const { initDatabase } = require('../src/database');

// Initialisiere Datenbank einmal beim Cold Start
let dbInitialized = false;

async function handler(req, res) {
  try {
    // Initialisiere DB nur einmal
    if (!dbInitialized) {
      console.log('Initialisiere Datenbank...');
      await initDatabase();
      dbInitialized = true;
      console.log('Datenbank initialisiert!');
    }
    
    // Nutze Express App
    return app(req, res);
  } catch (error) {
    console.error('Handler Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
}

module.exports = handler;
