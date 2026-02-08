var knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: 'manage',
        database: 'ac4y'
    },
    pool: { min: 2, max: 10 }
});

var testCount = 0;
var passCount = 0;
var failCount = 0;

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

function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function generateTranslateUser(index) {
    var languages = ['hu', 'en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'cs', 'sk', 'ro', 'ja', 'zh', 'ko'];
    return {
        GUID: generateGUID(),
        name: 'user_' + String(index).padStart(4, '0'),
        password: 'pass_' + index,
        humanName: 'Test User #' + index,
        email: 'user' + index + '@test.com',
        language: languages[index % languages.length],
        humanId: 'HID-' + index,
        code: 'CODE-' + String(index).padStart(4, '0'),
        token: 'token_' + generateGUID(),
        avatar: 'https://avatar.test/' + index + '.png'
    };
}

function ms(hrtime) {
    return (hrtime[0] * 1000 + hrtime[1] / 1000000).toFixed(2);
}

var TABLE = 'TranslateUser';
var RECORD_COUNT = 100;

async function runTests() {
    console.log('🚀 MySQL (knex/mysql2) Performance Test - ' + RECORD_COUNT + ' TranslateUser');
    console.log('══════════════════════════════════════════════════════════════════\n');

    // Tiszta lap
    await knex(TABLE).del();

    // ══════════════════════════════════════════════
    // TEST 1: Egyenkénti INSERT (100 db)
    // ══════════════════════════════════════════════
    console.log('══════════════════════════════════════════════════════════════════');
    console.log('TEST 1: Egyenkénti INSERT — ' + RECORD_COUNT + ' rekord');
    console.log('══════════════════════════════════════════════════════════════════');

    var t1 = process.hrtime();
    for (var i = 0; i < RECORD_COUNT; i++) {
        await knex(TABLE).insert(generateTranslateUser(i));
    }
    var t1end = process.hrtime(t1);
    var t1ms = ms(t1end);
    console.log('  ⏱️  Idő: ' + t1ms + ' ms (' + (t1ms / RECORD_COUNT).toFixed(2) + ' ms/db)');
    assert(RECORD_COUNT + ' rekord beszúrva', true, RECORD_COUNT, RECORD_COUNT);

    // ══════════════════════════════════════════════
    // TEST 2: Bulk INSERT
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 2: Bulk INSERT — ' + RECORD_COUNT + ' rekord');
    console.log('══════════════════════════════════════════════════════════════════');

    var bulkData = [];
    for (var i = RECORD_COUNT; i < RECORD_COUNT * 2; i++) {
        bulkData.push(generateTranslateUser(i));
    }

    var t2 = process.hrtime();
    await knex(TABLE).insert(bulkData);
    var t2end = process.hrtime(t2);
    var t2ms = ms(t2end);
    console.log('  ⏱️  Idő: ' + t2ms + ' ms (' + (t2ms / RECORD_COUNT).toFixed(2) + ' ms/db)');
    assert(RECORD_COUNT + ' rekord bulk beszúrva', true, RECORD_COUNT, RECORD_COUNT);

    var totalRecords = await knex(TABLE).count('* as cnt').first();
    assert('Összesen ' + (RECORD_COUNT * 2) + ' rekord van', parseInt(totalRecords.cnt) === RECORD_COUNT * 2, totalRecords.cnt, RECORD_COUNT * 2);

    // ══════════════════════════════════════════════
    // TEST 3: SELECT * (getAll)
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 3: SELECT * — összes rekord (' + (RECORD_COUNT * 2) + ' db)');
    console.log('══════════════════════════════════════════════════════════════════');

    var t3 = process.hrtime();
    var allRecords = await knex(TABLE).select('*');
    var t3end = process.hrtime(t3);
    var t3ms = ms(t3end);
    console.log('  ⏱️  Idő: ' + t3ms + ' ms');
    assert('Összes rekord betöltve: ' + allRecords.length, allRecords.length === RECORD_COUNT * 2, allRecords.length, RECORD_COUNT * 2);

    // ══════════════════════════════════════════════
    // TEST 4: SELECT WHERE name = ?
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 4: SELECT WHERE name = ? (findOne)');
    console.log('══════════════════════════════════════════════════════════════════');

    var t4 = process.hrtime();
    var found = await knex(TABLE).where({ name: 'user_0050' }).first();
    var t4end = process.hrtime(t4);
    var t4ms = ms(t4end);
    console.log('  ⏱️  Idő: ' + t4ms + ' ms');
    assert('user_0050 megtalálva', found != null && found.name === 'user_0050', found ? found.name : null, 'user_0050');

    // ══════════════════════════════════════════════
    // TEST 5: SELECT WHERE GUID = ?
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 5: SELECT WHERE GUID = ?');
    console.log('══════════════════════════════════════════════════════════════════');

    var targetGUID = found.GUID;
    var t5 = process.hrtime();
    var foundByGUID = await knex(TABLE).where({ GUID: targetGUID }).first();
    var t5end = process.hrtime(t5);
    var t5ms = ms(t5end);
    console.log('  ⏱️  Idő: ' + t5ms + ' ms');
    assert('Megtalálva GUID alapján', foundByGUID != null, !!foundByGUID, true);
    assert('Helyes rekord', foundByGUID.name === 'user_0050', foundByGUID.name, 'user_0050');

    // ══════════════════════════════════════════════
    // TEST 6: SELECT WHERE language = ? (összes)
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 6: SELECT WHERE language = "hu" (összes magyar)');
    console.log('══════════════════════════════════════════════════════════════════');

    var t6 = process.hrtime();
    var huUsers = await knex(TABLE).where({ language: 'hu' });
    var t6end = process.hrtime(t6);
    var t6ms = ms(t6end);
    console.log('  ⏱️  Idő: ' + t6ms + ' ms');
    console.log('  📊 Magyar nyelvű felhasználók: ' + huUsers.length);
    assert('Van magyar felhasználó', huUsers.length > 0, huUsers.length, '>0');
    assert('Mindegyik magyar', huUsers.every(function(u) { return u.language === 'hu'; }), true, true);

    // ══════════════════════════════════════════════
    // TEST 7: LIKE keresés
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 7: SELECT WHERE name LIKE "user_005%"');
    console.log('══════════════════════════════════════════════════════════════════');

    var t7 = process.hrtime();
    var likeResults = await knex(TABLE).where('name', 'like', 'user_005%');
    var t7end = process.hrtime(t7);
    var t7ms = ms(t7end);
    console.log('  ⏱️  Idő: ' + t7ms + ' ms');
    console.log('  📊 Találatok: ' + likeResults.length);
    assert('10 találat (user_0050-0059)', likeResults.length === 10, likeResults.length, 10);

    // ══════════════════════════════════════════════
    // TEST 8: UPDATE egyetlen rekord
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 8: UPDATE egyetlen rekord');
    console.log('══════════════════════════════════════════════════════════════════');

    var t8 = process.hrtime();
    await knex(TABLE).where({ name: 'user_0001' }).update({
        humanName: 'UPDATED User #1',
        email: 'updated1@test.com'
    });
    var t8end = process.hrtime(t8);
    var t8ms = ms(t8end);
    console.log('  ⏱️  Idő: ' + t8ms + ' ms');

    var verifyUpdate = await knex(TABLE).where({ name: 'user_0001' }).first();
    assert('humanName frissült', verifyUpdate.humanName === 'UPDATED User #1', verifyUpdate.humanName, 'UPDATED User #1');
    assert('email frissült', verifyUpdate.email === 'updated1@test.com', verifyUpdate.email, 'updated1@test.com');

    // ══════════════════════════════════════════════
    // TEST 9: Bulk UPDATE
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 9: UPDATE WHERE language = "hu" → "hu-HU"');
    console.log('══════════════════════════════════════════════════════════════════');

    var huCountBefore = (await knex(TABLE).where({ language: 'hu' })).length;
    var t9 = process.hrtime();
    var updateCount = await knex(TABLE).where({ language: 'hu' }).update({ language: 'hu-HU' });
    var t9end = process.hrtime(t9);
    var t9ms = ms(t9end);
    console.log('  ⏱️  Idő: ' + t9ms + ' ms');
    console.log('  📊 Módosított rekordok: ' + updateCount);
    assert('Összes magyar módosítva', updateCount === huCountBefore, updateCount, huCountBefore);

    // ══════════════════════════════════════════════
    // TEST 10: DELETE egyetlen rekord
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 10: DELETE egyetlen rekord');
    console.log('══════════════════════════════════════════════════════════════════');

    var countBefore = parseInt((await knex(TABLE).count('* as cnt').first()).cnt);
    var t10 = process.hrtime();
    await knex(TABLE).where({ name: 'user_0099' }).del();
    var t10end = process.hrtime(t10);
    var t10ms = ms(t10end);
    var countAfter = parseInt((await knex(TABLE).count('* as cnt').first()).cnt);
    console.log('  ⏱️  Idő: ' + t10ms + ' ms');
    assert('Rekord törölve', countAfter === countBefore - 1, countAfter, countBefore - 1);

    // ══════════════════════════════════════════════
    // TEST 11: EXISTS (count)
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 11: EXISTS — létezik-e adott rekord');
    console.log('══════════════════════════════════════════════════════════════════');

    var t11 = process.hrtime();
    var exists = parseInt((await knex(TABLE).where({ name: 'user_0050' }).count('* as cnt').first()).cnt) > 0;
    var notExists = parseInt((await knex(TABLE).where({ name: 'user_9999' }).count('* as cnt').first()).cnt) > 0;
    var t11end = process.hrtime(t11);
    var t11ms = ms(t11end);
    console.log('  ⏱️  Idő: ' + t11ms + ' ms');
    assert('user_0050 létezik', exists === true, exists, true);
    assert('user_9999 NEM létezik', notExists === false, notExists, false);

    // ══════════════════════════════════════════════
    // TEST 12: ORDER BY + LIMIT + OFFSET (pagination)
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 12: ORDER BY name + LIMIT 5 OFFSET 10 (lapozás)');
    console.log('══════════════════════════════════════════════════════════════════');

    var t12 = process.hrtime();
    var page = await knex(TABLE).orderBy('name').offset(10).limit(5);
    var t12end = process.hrtime(t12);
    var t12ms = ms(t12end);
    console.log('  ⏱️  Idő: ' + t12ms + ' ms');
    console.log('  📊 Oldal (offset=10, limit=5): ' + page.map(function(u) { return u.name; }).join(', '));
    assert('5 rekord az oldalon', page.length === 5, page.length, 5);
    assert('Rendezett', page[0].name < page[4].name, page[0].name + '<' + page[4].name, true);

    // ══════════════════════════════════════════════
    // TEST 13: SELECT bizonyos oszlopok (projection)
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 13: SELECT name, language (projection)');
    console.log('══════════════════════════════════════════════════════════════════');

    var t13 = process.hrtime();
    var projected = await knex(TABLE).select('name', 'language').limit(5);
    var t13end = process.hrtime(t13);
    var t13ms = ms(t13end);
    console.log('  ⏱️  Idő: ' + t13ms + ' ms');
    console.log('  📊 Első 5: ' + JSON.stringify(projected));
    assert('Van name', projected[0].name != null, !!projected[0].name, true);
    assert('Van language', projected[0].language != null, !!projected[0].language, true);

    // ══════════════════════════════════════════════
    // TEST 14: GROUP BY (aggregation)
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 14: GROUP BY language (aggregation)');
    console.log('══════════════════════════════════════════════════════════════════');

    var t14 = process.hrtime();
    var agg = await knex(TABLE).select('language').count('* as count').groupBy('language').orderBy('count', 'desc');
    var t14end = process.hrtime(t14);
    var t14ms = ms(t14end);
    console.log('  ⏱️  Idő: ' + t14ms + ' ms');
    console.log('  📊 Nyelv statisztika:');
    agg.forEach(function(g) { console.log('     ' + g.language + ': ' + g.count); });
    assert('Van aggregált eredmény', agg.length > 0, agg.length, '>0');

    // ══════════════════════════════════════════════
    // TEST 15: 100x egyenkénti SELECT (READ teljesítmény)
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 15: 100x egyenkénti SELECT WHERE name = ?');
    console.log('══════════════════════════════════════════════════════════════════');

    var t15 = process.hrtime();
    for (var i = 0; i < RECORD_COUNT; i++) {
        var name = 'user_' + String(i).padStart(4, '0');
        await knex(TABLE).where({ name: name }).first();
    }
    var t15end = process.hrtime(t15);
    var t15ms = ms(t15end);
    console.log('  ⏱️  Idő: ' + t15ms + ' ms (' + (t15ms / RECORD_COUNT).toFixed(2) + ' ms/db)');
    assert(RECORD_COUNT + ' egyenkénti SELECT kész', true, true, true);

    // ══════════════════════════════════════════════
    // TEST 16: DELETE WHERE name LIKE (tömeges törlés)
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 16: DELETE WHERE name LIKE "user_01%" (tömeges törlés)');
    console.log('══════════════════════════════════════════════════════════════════');

    var countBeforeDel = parseInt((await knex(TABLE).count('* as cnt').first()).cnt);
    var t16 = process.hrtime();
    var delCount = await knex(TABLE).where('name', 'like', 'user_01%').del();
    var t16end = process.hrtime(t16);
    var t16ms = ms(t16end);
    var countAfterDel = parseInt((await knex(TABLE).count('* as cnt').first()).cnt);
    console.log('  ⏱️  Idő: ' + t16ms + ' ms');
    console.log('  📊 Törölt: ' + delCount + ', Maradt: ' + countAfterDel);
    assert('Rekordok törölve', delCount > 0, delCount, '>0');
    assert('Összeg stimmel', countAfterDel === countBeforeDel - delCount, countAfterDel, countBeforeDel - delCount);

    // ══════════════════════════════════════════════
    // ÖSSZESÍTÉS
    // ══════════════════════════════════════════════
    console.log('\n\n══════════════════════════════════════════════════════════════════');
    console.log('📊 MySQL TELJESÍTMÉNY ÖSSZESÍTÉS');
    console.log('══════════════════════════════════════════════════════════════════');
    console.log('  Egyenkénti INSERT (' + RECORD_COUNT + ' db):     ' + t1ms + ' ms  (' + (t1ms / RECORD_COUNT).toFixed(2) + ' ms/db)');
    console.log('  Bulk INSERT (' + RECORD_COUNT + ' db):           ' + t2ms + ' ms  (' + (t2ms / RECORD_COUNT).toFixed(2) + ' ms/db)');
    console.log('  SELECT * (' + (RECORD_COUNT * 2) + ' db):            ' + t3ms + ' ms');
    console.log('  SELECT WHERE name (findOne):    ' + t4ms + ' ms');
    console.log('  SELECT WHERE GUID:              ' + t5ms + ' ms');
    console.log('  SELECT WHERE language (hu):      ' + t6ms + ' ms');
    console.log('  SELECT LIKE name:               ' + t7ms + ' ms');
    console.log('  UPDATE (egyetlen rekord):       ' + t8ms + ' ms');
    console.log('  UPDATE WHERE language:           ' + t9ms + ' ms');
    console.log('  DELETE (egyetlen rekord):        ' + t10ms + ' ms');
    console.log('  EXISTS (2x count):              ' + t11ms + ' ms');
    console.log('  ORDER BY+LIMIT+OFFSET:          ' + t12ms + ' ms');
    console.log('  SELECT projection (5 rekord):   ' + t13ms + ' ms');
    console.log('  GROUP BY (aggregation):         ' + t14ms + ' ms');
    console.log('  100x SELECT WHERE name:         ' + t15ms + ' ms  (' + (t15ms / RECORD_COUNT).toFixed(2) + ' ms/db)');
    console.log('  DELETE LIKE (tömeges):          ' + t16ms + ' ms');
    console.log('══════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('══════════════════════════════════════════════════════════════════');
    console.log('📊 TESZT ÖSSZESÍTÉS');
    console.log('══════════════════════════════════════════════════════════════════');
    console.log('   Összes teszt: ' + testCount);
    console.log('   ✅ Sikeres:   ' + passCount);
    console.log('   ❌ Sikertelen: ' + failCount);
    console.log('══════════════════════════════════════════════════════════════════');

    await knex.destroy();
    process.exit(failCount > 0 ? 1 : 0);
}

runTests().catch(function(e) { console.error('💥 Hiba:', e); process.exit(1); });
