const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/apply', async (req, res) => {
    const { name, email, contact, country, portfolio } = req.body;
    const profileId = crypto.randomBytes(6).toString('hex');
    
    const { error } = await supabase
        .from('editors')
        .insert([{ id: profileId, name, email, contact, country, portfolio }]);

    if (error) {
        return res.status(500).send('Database Error: ' + error.message);
    }

    res.redirect(`/profile/${profileId}`);
});

app.get('/profile/:id', async (req, res) => {
    const { data: profile, error } = await supabase
        .from('editors')
        .select('*')
        .eq('id', req.params.id)
        .single();
    
    if (error || !profile) {
        return res.status(404).send('<h1>Profile Not Found</h1>');
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${profile.name} | VettedCuts Profile</title>
            <style>
                body { background-color: #0d0d11; color: #ffffff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .card { background: #161622; border: 1px solid #2e2e3f; padding: 40px; border-radius: 12px; width: 100%; max-width: 450px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .avatar { width: 80px; height: 80px; background: #6366f1; border-radius: 50%; margin: 0 auto 20px; display: flex; justify-content: center; align-items: center; font-size: 2rem; font-weight: bold; }
                h1 { margin: 10px 0 5px; font-size: 1.6rem; }
                .tag { background: #22c55e; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; display: inline-block; margin-bottom: 20px; }
                .info-item { text-align: left; margin-bottom: 15px; border-bottom: 1px solid #2e2e3f; padding-bottom: 10px; }
                .label { color: #8f8f9d; font-size: 0.85rem; text-transform: uppercase; }
                .val { font-size: 1rem; margin-top: 4px; color: #e4e4e7; word-break: break-all; }
                .btn { display: block; background: #6366f1; color: white; text-decoration: none; padding: 12px; border-radius: 6px; font-weight: bold; margin-top: 25px; }
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
