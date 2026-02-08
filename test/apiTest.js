var http = require('http');

var BASE_URL = 'http://localhost:3002';

var testResults = [];
var testCount = 0;
var passCount = 0;
var failCount = 0;

// ── helpers ──

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
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', reject);

        if (body) req.write(JSON.stringify(body));

        req.end();

    });

} // request

function logObject(label, obj) {
    console.log('\n  📦 ' + label + ':');
    console.log('  ' + JSON.stringify(obj, null, 4).split('\n').join('\n  '));
}

function logDBIntent(method, path, body) {
    console.log('\n  💾 DB-be küldött adat:');
    if (body) {
        console.log('  ' + method + ' ' + path);
        console.log('  Request body: ' + JSON.stringify(body, null, 4).split('\n').join('\n  '));
    } else {
        console.log('  ' + method + ' ' + path + ' (nincs request body)');
    }
}

function assert(testName, condition, actual, expected) {
    testCount++;
    if (condition) {
        passCount++;
        console.log('  ✅ ' + testName);
    } else {
        failCount++;
        console.log('  ❌ ' + testName);
        console.log('     Várt: ' + JSON.stringify(expected));
        console.log('     Kapott: ' + JSON.stringify(actual));
    }
}

// ── tesztek ──

async function testGetAllUsers() {

    console.log('\n══════════════════════════════════════════════');
    console.log('TEST 1: GET /user/translateuser — Összes felhasználó lekérdezése');
    console.log('══════════════════════════════════════════════');

    logDBIntent('GET', '/user/translateuser');

    var res = await request('GET', '/user/translateuser');

    logObject('Szerver válasz (szerializált)', res.body);

    assert('HTTP status 200', res.status === 200, res.status, 200);
    assert('result.code === 1 (success)', res.body.result && res.body.result.code === 1, res.body.result, { code: 1 });
    assert('Van lista (list)', Array.isArray(res.body.list), typeof res.body.list, 'array');
    assert('Lista nem üres', res.body.list && res.body.list.length > 0, res.body.list ? res.body.list.length : 0, '>0');

    if (res.body.list && res.body.list.length > 0) {
        var firstUser = res.body.list[0];
        logObject('Első felhasználó objektum', firstUser);
        assert('Első usernek van id', firstUser.id !== undefined, firstUser.id, 'defined');
        assert('Első usernek van name', firstUser.name !== undefined, firstUser.name, 'defined');
        assert('Első usernek van email', firstUser.email !== undefined, firstUser.email, 'defined');
        assert('Első usernek van language', firstUser.language !== undefined, firstUser.language, 'defined');
    }

} // testGetAllUsers

async function testGetUserById() {

    console.log('\n══════════════════════════════════════════════');
    console.log('TEST 2: GET /user/translateuser/1 — Felhasználó ID alapján');
    console.log('══════════════════════════════════════════════');

    logDBIntent('GET', '/user/translateuser/1');

    var res = await request('GET', '/user/translateuser/1');

    logObject('Szerver válasz (szerializált)', res.body);

    assert('HTTP status 200', res.status === 200, res.status, 200);
    assert('result.code === 1', res.body.result && res.body.result.code === 1, res.body.result, { code: 1 });
    assert('Van object', res.body.object !== undefined, res.body.object, 'defined');

    if (res.body.object) {
        logObject('TranslateUser objektum', res.body.object);
        assert('object.id === 1', res.body.object.id === 1, res.body.object.id, 1);
        assert('Van humanName', res.body.object.humanName !== undefined, res.body.object.humanName, 'defined');
        assert('Van ac4yIdentification', res.body.object.ac4yIdentification !== undefined, res.body.object.ac4yIdentification, 'defined');
    }

} // testGetUserById

async function testGetUserByIdNotFound() {

    console.log('\n══════════════════════════════════════════════');
    console.log('TEST 3: GET /user/translateuser/9999 — Nem létező felhasználó');
    console.log('══════════════════════════════════════════════');

    logDBIntent('GET', '/user/translateuser/9999');

    var res = await request('GET', '/user/translateuser/9999');

    logObject('Szerver válasz (szerializált)', res.body);

    assert('HTTP status 200', res.status === 200, res.status, 200);
    assert('result.code === -1 (error)', res.body.result && res.body.result.code === -1, res.body.result, { code: -1 });
    assert('Hibaüzenet tartalmazza "does not exist"',
        res.body.result && res.body.result.description && res.body.result.description.indexOf('does not exist') >= 0,
        res.body.result ? res.body.result.description : null, 'contains "does not exist"');

} // testGetUserByIdNotFound

