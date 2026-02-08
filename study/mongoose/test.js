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

async function runTests() {

    await mongoose.connect('mongodb://localhost:27017/ac4y');
    console.log('🚀 Mongoose Study - TranslateUser Objektum Perzisztencia');
    console.log('══════════════════════════════════════════════\n');

    // Tiszta lap
    await TranslateUser.deleteMany({});

    // ══════════════════════════════════════════════
    // TEST 1: Plain object — save & load
    // ══════════════════════════════════════════════
    console.log('TEST 1: Plain object save & load');

    var plain = new TranslateUser({ name: 'plain.user', humanName: 'Plain User', language: 'hu', password: '1' });

    console.log('\n  📤 Mentés előtt (JS objektum):');
    console.log('  ' + JSON.stringify(plain.toObject(), null, 4).split('\n').join('\n  '));

    await plain.save();

    console.log('\n  📥 Visszatöltés DB-ből:');
    var loaded = await TranslateUser.findOne({ name: 'plain.user' });
    console.log('  ' + JSON.stringify(loaded.toObject(), null, 4).split('\n').join('\n  '));

    assert('Mentve és visszatöltve', loaded != null, loaded, 'not null');
    assert('name megegyezik', loaded.name === 'plain.user', loaded.name, 'plain.user');
    assert('humanName megegyezik', loaded.humanName === 'Plain User', loaded.humanName, 'Plain User');

    // ══════════════════════════════════════════════
    // TEST 2: ac4yIdentification-NEL — A LÉNYEG!
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════');
    console.log('TEST 2: Objektum ac4yIdentification-nel (java kliens szimulálása)');
    console.log('══════════════════════════════════════════════');

    var nativeObj = {
        name: 'native.user',
        password: '1',
        humanName: 'Native User',
        language: 'en',
        GUID: 'abc-123-def-456',
        ac4yIdentification: {
            GUID: 'abc-123-def-456',
            createdAt: 1770000000000,
            template: {
                GUID: 'template-789',
                createdAt: 1770000000000,
                humanId: 'TranslateUser'
            }
        }
    };

    var native = new TranslateUser(nativeObj);

    console.log('\n  📤 Mentés előtt (teljes objektum ac4yIdentification-nel):');
    console.log('  ' + JSON.stringify(native.toObject(), null, 4).split('\n').join('\n  '));

    await native.save();
    console.log('\n  💾 save() — NINCS HIBA! Egyszerűen lement.');

    console.log('\n  📥 Visszatöltés DB-ből:');
    var loadedNative = await TranslateUser.findOne({ name: 'native.user' });
    console.log('  ' + JSON.stringify(loadedNative.toObject(), null, 4).split('\n').join('\n  '));

    assert('Mentve sikeresen', loadedNative != null, loadedNative, 'not null');
    assert('name megvan', loadedNative.name === 'native.user', loadedNative.name, 'native.user');
    assert('ac4yIdentification MEGVAN', loadedNative.ac4yIdentification != null, loadedNative.ac4yIdentification, 'not null');
    assert('ac4yIdentification.GUID megvan', loadedNative.ac4yIdentification && loadedNative.ac4yIdentification.GUID === 'abc-123-def-456', loadedNative.ac4yIdentification ? loadedNative.ac4yIdentification.GUID : null, 'abc-123-def-456');
    assert('ac4yIdentification.template.humanId megvan', loadedNative.ac4yIdentification && loadedNative.ac4yIdentification.template && loadedNative.ac4yIdentification.template.humanId === 'TranslateUser', loadedNative.ac4yIdentification ? loadedNative.ac4yIdentification.template.humanId : null, 'TranslateUser');

    // ══════════════════════════════════════════════
    // TEST 3: Keresés az ac4yIdentification mezőiben
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════');
    console.log('TEST 3: Keresés beágyazott ac4yIdentification mezőiben');
    console.log('══════════════════════════════════════════════');

    var foundByGUID = await TranslateUser.findOne({ 'ac4yIdentification.GUID': 'abc-123-def-456' });
    assert('Keresés ac4yIdentification.GUID alapján', foundByGUID != null, foundByGUID ? foundByGUID.name : null, 'native.user');

    var foundByTemplate = await TranslateUser.findOne({ 'ac4yIdentification.template.humanId': 'TranslateUser' });
    assert('Keresés ac4yIdentification.template.humanId alapján', foundByTemplate != null, foundByTemplate ? foundByTemplate.name : null, 'native.user');

    // ══════════════════════════════════════════════
    // TEST 4: Update — ac4yIdentification módosítása
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════');
    console.log('TEST 4: Update — ac4yIdentification módosítása');
    console.log('══════════════════════════════════════════════');

    loadedNative.set('humanName', 'Updated Native');
    loadedNative.ac4yIdentification.template.humanId = 'UpdatedTranslateUser';
    loadedNative.markModified('ac4yIdentification');
    await loadedNative.save();

    var reloaded = await TranslateUser.findOne({ name: 'native.user' });
    console.log('\n  📥 Módosítás után:');
    console.log('  ' + JSON.stringify(reloaded.toObject(), null, 4).split('\n').join('\n  '));

    assert('humanName frissült', reloaded.humanName === 'Updated Native', reloaded.humanName, 'Updated Native');
    assert('template.humanId frissült', reloaded.ac4yIdentification.template.humanId === 'UpdatedTranslateUser', reloaded.ac4yIdentification.template.humanId, 'UpdatedTranslateUser');

    // ══════════════════════════════════════════════
    // TEST 5: Tetszőleges extra mezők
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════');
    console.log('TEST 5: Tetszőleges extra mezők (schema-less)');
    console.log('══════════════════════════════════════════════');

    var freeForm = new TranslateUser({
        name: 'freeform.user',
        customField: 'bármi lehet',
        nested: { deep: { value: 42 } },
        tags: ['admin', 'translator']
    });
    await freeForm.save();

    var loadedFree = await TranslateUser.findOne({ name: 'freeform.user' });
    console.log('\n  📥 Szabad formájú objektum:');
    console.log('  ' + JSON.stringify(loadedFree.toObject(), null, 4).split('\n').join('\n  '));

    assert('customField megvan', loadedFree.customField === 'bármi lehet', loadedFree.customField, 'bármi lehet');
    assert('nested.deep.value megvan', loadedFree.nested && loadedFree.nested.deep && loadedFree.nested.deep.value === 42, loadedFree.nested ? loadedFree.nested.deep.value : null, 42);
    assert('tags tömb megvan', Array.isArray(loadedFree.tags) && loadedFree.tags.length === 2, loadedFree.tags, ['admin', 'translator']);

    // ══════════════════════════════════════════════
    // TEST 6: getAll
    // ══════════════════════════════════════════════
    console.log('\nTEST 6: getAll()');
    var all = await TranslateUser.find();
    assert('3 rekord van', all.length === 3, all.length, 3);

    // ══════════════════════════════════════════════
    // Összesítés
    // ══════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════');
    console.log('📊 ÖSSZESÍTÉS');
    console.log('══════════════════════════════════════════════');
    console.log('   Összes teszt: ' + testCount);
    console.log('   ✅ Sikeres:   ' + passCount);
    console.log('   ❌ Sikertelen: ' + failCount);
    console.log('══════════════════════════════════════════════');

    // Takarítás
    await TranslateUser.deleteMany({});
    await mongoose.disconnect();
    process.exit(failCount > 0 ? 1 : 0);
}

runTests().catch(function(e) { console.error('💥 Hiba:', e); process.exit(1); });
