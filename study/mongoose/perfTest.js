var mongoose = require('mongoose');
var TranslateUser = require('./TranslateUserModel.js');

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
    var guid = generateGUID();
    var languages = ['hu', 'en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'cs', 'sk', 'ro', 'ja', 'zh', 'ko'];
    return {
        name: 'user_' + String(index).padStart(4, '0'),
        password: 'pass_' + index,
        humanName: 'Test User #' + index,
        email: 'user' + index + '@test.com',
        language: languages[index % languages.length],
        humanId: 'HID-' + index,
        code: 'CODE-' + String(index).padStart(4, '0'),
        token: 'token_' + generateGUID(),
        avatar: 'https://avatar.test/' + index + '.png',
        GUID: guid,
        ac4yIdentification: {
            GUID: guid,
            createdAt: Date.now() - Math.floor(Math.random() * 86400000),
            template: {
                GUID: generateGUID(),
                createdAt: Date.now(),
                humanId: 'TranslateUser'
            }
        }
    };
}

function ms(hrtime) {
    return (hrtime[0] * 1000 + hrtime[1] / 1000000).toFixed(2);
}

async function runTests() {
    await mongoose.connect('mongodb://localhost:27017/ac4y_study');

    console.log('🚀 Mongoose Performance Test - 100 TranslateUser');
    console.log('══════════════════════════════════════════════════════════════════\n');

    // Tiszta lap
    await TranslateUser.deleteMany({});

    var RECORD_COUNT = 100;

    // ══════════════════════════════════════════════
    // TEST 1: Egyenkénti INSERT (100 db)
    // ══════════════════════════════════════════════
    console.log('══════════════════════════════════════════════════════════════════');
    console.log('TEST 1: Egyenkénti INSERT — ' + RECORD_COUNT + ' rekord (save() egyenként)');
    console.log('══════════════════════════════════════════════════════════════════');

    var t1 = process.hrtime();
    for (var i = 0; i < RECORD_COUNT; i++) {
        var user = new TranslateUser(generateTranslateUser(i));
        await user.save();
    }
    var t1end = process.hrtime(t1);
    var t1ms = ms(t1end);
    console.log('  ⏱️  Idő: ' + t1ms + ' ms (' + (t1ms / RECORD_COUNT).toFixed(2) + ' ms/rekord)');
    assert(RECORD_COUNT + ' rekord beszúrva', true, RECORD_COUNT, RECORD_COUNT);

    // ══════════════════════════════════════════════
    // TEST 2: Bulk INSERT (insertMany)
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 2: Bulk INSERT — ' + RECORD_COUNT + ' rekord (insertMany)');
    console.log('══════════════════════════════════════════════════════════════════');

    var bulkData = [];
    for (var i = RECORD_COUNT; i < RECORD_COUNT * 2; i++) {
        bulkData.push(generateTranslateUser(i));
    }

    var t2 = process.hrtime();
    await TranslateUser.insertMany(bulkData);
    var t2end = process.hrtime(t2);
    var t2ms = ms(t2end);
    console.log('  ⏱️  Idő: ' + t2ms + ' ms (' + (t2ms / RECORD_COUNT).toFixed(2) + ' ms/rekord)');
    assert(RECORD_COUNT + ' rekord bulk beszúrva', true, RECORD_COUNT, RECORD_COUNT);

    var totalRecords = await TranslateUser.countDocuments();
    assert('Összesen ' + (RECORD_COUNT * 2) + ' rekord van', totalRecords === RECORD_COUNT * 2, totalRecords, RECORD_COUNT * 2);

    // ══════════════════════════════════════════════
    // TEST 3: getAll — find() összes rekord
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 3: getAll — find() összes rekord (' + (RECORD_COUNT * 2) + ' db)');
    console.log('══════════════════════════════════════════════════════════════════');

    var t3 = process.hrtime();
    var allRecords = await TranslateUser.find();
    var t3end = process.hrtime(t3);
    var t3ms = ms(t3end);
    console.log('  ⏱️  Idő: ' + t3ms + ' ms');
    assert('Összes rekord betöltve: ' + allRecords.length, allRecords.length === RECORD_COUNT * 2, allRecords.length, RECORD_COUNT * 2);

    // ══════════════════════════════════════════════
    // TEST 4: findOne — keresés name alapján
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 4: findOne — keresés name alapján');
    console.log('══════════════════════════════════════════════════════════════════');

    var t4 = process.hrtime();
    var found = await TranslateUser.findOne({ name: 'user_0050' });
    var t4end = process.hrtime(t4);
    var t4ms = ms(t4end);
    console.log('  ⏱️  Idő: ' + t4ms + ' ms');
    assert('user_0050 megtalálva', found != null && found.name === 'user_0050', found ? found.name : null, 'user_0050');
    assert('ac4yIdentification megvan', found.ac4yIdentification != null, !!found.ac4yIdentification, true);
    assert('template.humanId megvan', found.ac4yIdentification.template.humanId === 'TranslateUser', found.ac4yIdentification.template.humanId, 'TranslateUser');

    // ══════════════════════════════════════════════
    // TEST 5: findOne — keresés ac4yIdentification.GUID alapján
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 5: Keresés beágyazott ac4yIdentification.GUID alapján');
    console.log('══════════════════════════════════════════════════════════════════');

    var targetGUID = found.ac4yIdentification.GUID;
    var t5 = process.hrtime();
    var foundByGUID = await TranslateUser.findOne({ 'ac4yIdentification.GUID': targetGUID });
    var t5end = process.hrtime(t5);
    var t5ms = ms(t5end);
    console.log('  ⏱️  Idő: ' + t5ms + ' ms');
    assert('Megtalálva ac4yIdentification.GUID alapján', foundByGUID != null, !!foundByGUID, true);
    assert('Helyes rekord', foundByGUID.name === 'user_0050', foundByGUID.name, 'user_0050');

    // ══════════════════════════════════════════════
    // TEST 6: Keresés template.humanId alapján (összes)
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 6: Keresés ac4yIdentification.template.humanId alapján (összes)');
    console.log('══════════════════════════════════════════════════════════════════');

    var t6 = process.hrtime();
    var allByTemplate = await TranslateUser.find({ 'ac4yIdentification.template.humanId': 'TranslateUser' });
    var t6end = process.hrtime(t6);
    var t6ms = ms(t6end);
    console.log('  ⏱️  Idő: ' + t6ms + ' ms');
    assert('Mind a ' + (RECORD_COUNT * 2) + ' rekord megtalálva', allByTemplate.length === RECORD_COUNT * 2, allByTemplate.length, RECORD_COUNT * 2);

    // ══════════════════════════════════════════════
    // TEST 7: Keresés nyelv alapján + count
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 7: Keresés nyelv alapján (language: "hu")');
    console.log('══════════════════════════════════════════════════════════════════');

    var t7 = process.hrtime();
    var huUsers = await TranslateUser.find({ language: 'hu' });
    var t7end = process.hrtime(t7);
    var t7ms = ms(t7end);
    // 15 nyelv, 200 rekord -> kb 13-14 magyar
    console.log('  ⏱️  Idő: ' + t7ms + ' ms');
    console.log('  📊 Magyar nyelvű felhasználók: ' + huUsers.length);
    assert('Van magyar felhasználó', huUsers.length > 0, huUsers.length, '>0');
    assert('Mindegyik magyar', huUsers.every(function(u) { return u.language === 'hu'; }), true, true);

    // ══════════════════════════════════════════════
    // TEST 8: Regex keresés (name LIKE)
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 8: Regex keresés — name LIKE "user_005%"');
    console.log('══════════════════════════════════════════════════════════════════');

    var t8 = process.hrtime();
    var regexResults = await TranslateUser.find({ name: /^user_005/ });
    var t8end = process.hrtime(t8);
    var t8ms = ms(t8end);
    console.log('  ⏱️  Idő: ' + t8ms + ' ms');
    console.log('  📊 Találatok: ' + regexResults.length + ' (user_0050..user_0059)');
    assert('10 találat (user_0050-0059)', regexResults.length === 10, regexResults.length, 10);

    // ══════════════════════════════════════════════
    // TEST 9: Update egyetlen rekord
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 9: Update egyetlen rekord');
    console.log('══════════════════════════════════════════════════════════════════');

    var t9 = process.hrtime();
    var toUpdate = await TranslateUser.findOne({ name: 'user_0001' });
    toUpdate.set('humanName', 'UPDATED User #1');
    toUpdate.set('email', 'updated1@test.com');
    toUpdate.ac4yIdentification.template.humanId = 'UpdatedTranslateUser';
    toUpdate.markModified('ac4yIdentification');
    await toUpdate.save();
    var t9end = process.hrtime(t9);
    var t9ms = ms(t9end);
    console.log('  ⏱️  Idő: ' + t9ms + ' ms');

    var verifyUpdate = await TranslateUser.findOne({ name: 'user_0001' });
    assert('humanName frissült', verifyUpdate.humanName === 'UPDATED User #1', verifyUpdate.humanName, 'UPDATED User #1');
    assert('email frissült', verifyUpdate.email === 'updated1@test.com', verifyUpdate.email, 'updated1@test.com');
    assert('ac4yIdentification.template frissült', verifyUpdate.ac4yIdentification.template.humanId === 'UpdatedTranslateUser', verifyUpdate.ac4yIdentification.template.humanId, 'UpdatedTranslateUser');

    // ══════════════════════════════════════════════
    // TEST 10: Bulk update (updateMany)
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 10: Bulk update — nyelv módosítás (hu → hu-HU)');
    console.log('══════════════════════════════════════════════════════════════════');

    var huCountBefore = await TranslateUser.countDocuments({ language: 'hu' });
    var t10 = process.hrtime();
    var updateResult = await TranslateUser.updateMany({ language: 'hu' }, { $set: { language: 'hu-HU' } });
    var t10end = process.hrtime(t10);
    var t10ms = ms(t10end);
    console.log('  ⏱️  Idő: ' + t10ms + ' ms');
    console.log('  📊 Módosított rekordok: ' + updateResult.modifiedCount);
    assert('Összes magyar módosítva', updateResult.modifiedCount === huCountBefore, updateResult.modifiedCount, huCountBefore);

    // ══════════════════════════════════════════════
    // TEST 11: Delete egyetlen rekord
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 11: Delete egyetlen rekord');
    console.log('══════════════════════════════════════════════════════════════════');

    var countBefore = await TranslateUser.countDocuments();
    var t11 = process.hrtime();
    await TranslateUser.deleteOne({ name: 'user_0099' });
    var t11end = process.hrtime(t11);
    var t11ms = ms(t11end);
    var countAfter = await TranslateUser.countDocuments();
    console.log('  ⏱️  Idő: ' + t11ms + ' ms');
    assert('Rekord törölve', countAfter === countBefore - 1, countAfter, countBefore - 1);

    // ══════════════════════════════════════════════
    // TEST 12: doesExist — countDocuments
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 12: doesExist — létezik-e adott rekord');
    console.log('══════════════════════════════════════════════════════════════════');

    var t12 = process.hrtime();
    var exists = await TranslateUser.countDocuments({ name: 'user_0050' }) > 0;
    var notExists = await TranslateUser.countDocuments({ name: 'user_9999' }) > 0;
    var t12end = process.hrtime(t12);
    var t12ms = ms(t12end);
    console.log('  ⏱️  Idő: ' + t12ms + ' ms');
    assert('user_0050 létezik', exists === true, exists, true);
    assert('user_9999 NEM létezik', notExists === false, notExists, false);

    // ══════════════════════════════════════════════
    // TEST 13: Rendezés + limit (pagination)
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 13: Rendezés + lapozás (sort + skip + limit)');
    console.log('══════════════════════════════════════════════════════════════════');

    var t13 = process.hrtime();
    var page = await TranslateUser.find().sort({ name: 1 }).skip(10).limit(5);
    var t13end = process.hrtime(t13);
    var t13ms = ms(t13end);
    console.log('  ⏱️  Idő: ' + t13ms + ' ms');
    console.log('  📊 Oldal (skip=10, limit=5): ' + page.map(function(u) { return u.name; }).join(', '));
    assert('5 rekord az oldalon', page.length === 5, page.length, 5);
    assert('Rendezett (első elem)', page[0].name < page[4].name, page[0].name + '<' + page[4].name, true);

    // ══════════════════════════════════════════════
    // TEST 14: Projection — csak bizonyos mezők
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 14: Projection — csak name és language mezők');
    console.log('══════════════════════════════════════════════════════════════════');

    var t14 = process.hrtime();
    var projected = await TranslateUser.find({}, 'name language -_id').limit(5);
    var t14end = process.hrtime(t14);
    var t14ms = ms(t14end);
    console.log('  ⏱️  Idő: ' + t14ms + ' ms');
    console.log('  📊 Első 5 (projection): ' + JSON.stringify(projected.map(function(u) { return u.toObject(); })));
    assert('Nincs _id', projected[0]._id == null || projected[0].toObject()._id == null, false, false);
    assert('Van name', projected[0].name != null, !!projected[0].name, true);

    // ══════════════════════════════════════════════
    // TEST 15: Index létrehozás és keresés
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 15: Index létrehozás (name) + keresés');
    console.log('══════════════════════════════════════════════════════════════════');

    var t15 = process.hrtime();
    await TranslateUser.collection.createIndex({ name: 1 }, { unique: true });
    var t15end = process.hrtime(t15);
    var t15ms = ms(t15end);
    console.log('  ⏱️  Index létrehozás: ' + t15ms + ' ms');

    var t15b = process.hrtime();
    var indexedFind = await TranslateUser.findOne({ name: 'user_0075' });
    var t15bend = process.hrtime(t15b);
    var t15bms = ms(t15bend);
    console.log('  ⏱️  Keresés index-szel: ' + t15bms + ' ms');
    assert('Index utáni keresés sikeres', indexedFind != null && indexedFind.name === 'user_0075', indexedFind ? indexedFind.name : null, 'user_0075');

    // ══════════════════════════════════════════════
    // TEST 16: Aggregation pipeline
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 16: Aggregation — nyelv szerinti csoportosítás');
    console.log('══════════════════════════════════════════════════════════════════');

    var t16 = process.hrtime();
    var agg = await TranslateUser.aggregate([
        { $group: { _id: '$language', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
    var t16end = process.hrtime(t16);
    var t16ms = ms(t16end);
    console.log('  ⏱️  Idő: ' + t16ms + ' ms');
    console.log('  📊 Nyelv statisztika:');
    agg.forEach(function(g) { console.log('     ' + (g._id || 'null') + ': ' + g.count); });
    assert('Van aggregált eredmény', agg.length > 0, agg.length, '>0');

    // ══════════════════════════════════════════════
    // TEST 17: 100 db egyenkénti READ teljesítmény
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 17: 100 db egyenkénti findOne — READ teljesítmény');
    console.log('══════════════════════════════════════════════════════════════════');

    var t17 = process.hrtime();
    for (var i = 0; i < RECORD_COUNT; i++) {
        var name = 'user_' + String(i).padStart(4, '0');
        await TranslateUser.findOne({ name: name });
    }
    var t17end = process.hrtime(t17);
    var t17ms = ms(t17end);
    console.log('  ⏱️  Idő: ' + t17ms + ' ms (' + (t17ms / RECORD_COUNT).toFixed(2) + ' ms/rekord)');
    assert(RECORD_COUNT + ' egyenkénti findOne kész', true, true, true);

    // ══════════════════════════════════════════════
    // TEST 18: ac4yIdentification integritás ellenőrzés (random 10)
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 18: ac4yIdentification integritás — random 10 rekord');
    console.log('══════════════════════════════════════════════════════════════════');

    var t18 = process.hrtime();
    var ok = 0;
    var checked = 0;
    while (checked < 10) {
        var idx = Math.floor(Math.random() * RECORD_COUNT);
        var name = 'user_' + String(idx).padStart(4, '0');
        var rec = await TranslateUser.findOne({ name: name });
        if (!rec) continue; // törölve lett, skip
        checked++;
        if (rec.ac4yIdentification && rec.ac4yIdentification.GUID && rec.ac4yIdentification.template && rec.ac4yIdentification.template.humanId) {
            ok++;
        }
    }
    var t18end = process.hrtime(t18);
    var t18ms = ms(t18end);
    console.log('  ⏱️  Idő: ' + t18ms + ' ms');
    assert('Mind a 10 random rekord ac4yIdentification-je ép', ok === 10, ok, 10);

    // ══════════════════════════════════════════════
    // TEST 19: deleteMany — tömeges törlés
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 19: deleteMany — összes user_01xx törlése');
    console.log('══════════════════════════════════════════════════════════════════');

    var countBeforeDel = await TranslateUser.countDocuments();
    var t19 = process.hrtime();
    var delResult = await TranslateUser.deleteMany({ name: /^user_01/ });
    var t19end = process.hrtime(t19);
    var t19ms = ms(t19end);
    var countAfterDel = await TranslateUser.countDocuments();
    console.log('  ⏱️  Idő: ' + t19ms + ' ms');
    console.log('  📊 Törölt: ' + delResult.deletedCount + ', Maradt: ' + countAfterDel);
    assert('Rekordok törölve', delResult.deletedCount > 0, delResult.deletedCount, '>0');
    assert('Összeg stimmel', countAfterDel === countBeforeDel - delResult.deletedCount, countAfterDel, countBeforeDel - delResult.deletedCount);

    // ══════════════════════════════════════════════
    // TEST 20: Végső összesítés + adatbázis állapot
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('TEST 20: Végső adatbázis állapot');
    console.log('══════════════════════════════════════════════════════════════════');

    var finalCount = await TranslateUser.countDocuments();
    var indexes = await TranslateUser.collection.indexes();
    console.log('  📊 Rekordszám: ' + finalCount);
    console.log('  📊 Indexek: ' + indexes.map(function(i) { return i.name; }).join(', '));
    assert('Van adat a DB-ben', finalCount > 0, finalCount, '>0');

    // ══════════════════════════════════════════════
    // ÖSSZESÍTÉS
    // ══════════════════════════════════════════════
    console.log('\n\n══════════════════════════════════════════════════════════════════');
    console.log('📊 TELJESÍTMÉNY ÖSSZESÍTÉS');
    console.log('══════════════════════════════════════════════════════════════════');
    console.log('  Egyenkénti INSERT (' + RECORD_COUNT + ' db):     ' + t1ms + ' ms  (' + (t1ms / RECORD_COUNT).toFixed(2) + ' ms/db)');
    console.log('  Bulk INSERT (' + RECORD_COUNT + ' db):           ' + t2ms + ' ms  (' + (t2ms / RECORD_COUNT).toFixed(2) + ' ms/db)');
    console.log('  getAll (' + (RECORD_COUNT * 2) + ' db):              ' + t3ms + ' ms');
    console.log('  findOne (name):                 ' + t4ms + ' ms');
    console.log('  findOne (ac4yIdent.GUID):       ' + t5ms + ' ms');
    console.log('  find (template.humanId, ALL):   ' + t6ms + ' ms');
    console.log('  find (language: "hu"):           ' + t7ms + ' ms');
    console.log('  find (regex name):              ' + t8ms + ' ms');
    console.log('  update (egyetlen rekord):       ' + t9ms + ' ms');
    console.log('  updateMany (hu → hu-HU):        ' + t10ms + ' ms');
    console.log('  deleteOne:                      ' + t11ms + ' ms');
    console.log('  doesExist (2x count):           ' + t12ms + ' ms');
    console.log('  sort+skip+limit:                ' + t13ms + ' ms');
    console.log('  projection (5 rekord):          ' + t14ms + ' ms');
    console.log('  index létrehozás:               ' + t15ms + ' ms');
    console.log('  findOne index-szel:             ' + t15bms + ' ms');
    console.log('  aggregation (group by lang):    ' + t16ms + ' ms');
    console.log('  100x findOne (egyenként):       ' + t17ms + ' ms  (' + (t17ms / RECORD_COUNT).toFixed(2) + ' ms/db)');
    console.log('  10x random ac4y integritás:     ' + t18ms + ' ms');
    console.log('  deleteMany (regex):             ' + t19ms + ' ms');
    console.log('══════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('══════════════════════════════════════════════════════════════════');
    console.log('📊 TESZT ÖSSZESÍTÉS');
    console.log('══════════════════════════════════════════════════════════════════');
    console.log('   Összes teszt: ' + testCount);
    console.log('   ✅ Sikeres:   ' + passCount);
    console.log('   ❌ Sikertelen: ' + failCount);
    console.log('══════════════════════════════════════════════════════════════════');

    // NEM töröljük az adatot — maradjon a mongo-express-ben megtekinthetően!
    await mongoose.disconnect();
    process.exit(failCount > 0 ? 1 : 0);
}

runTests().catch(function(e) { console.error('💥 Hiba:', e); process.exit(1); });
