import { useMultiFileAuthState } from '@whiskeysockets/baileys';

async function testBaileys() {
    console.log('🔍 Testing Baileys authentication...');
    try {
        const { state } = await useMultiFileAuthState('./test_auth');
        console.log('✅ Baileys authentication test successful!');
        console.log('State:', Object.keys(state));
    } catch (error) {
        console.error('❌ Baileys test failed:', error);
    }
}

testBaileys().catch(console.error);
