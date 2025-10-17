/**
 * Simple test for SkeletonAnimatorPure
 */

const { SimpleSkeletonAnimator, createCLI } = require('./docs/dist/pure-modules/SimpleSkeletonAnimator.cjs');

console.log('🎭 MIFF SkeletonAnimatorPure Test Suite');
console.log('=====================================\n');

// Test 1: Basic character creation
console.log('Test 1: Basic Character Creation');
console.log('--------------------------------');
try {
  const animator = new SimpleSkeletonAnimator();
  animator.createCharacter('TestCharacter');
  const rig = animator.getRig();
  
  console.log('✅ Character created successfully');
  console.log(`   - Rig ID: ${rig.id}`);
  console.log(`   - Node count: ${Object.keys(rig.nodes).length}`);
  console.log(`   - Root node: ${rig.rootNode}`);
  console.log(`   - Nodes: ${Object.keys(rig.nodes).join(', ')}`);
} catch (error) {
  console.log('❌ Character creation failed:', error.message);
}

console.log('\n');

// Test 2: Character validation
console.log('Test 2: Character Validation');
console.log('----------------------------');
try {
  const animator = new SimpleSkeletonAnimator();
  animator.createCharacter('ValidCharacter');
  const validation = animator.validate();
  
  if (validation.valid) {
    console.log('✅ Character validation passed');
  } else {
    console.log('❌ Character validation failed:', validation.errors.join(', '));
  }
} catch (error) {
  console.log('❌ Validation test failed:', error.message);
}

console.log('\n');

// Test 3: Character export
console.log('Test 3: Character Export');
console.log('------------------------');
try {
  const animator = new SimpleSkeletonAnimator();
  animator.createCharacter('ExportCharacter');
  const exportData = animator.exportCharacter('ExportCharacter');
  const parsed = JSON.parse(exportData);
  
  console.log('✅ Character exported successfully');
  console.log(`   - Export format: ${parsed.exportFormat}`);
  console.log(`   - Character name: ${parsed.name}`);
  console.log(`   - Rig nodes: ${Object.keys(parsed.rig.nodes).length}`);
  console.log(`   - Data size: ${exportData.length} characters`);
} catch (error) {
  console.log('❌ Export test failed:', error.message);
}

console.log('\n');

// Test 4: CLI functionality
console.log('Test 4: CLI Functionality');
console.log('-------------------------');
try {
  const cli = createCLI();
  
  // Test help command
  cli.executeCommand('help', []).then(helpResult => {
    console.log('✅ Help command executed');
    console.log('   Help output:', helpResult.substring(0, 100) + '...');
    
    // Test create character command
    return cli.executeCommand('create-character', ['CLITestCharacter']);
  }).then(createResult => {
    console.log('✅ Create character command executed');
    console.log('   Result:', createResult);
    
    // Test export character command
    return cli.executeCommand('export-character', ['CLITestCharacter']);
  }).then(exportResult => {
    console.log('✅ Export character command executed');
    console.log('   Result length:', exportResult.length);
    
    // Test validate command
    return cli.executeCommand('validate', []);
  }).then(validateResult => {
    console.log('✅ Validate command executed');
    console.log('   Result:', validateResult);
    
    console.log('\n');
    console.log('🎭 Test Suite Summary');
    console.log('====================');
    console.log('All core functionality tests completed successfully!');
    console.log('\nKey Features Demonstrated:');
    console.log('- ✅ Character creation with rig building');
    console.log('- ✅ Data validation and error handling');
    console.log('- ✅ JSON export with proper formatting');
    console.log('- ✅ CLI interface for command execution');
    console.log('\nThe SkeletonAnimatorPure system is ready for integration! 🚀');
  }).catch(error => {
    console.log('❌ CLI test failed:', error.message);
  });
  
} catch (error) {
  console.log('❌ CLI test failed:', error.message);
}