async function testGetUserByName() {

    console.log('\n══════════════════════════════════════════════');
    console.log('TEST 4: GET /user/translateuser/byname/anna.nagy — Felhasználó név alapján');
    console.log('══════════════════════════════════════════════');

    logDBIntent('GET', '/user/translateuser/byname/anna.nagy');

    var res = await request('GET', '/user/translateuser/byname/anna.nagy');

    logObject('Szerver válasz (szerializált)', res.body);

    assert('HTTP status 200', res.status === 200, res.status, 200);
    assert('result.code === 1', res.body.result && res.body.result.code === 1, res.body.result, { code: 1 });

    if (res.body.object) {
        logObject('TranslateUser objektum', res.body.object);
        assert('object.humanName === "Nagy Anna"', res.body.object.humanName === 'Nagy Anna', res.body.object.humanName, 'Nagy Anna');
        assert('object.language === "hu"', res.body.object.language === 'hu', res.body.object.language, 'hu');
        assert('object.email === "anna.nagy@example.com"', res.body.object.email === 'anna.nagy@example.com', res.body.object.email, 'anna.nagy@example.com');
    }

} // testGetUserByName

async function testGetUserByNameNotFound() {

    console.log('\n══════════════════════════════════════════════');
    console.log('TEST 5: GET /user/translateuser/byname/noone — Nem létező név');
    console.log('══════════════════════════════════════════════');

    logDBIntent('GET', '/user/translateuser/byname/noone');

    var res = await request('GET', '/user/translateuser/byname/noone');

    logObject('Szerver válasz (szerializált)', res.body);

    assert('HTTP status 200', res.status === 200, res.status, 200);
    assert('result.code === -1 (error)', res.body.result && res.body.result.code === -1, res.body.result, { code: -1 });

} // testGetUserByNameNotFound

async function testExistsById() {

    console.log('\n══════════════════════════════════════════════');
    console.log('TEST 6: GET /user/translateuser/exists/2 — Létezik-e ID alapján (igen)');
    console.log('══════════════════════════════════════════════');

    logDBIntent('GET', '/user/translateuser/exists/2');

    var res = await request('GET', '/user/translateuser/exists/2');

    logObject('Szerver válasz (szerializált)', res.body);

    assert('HTTP status 200', res.status === 200, res.status, 200);
    assert('result.code === 1 (exist)', res.body.result && res.body.result.code === 1, res.body.result, { code: 1 });
    assert('result.message === "exist!"', res.body.result && res.body.result.message === 'exist!', res.body.result ? res.body.result.message : null, 'exist!');

} // testExistsById

async function testExistsByIdNotFound() {

    console.log('\n══════════════════════════════════════════════');
    console.log('TEST 7: GET /user/translateuser/exists/9999 — Létezik-e ID alapján (nem)');
    console.log('══════════════════════════════════════════════');

    logDBIntent('GET', '/user/translateuser/exists/9999');

    var res = await request('GET', '/user/translateuser/exists/9999');

    logObject('Szerver válasz (szerializált)', res.body);

    assert('HTTP status 200', res.status === 200, res.status, 200);
    assert('result.code === 0 (does not exist)', res.body.result && res.body.result.code === 0, res.body.result, { code: 0 });
    assert('result.message === "does not exist!"', res.body.result && res.body.result.message === 'does not exist!', res.body.result ? res.body.result.message : null, 'does not exist!');

} // testExistsByIdNotFound

async function testExistsByName() {

    console.log('\n══════════════════════════════════════════════');
    console.log('TEST 8: GET /user/translateuser/exists/byname/john.smith — Létezik-e név alapján (igen)');
    console.log('══════════════════════════════════════════════');

    logDBIntent('GET', '/user/translateuser/exists/byname/john.smith');

    var res = await request('GET', '/user/translateuser/exists/byname/john.smith');

    logObject('Szerver válasz (szerializált)', res.body);

    assert('HTTP status 200', res.status === 200, res.status, 200);
    assert('result.code === 1 (exist)', res.body.result && res.body.result.code === 1, res.body.result, { code: 1 });
    assert('result.message === "exist!"', res.body.result && res.body.result.message === 'exist!', res.body.result ? res.body.result.message : null, 'exist!');

} // testExistsByName

