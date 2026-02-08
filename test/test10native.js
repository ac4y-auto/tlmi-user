var http = require('http');
var TranslateUser = require('../domain/TranslateUser.js');

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

async function test10native() {

    console.log('══════════════════════════════════════════════');
    console.log('TEST 10 NATIVE: TranslateUser domain objektummal');
    console.log('══════════════════════════════════════════════');

    // ── 1. TranslateUser létrehozása natív módon ──

    var user = new TranslateUser();
    user.setHumanName('Native User');
    user.setLanguage('hu');

    console.log('\n── 1. TranslateUser objektum (natív, setter-ekkel létrehozva) ──');
    console.log('  user.getHumanName():', user.getHumanName());
    console.log('  user.getLanguage():', user.getLanguage());
    console.log('  user.getGUID():', user.getGUID());
    console.log('  user.hasGUID():', user.hasGUID());

    console.log('\n── 2. Teljes JS objektum (JSON.stringify) ──');
    console.log(JSON.stringify(user, null, 4));

    console.log('\n── 3. Ami ténylegesen a hálózaton megy (szerializált) ──');
    var serialized = JSON.stringify(user);
    console.log(serialized);
    console.log('  Méret: ' + serialized.length + ' byte');
    console.log('\n  ⚠️  Figyeld meg: az ac4yIdentification benne van!');

    // ── 4. Elküldés a szervernek ──

    console.log('\n── 4. POST /user/translateuser küldése ──');
    var res = await request('POST', '/user/translateuser', user);

    console.log('\n── 5. Szerver válasz ──');
    console.log(JSON.stringify(res.body, null, 4));

    if (res.body.result && res.body.result.code === -1) {
        console.log('\n  ❌ HIBA: ' + res.body.result.description);
        console.log('\n  💡 Az ac4yIdentification mező nincs a DB táblában!');
        console.log('     A java-tolmi-client is pontosan ezzel a problémával találkozik.');
    } else {
        console.log('\n  ✅ Sikeres beszúrás');
    }

    // ── 6. Összehasonlítás: plain object vs natív TranslateUser ──

    console.log('\n══════════════════════════════════════════════');
    console.log('ÖSSZEHASONLÍTÁS: plain object vs natív TranslateUser');
    console.log('══════════════════════════════════════════════');

    var plainUser = { name: 'plain.user', humanName: 'Plain User', language: 'hu', password: '1' };

    console.log('\n  Plain object kulcsok:');
    console.log('    ' + Object.keys(plainUser).join(', '));

    console.log('\n  Natív TranslateUser kulcsok:');
    console.log('    ' + Object.keys(user).join(', '));

    console.log('\n  Különbség: a natív TranslateUser tartalmazza az ac4yIdentification-t,');
    console.log('  ami egy beágyazott objektum, és nincs hozzá oszlop a DB táblában.');

    // ── 7. Plain object küldése (ez működik) ──

    console.log('\n── 7. Plain object küldése (kontroll teszt) ──');
    var res2 = await request('POST', '/user/translateuser', plainUser);
    console.log('  result.code: ' + (res2.body.result ? res2.body.result.code : 'n/a'));
    console.log('  result.message: ' + (res2.body.result ? res2.body.result.message : 'n/a'));

    if (res2.body.result && res2.body.result.code === 1) {
        console.log('  ✅ Plain object sikeresen beszúrva (nincs ac4yIdentification)');
    }

    console.log('\n══════════════════════════════════════════════');
    console.log('TEST 10 NATIVE KÉSZ');
    console.log('══════════════════════════════════════════════');

    process.exit(0);
}

test10native();
