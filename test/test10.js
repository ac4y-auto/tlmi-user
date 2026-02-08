var http = require('http');

var BASE_URL = 'http://localhost:3002';

function request(method, path, body) {
    return new Promise(function(resolve, reject) {
        var url = new URL(path, BASE_URL);
        var options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        var req = http.request(options, function(res) {
            var data = '';
            res.on('data', function(chunk) { data += chunk; });
            res.on('end', function() {
                try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
                catch (e) { resolve({ status: res.statusCode, body: data }); }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function test10() {

    console.log('══════════════════════════════════════════════');
    console.log('TEST 10: POST /user/translateuser — Új felhasználó beszúrása');
    console.log('══════════════════════════════════════════════');

    var newUser = {
        name: 'test10.user',
        humanId: 'T10',
        code: 'T10',
        email: 'test10@example.com',
        password: 'test10pass',
        humanName: 'Test10 User',
        language: 'hu'
    };

    console.log('\n── 1. JS objektum (amit a kódban létrehozunk) ──');
    console.log(JSON.stringify(newUser, null, 4));

    console.log('\n── 2. Szerializált JSON (amit HTTP POST body-ként küldünk) ──');
    var serialized = JSON.stringify(newUser);
    console.log(serialized);
    console.log('  Méret: ' + serialized.length + ' byte');

    console.log('\n── 3. HTTP kérés indítása: POST /user/translateuser ──');

    var res = await request('POST', '/user/translateuser', newUser);

    console.log('\n── 4. Szerver válasz (szerializált JSON) ──');
    console.log(JSON.stringify(res.body, null, 4));

    if (res.body.object) {
        console.log('\n── 5. A DB-be ténylegesen beírt objektum (amit a szerver visszaadott) ──');
        console.log(JSON.stringify(res.body.object, null, 4));

        console.log('\n── 6. Összehasonlítás: küldött vs DB-ben tárolt ──');
        var dbObj = res.body.object;
        console.log('  id:          ' + (dbObj.id || '-') + '  ← DB generálta (AUTO_INCREMENT)');
        console.log('  GUID:        ' + (dbObj.GUID || '-') + '  ← szerver generálta');
        console.log('  createdAt:   ' + (dbObj.createdAt || '-') + '  ← DB DEFAULT CURRENT_TIMESTAMP');
        console.log('  updatedAt:   ' + (dbObj.updatedAt || '-') + '  ← DB DEFAULT CURRENT_TIMESTAMP');
        console.log('  humanId:     ' + (dbObj.humanId || '-') + '  ← küldött: ' + newUser.humanId);
        console.log('  name:        ' + (dbObj.name || '-') + '  ← küldött: ' + newUser.name);
        console.log('  code:        ' + (dbObj.code || '-') + '  ← küldött: ' + newUser.code);
        console.log('  email:       ' + (dbObj.email || '-') + '  ← küldött: ' + newUser.email);
        console.log('  password:    ' + (dbObj.password || '-') + '  ← küldött: ' + newUser.password);
        console.log('  humanName:   ' + (dbObj.humanName || '-') + '  ← küldött: ' + newUser.humanName);
        console.log('  language:    ' + (dbObj.language || '-') + '  ← küldött: ' + newUser.language);
        console.log('  token:       ' + (dbObj.token || '-') + '  ← nem küldtünk');
        console.log('  avatar:      ' + (dbObj.avatar || '-') + '  ← nem küldtünk');
    }

    console.log('\n── 7. Ellenőrzés: lekérdezzük az új usert név alapján ──');
    var verify = await request('GET', '/user/translateuser/byname/test10.user');
    console.log(JSON.stringify(verify.body, null, 4));

    console.log('\n══════════════════════════════════════════════');
    console.log('TEST 10 KÉSZ');
    console.log('══════════════════════════════════════════════');

    process.exit(0);
}

test10();
