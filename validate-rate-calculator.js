// Quick syntax validation for the rate calculator
const fs = require('fs');
const path = require('path');

try {
  const filePath = path.join(__dirname, 'src', 'app', 'rate-calculator', 'page.tsx');
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Basic syntax checks
  const openBraces = (content.match(/{/g) || []).length;
  const closeBraces = (content.match(/}/g) || []).length;
  const openParens = (content.match(/\(/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length;
  
  console.log('🔍 Rate Calculator Syntax Validation:');
  console.log(`📁 File: ${filePath}`);
  console.log(`📏 Length: ${content.length} characters`);
  console.log(`🔗 Braces: ${openBraces} open, ${closeBraces} close ${openBraces === closeBraces ? '✅' : '❌'}`);
  console.log(`🔗 Parentheses: ${openParens} open, ${closeParens} close ${openParens === closeParens ? '✅' : '❌'}`);
  
  // Check for common issues
  const hasExportDefault = content.includes('export default');
  const hasReturnStatement = content.includes('return (');
  const hasClosingFunction = content.match(/^}$/m);
  
  console.log(`📤 Export default: ${hasExportDefault ? '✅' : '❌'}`);
  console.log(`↩️  Return statement: ${hasReturnStatement ? '✅' : '❌'}`);
  console.log(`🔚 Function closing: ${hasClosingFunction ? '✅' : '❌'}`);
  
  if (openBraces === closeBraces && openParens === closeParens && hasExportDefault && hasReturnStatement && hasClosingFunction) {
    console.log('\n🎉 Rate Calculator appears syntactically correct!');
  } else {
    console.log('\n⚠️  There may still be syntax issues to address.');
  }
  
} catch (error) {
  console.error('❌ Error validating file:', error.message);
}