async function testExistsByNameNotFound() {

    console.log('\n══════════════════════════════════════════════');
    console.log('TEST 9: GET /user/translateuser/exists/byname/ghost — Létezik-e név alapján (nem)');
    console.log('══════════════════════════════════════════════');

    logDBIntent('GET', '/user/translateuser/exists/byname/ghost');

    var res = await request('GET', '/user/translateuser/exists/byname/ghost');

    logObject('Szerver válasz (szerializált)', res.body);

    assert('HTTP status 200', res.status === 200, res.status, 200);
    assert('result.code === 0 (does not exist)', res.body.result && res.body.result.code === 0, res.body.result, { code: 0 });

} // testExistsByNameNotFound

async function testInsertUser() {

    console.log('\n══════════════════════════════════════════════');
    console.log('TEST 10: POST /user/translateuser — Új felhasználó beszúrása');
    console.log('══════════════════════════════════════════════');

    var newUser = {
        name: 'test.user',
        humanId: 'TEST01',
        code: 'TU01',
        email: 'test.user@example.com',
        password: 'testpass',
        humanName: 'Test User',
        language: 'en'
    };

    logObject('Küldendő JS objektum (szerializálás előtt)', newUser);
    logDBIntent('POST', '/user/translateuser', newUser);
    console.log('\n  🔄 Szerializált JSON (amit a hálózaton küldünk):');
    console.log('  ' + JSON.stringify(newUser));

    var res = await request('POST', '/user/translateuser', newUser);

    logObject('Szerver válasz (szerializált)', res.body);

    assert('HTTP status 200', res.status === 200, res.status, 200);
    assert('result.code === 1', res.body.result && res.body.result.code === 1, res.body.result, { code: 1 });

    if (res.body.object) {
        logObject('Beszúrt TranslateUser objektum (DB-ből visszakapott)', res.body.object);
        assert('Van id (DB generálta)', res.body.object.id !== undefined, res.body.object.id, 'defined');
        assert('name megegyezik', res.body.object.name === 'test.user' || (res.body.object.name === undefined), res.body.object.name, 'test.user');
        assert('Van GUID', res.body.object.GUID !== undefined, res.body.object.GUID, 'defined');
        assert('Van createdAt', res.body.object.createdAt !== undefined, res.body.object.createdAt, 'defined');
    }

    return res.body.object;

} // testInsertUser

async function testUpdateUser(insertedUser) {

    console.log('\n══════════════════════════════════════════════');
    console.log('TEST 11: POST /user/translateuser/:id — Felhasználó módosítása');
    console.log('══════════════════════════════════════════════');

    var userId = insertedUser ? insertedUser.id : 4;

    var updateData = {
        humanName: 'Test User UPDATED',
        language: 'de',
        email: 'updated@example.com'
    };

    logObject('Módosítandó mezők (JS objektum)', updateData);
    logDBIntent('POST', '/user/translateuser/' + userId, updateData);
    console.log('\n  🔄 Szerializált JSON (amit a hálózaton küldünk):');
    console.log('  ' + JSON.stringify(updateData));

    var res = await request('POST', '/user/translateuser/' + userId, updateData);

    logObject('Szerver válasz (szerializált)', res.body);

    assert('HTTP status 200', res.status === 200, res.status, 200);
    assert('result.code === 1', res.body.result && res.body.result.code === 1, res.body.result, { code: 1 });

    if (res.body.object) {
        logObject('Módosított TranslateUser objektum (DB-ből visszakapott)', res.body.object);
        assert('humanName frissítve', res.body.object.humanName === 'Test User UPDATED', res.body.object.humanName, 'Test User UPDATED');
        assert('language frissítve', res.body.object.language === 'de', res.body.object.language, 'de');
    }

} // testUpdateUser

async function testInsertMinimalUser() {

    console.log('\n══════════════════════════════════════════════');
    console.log('TEST 12: POST /user/translateuser — Minimális adatokkal beszúrás');
    console.log('══════════════════════════════════════════════');

    var minimalUser = {
        name: 'minimal.user'
    };

    logObject('Minimális JS objektum', minimalUser);
    logDBIntent('POST', '/user/translateuser', minimalUser);
    console.log('\n  🔄 Szerializált JSON:');
    console.log('  ' + JSON.stringify(minimalUser));

    var res = await request('POST', '/user/translateuser', minimalUser);

    logObject('Szerver válasz (szerializált)', res.body);

    assert('HTTP status 200', res.status === 200, res.status, 200);
    assert('result.code === 1', res.body.result && res.body.result.code === 1, res.body.result, { code: 1 });

    if (res.body.object) {
        logObject('DB-ből visszakapott objektum (GUID-dal kiegészítve)', res.body.object);
        assert('GUID automatikusan generálódott', res.body.object.GUID !== undefined, res.body.object.GUID, 'defined');
        assert('createdAt automatikusan kitöltődött', res.body.object.createdAt !== undefined, res.body.object.createdAt, 'defined');
    }

} // testInsertMinimalUser

