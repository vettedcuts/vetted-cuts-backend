const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect securely to your database keys
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Enable robust cross-origin configurations so Carrd can send data directly
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Base Route: Verification message to confirm the server is fully awake
app.get('/', (req, res) => {
    res.send('<h1>VettedCuts API Engine Online</h1><p>Send form submissions directly to /apply</p>');
});

// 1. Process Form Submission
app.post('/apply', async (req, res) => {
    const { name, email, contact, country, portfolio } = req.body;
    
    // Generate a unique 12-character alpha-numeric string for this profile page
    const profileId = crypto.randomBytes(6).toString('hex');
    
    // Write entry directly to your Supabase tables database
    const { error } = await supabase
        .from('editors')
        .insert([{ id: profileId, name, email, contact, country, portfolio }]);

    if (error) {
        return res.status(500).send('Database Configuration Error: ' + error.message);
    }

    // Direct user smoothly to their fully formatted live profile layout card
    res.redirect(`https://onrender.com{profileId}`);
});

// 2. Fetch and Render Live Profiles
app.get('/profile/:id', async (req, res) => {
    const { data: profile, error } = await supabase
        .from('editors')
        .select('*')
        .eq('id', req.params.id)
        .single();
    
    if (error || !profile) {
        return res.status(404).send('<h1>VettedCuts Profile Not Found</h1><p>Please double-check your link or contact support.</p>');
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${profile.name} | VettedCuts Profile</title>
            <style>
                body { background-color: #0d0d11; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
                .card { background: #161622; border: 1px solid #2e2e3f; padding: 40px; border-radius: 12px; width: 100%; max-width: 420px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .avatar { width: 80px; height: 80px; background: #ffffff; color: #000000; border-radius: 50%; margin: 0 auto 20px; display: flex; justify-content: center; align-items: center; font-size: 2.2rem; font-weight: 800; }
                h1 { margin: 10px 0 5px; font-size: 1.7rem; font-weight: 700; color: #ffffff; }
                .tag { background: #22c55e; color: #ffffff; padding: 5px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; display: inline-block; margin-bottom: 24px; letter-spacing: 0.05em; text-transform: uppercase; }
                .info-item { text-align: left; margin-bottom: 18px; border-bottom: 1px solid #2e2e3f; padding-bottom: 12px; }
                .label { color: #8f8f9d; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
                .val { font-size: 1.05rem; margin-top: 6px; color: #e4e4e7; font-weight: 500; }
                .btn { display: block; background: #ffffff; color: #000000; text-decoration: none; padding: 14px; border-radius: 6px; font-weight: 700; margin-top: 30px; text-align: center; transition: background 0.2s ease; font-size: 1rem; }
                .btn:hover { background: #e4e4e7; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="avatar">${profile.name.charAt(0).toUpperCase()}</div>
                <h1>${profile.name}</h1>
                <div class="tag">Vetted Editor</div>
                <div class="info-item"><div class="label">Location</div><div class="val">📍 ${profile.country}</div></div>
                <div class="info-item"><div class="label">Contact Handle</div><div class="val">💬 ${profile.contact}</div></div>
                <a href="${profile.portfolio}" target="_blank" class="btn">View Showreel / Portfolio</a>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT);
