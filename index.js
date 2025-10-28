// index.js

const express = require('express');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Simple Bot Logic Function (The Chatbot Engine) ---
function getBotResponse(message) {
    const text = message.toLowerCase().trim();

    if (text === 'hi' || text === 'hello') {
        return 'Hello there! Send me !help to see what I can do. (Reply from Render bot)';
    }

    if (text === '!status' || text.includes('online')) {
        return 'I am online and running on the Render server (non-persistent session).';
    }

    if (text === '!time') {
        return `The current server time is ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST).`;
    }
    
    if (text.includes('thanks') || text.includes('thank you')) {
        return 'You\'re welcome! Happy to assist.';
    }

    if (text === '!help') {
        return '🤖 Available Commands:\n\n' +
               '- *Hi / Hello*: A friendly greeting.\n' +
               '- *!status*: Check if the bot is running.\n' +
               '- *!time*: Get the current server time.\n' +
               '- *!help*: Show this list.';
    }

    // Default fallback response
    return "I received your message, but I only understand specific commands. Send *!help* to see what I can do.";
}
// --------------------------------------------------------

let client;

// --- 1. Client Initialization with LocalAuth and Puppeteer Args ---
client = new Client({
    // LocalAuth saves the session to the ephemeral disk.
    authStrategy: new LocalAuth({ clientId: "whatsapp-chatbot-id" }),
    puppeteer: {
        headless: true, // Should be true for server deployment
        args: [
            '--no-sandbox', // CRITICAL: Essential for Docker/Render environment
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-video-decode',
            '--disable-gpu'
        ],
    },
});

// --- 2. WhatsApp Client Listeners ---

client.on('qr', (qr) => {
    // Generate QR in terminal/logs
    qrcode.generate(qr, { small: true });
    console.log('--- QR RECEIVED ---');
    console.log('SCAN THIS QR CODE in your RENDER LOGS. (REQUIRED AFTER EVERY RESTART)');
});

client.on('ready', () => {
    console.log('✅ Client is ready! WhatsApp session established.');
});

client.on('auth_failure', (msg) => {
    console.error('❌ AUTHENTICATION FAILURE', msg);
});

// --- CORE CHATBOT LOGIC IMPLEMENTATION ---
client.on('message', message => {
    // Ignore messages sent by the bot itself or system messages
    if (message.fromMe || message.isStatus) return;

    // Only process text messages
    if (message.body) {
        console.log(`[INCOMING] from ${message.from}: ${message.body}`);
        
        // Get the response from the rule-based engine
        const botResponse = getBotResponse(message.body);
        
        // Send the generated response
        client.sendMessage(message.from, botResponse);
    }
});
// ----------------------------------------

client.initialize();


// --- 3. Express Server Routes (For Health Check) ---

app.get('/', (req, res) => {
    let status = client && client.info ? `Ready (Connected as ${client.info.pushname})` : 'Initializing/Waiting for QR Scan';
    res.send(`<h1>WhatsApp Chatbot Status: ${status}</h1><p><b>⚠️ WARNING:</b> This service is using a non-persistent session. You must check the logs for a new QR code after every service restart (common on the Render free tier).</p>`);
});

// Health check endpoint (CRITICAL to keep the free service awake)
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});