async function testInsertFullUser() {

    console.log('\n══════════════════════════════════════════════');
    console.log('TEST 13: POST /user/translateuser — Teljes adatokkal beszúrás');
    console.log('══════════════════════════════════════════════');

    var fullUser = {
        humanId: 'FULL01',
        name: 'full.user',
        code: 'FU01',
        email: 'full.user@example.com',
        token: 'token_full_01',
        avatar: 'data:image/png;base64,iVBORw0KGgo=',
        password: 'fullpass123',
        humanName: 'Full User',
        language: 'fr'
    };

    logObject('Teljes JS objektum (minden mező kitöltve)', fullUser);
    logDBIntent('POST', '/user/translateuser', fullUser);
    console.log('\n  🔄 Szerializált JSON:');
    console.log('  ' + JSON.stringify(fullUser));

    var res = await request('POST', '/user/translateuser', fullUser);

    logObject('Szerver válasz (szerializált)', res.body);

    assert('HTTP status 200', res.status === 200, res.status, 200);
    assert('result.code === 1', res.body.result && res.body.result.code === 1, res.body.result, { code: 1 });

    if (res.body.object) {
        logObject('DB-ből visszakapott objektum', res.body.object);
        assert('Minden mező megvan - email', res.body.object.email === 'full.user@example.com', res.body.object.email, 'full.user@example.com');
        assert('Minden mező megvan - token', res.body.object.token === 'token_full_01', res.body.object.token, 'token_full_01');
        assert('Minden mező megvan - avatar', res.body.object.avatar !== undefined, res.body.object.avatar, 'defined');
        assert('Minden mező megvan - language', res.body.object.language === 'fr', res.body.object.language, 'fr');
    }

} // testInsertFullUser

async function testVerifyAllAfterInserts() {

    console.log('\n══════════════════════════════════════════════');
    console.log('TEST 14: GET /user/translateuser — Ellenőrzés: összes user a beszúrások után');
    console.log('══════════════════════════════════════════════');

    logDBIntent('GET', '/user/translateuser');

    var res = await request('GET', '/user/translateuser');

    logObject('Szerver válasz — teljes lista (szerializált)', res.body);

    assert('HTTP status 200', res.status === 200, res.status, 200);
    assert('Lista elemszám >= 6 (3 eredeti + 3 beszúrt)', res.body.list && res.body.list.length >= 6, res.body.list ? res.body.list.length : 0, '>=6');

    if (res.body.list) {
        console.log('\n  📋 Összes felhasználó összefoglalás:');
        for (var i = 0; i < res.body.list.length; i++) {
            var u = res.body.list[i];
            console.log('    [' + u.id + '] ' + (u.name || '-') + ' | ' + (u.humanName || '-') + ' | ' + (u.email || '-') + ' | ' + (u.language || '-'));
        }
    }

} // testVerifyAllAfterInserts

// ── futtatás ──

async function runAllTests() {

    console.log('🚀 tlmi-user API Teszt Indítás');
    console.log('   Szerver: ' + BASE_URL);
    console.log('   Időpont: ' + new Date().toISOString());

    try {
        await testGetAllUsers();
        await testGetUserById();
        await testGetUserByIdNotFound();
        await testGetUserByName();
        await testGetUserByNameNotFound();
        await testExistsById();
        await testExistsByIdNotFound();
        await testExistsByName();
        await testExistsByNameNotFound();
        var insertedUser = await testInsertUser();
        await testUpdateUser(insertedUser);
        await testInsertMinimalUser();
        await testInsertFullUser();
        await testVerifyAllAfterInserts();
    } catch (error) {
        console.log('\n💥 Váratlan hiba: ' + error.message);
        console.log(error.stack);
    }

    console.log('\n══════════════════════════════════════════════');
    console.log('📊 ÖSSZESÍTÉS');
    console.log('══════════════════════════════════════════════');
    console.log('   Összes teszt: ' + testCount);
    console.log('   ✅ Sikeres:   ' + passCount);
    console.log('   ❌ Sikertelen: ' + failCount);
    console.log('══════════════════════════════════════════════');

    process.exit(failCount > 0 ? 1 : 0);

} // runAllTests

runAllTests();
