require('dotenv').config();
var TranslateUserPrismaAdapter = require('./TranslateUserPrismaAdapter.js');

var adapter = new TranslateUserPrismaAdapter();

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

    console.log('🚀 Prisma Study - TranslateUser CRUD Tesztek');
    console.log('══════════════════════════════════════════════\n');

    // ── TEST 1: getAll ──
    console.log('TEST 1: getAll()');
    var all = await adapter.getAll();
    console.log('  📦 Visszaadott rekordok: ' + all.length);
    assert('Van eredmény', all.length > 0, all.length, '>0');
    console.log('  Első rekord kulcsok: ' + Object.keys(all[0]).join(', '));

    // ── TEST 2: getById ──
    console.log('\nTEST 2: getById(1)');
    var user = await adapter.getById(1);
    console.log('  📦 ' + JSON.stringify(user, null, 4));
    assert('Megtalálva', user != null, user, 'not null');
    assert('id === 1', user && user.id === 1, user ? user.id : null, 1);

    // ── TEST 3: getByName ──
    console.log('\nTEST 3: getByName("anna.nagy")');
    var anna = await adapter.getByName('anna.nagy');
    console.log('  📦 ' + JSON.stringify(anna, null, 4));
    assert('Megtalálva', anna != null, anna, 'not null');
    assert('humanName === "Nagy Anna"', anna && anna.humanName === 'Nagy Anna', anna ? anna.humanName : null, 'Nagy Anna');

    // ── TEST 4: existsById ──
    console.log('\nTEST 4: existsById(2) és existsById(99999)');
    var exists1 = await adapter.existsById(2);
    var exists2 = await adapter.existsById(99999);
    assert('id=2 létezik', exists1 === true, exists1, true);
    assert('id=99999 nem létezik', exists2 === false, exists2, false);

    // ── TEST 5: existsByName ──
    console.log('\nTEST 5: existsByName("john.smith") és existsByName("ghost")');
    var existsName1 = await adapter.existsByName('john.smith');
    var existsName2 = await adapter.existsByName('ghost');
    assert('john.smith létezik', existsName1 === true, existsName1, true);
    assert('ghost nem létezik', existsName2 === false, existsName2, false);

    // ── TEST 6: insert (plain object) ──
    console.log('\nTEST 6: insert() - plain object');
    var plainUser = { name: 'prisma.plain', humanName: 'Prisma Plain', language: 'hu', password: 'p1' };
    console.log('  📤 Küldött: ' + JSON.stringify(plainUser));
    var inserted = await adapter.insert(plainUser);
    console.log('  📦 DB válasz: ' + JSON.stringify(inserted, null, 4));
    assert('Beszúrva, van id', inserted && inserted.id > 0, inserted ? inserted.id : null, '>0');
    assert('name megegyezik', inserted && inserted.name === 'prisma.plain', inserted ? inserted.name : null, 'prisma.plain');
    var insertedId = inserted.id;

    // ── TEST 7: insert with ac4yIdentification (A LÉNYEG!) ──
    console.log('\n══════════════════════════════════════════════');
    console.log('TEST 7: insert() - ac4yIdentification-NEL (a java kliens szimulálása)');
    console.log('══════════════════════════════════════════════');
    var nativeUser = {
        name: 'prisma.native',
        password: '1',
        humanName: 'Prisma Native',
        language: 'en',
        ac4yIdentification: {
            GUID: 'abc-123',
            createdAt: 1770000000000,
            template: { GUID: 'def-456', createdAt: 1770000000000, humanId: 'TranslateUser' }
        }
    };
    console.log('  📤 Küldött (ac4yIdentification-nel!): ' + JSON.stringify(nativeUser));

    var nativeResult = null;
    var nativeError = null;
    try {
        nativeResult = await adapter.insert(nativeUser);
    } catch (e) {
        nativeError = e;
    }

    if (nativeResult) {
        console.log('  📦 DB válasz: ' + JSON.stringify(nativeResult, null, 4));
        assert('Beszúrva sikeresen (Prisma ignorálta az ac4yIdentification-t)', true, true, true);
    } else {
        console.log('  ❌ Hiba: ' + (nativeError.message || nativeError));
        assert('Prisma kezeli az ac4yIdentification-t', false, nativeError.message, 'sikeres insert');
    }
    var nativeId = nativeResult ? nativeResult.id : null;

    // ── TEST 8: update ──
    console.log('\nTEST 8: update()');
    if (insertedId) {
        var updated = await adapter.update(insertedId, { humanName: 'Prisma UPDATED', language: 'de' });
        console.log('  📦 ' + JSON.stringify(updated, null, 4));
        assert('humanName frissítve', updated && updated.humanName === 'Prisma UPDATED', updated ? updated.humanName : null, 'Prisma UPDATED');
        assert('language frissítve', updated && updated.language === 'de', updated ? updated.language : null, 'de');
    }

    // ── TEST 9: update with ac4yIdentification ──
    console.log('\nTEST 9: update() - ac4yIdentification-nel');
    if (insertedId) {
        var updateWithAc4y = null;
        var updateError = null;
        try {
            updateWithAc4y = await adapter.update(insertedId, {
                humanName: 'Updated with ac4y',
                ac4yIdentification: { GUID: 'xyz', createdAt: 123 }
            });
        } catch (e) {
            updateError = e;
        }

        if (updateWithAc4y) {
            console.log('  📦 ' + JSON.stringify(updateWithAc4y, null, 4));
            assert('Update sikeres (Prisma ignorálta az ac4yIdentification-t)', true, true, true);
        } else {
            console.log('  ❌ Hiba: ' + (updateError.message || updateError));
            assert('Prisma kezeli update-nél is', false, updateError.message, 'sikeres update');
        }
    }

    // ── Takarítás ──
    console.log('\nTakarítás...');
    if (insertedId) await adapter.deleteById(insertedId);
    if (nativeId) await adapter.deleteById(nativeId);
    console.log('  Teszt rekordok törölve.');

    // ── Összesítés ──
    console.log('\n══════════════════════════════════════════════');
    console.log('📊 ÖSSZESÍTÉS');
    console.log('══════════════════════════════════════════════');
    console.log('   Összes teszt: ' + testCount);
    console.log('   ✅ Sikeres:   ' + passCount);
    console.log('   ❌ Sikertelen: ' + failCount);
    console.log('══════════════════════════════════════════════');

    await adapter.disconnect();
    process.exit(failCount > 0 ? 1 : 0);
}

runTests().catch(function(e) { console.error('💥 Hiba:', e); process.exit(1); });
