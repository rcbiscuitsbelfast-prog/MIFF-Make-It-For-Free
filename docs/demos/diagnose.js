// Diagnostic script to check file accessibility and MIME types
// Run this in the browser console or as a script tag

async function diagnoseToppler() {
    console.log('🔍 Toppler Diagnosis Starting...');
    
    const files = [
        './dist/index.js',
        './dist/bundle.js',
        './dist/TopplerScene.js',
        './dist/src/bootstrap/GameBootstrap.js',
        './dist/src/bootstrap/ResourceLoader.js'
    ];
    
    const results = [];
    
    for (const file of files) {
        try {
            console.log(`📁 Checking ${file}...`);
            
            const response = await fetch(file, { method: 'HEAD' });
            
            const result = {
                file,
                status: response.status,
                statusText: response.statusText,
                contentType: response.headers.get('content-type'),
                accessible: response.ok
            };
            
            results.push(result);
            
            if (response.ok) {
                console.log(`✅ ${file} - ${response.status} (${result.contentType})`);
            } else {
                console.log(`❌ ${file} - ${response.status} ${response.statusText}`);
            }
            
        } catch (error) {
            console.log(`❌ ${file} - Error: ${error.message}`);
            results.push({
                file,
                error: error.message,
                accessible: false
            });
        }
    }
    
    console.log('\n📊 Summary:');
    console.table(results);
    
    // Test module import
    console.log('\n🧪 Testing module import...');
    try {
        const module = await import('./dist/bundle.js');
        console.log('✅ Bundle module imported successfully');
    } catch (error) {
        console.log('❌ Bundle module import failed:', error.message);
    }
    
    // Check if TopplerStandalone is available
    if (window.TopplerStandalone) {
        console.log('✅ TopplerStandalone found in window object');
    } else {
        console.log('❌ TopplerStandalone not found in window object');
    }
    
    return results;
}

// Auto-run if this script is loaded
if (typeof window !== 'undefined') {
    window.diagnoseToppler = diagnoseToppler;
    console.log('🔧 Toppler diagnosis available as window.diagnoseToppler()');
    
    // Auto-run after a short delay
    setTimeout(() => {
        console.log('🚀 Auto-running diagnosis...');
        diagnoseToppler();
    }, 1000);
}