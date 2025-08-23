#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const lic = fs.existsSync(path.resolve('LICENSE.md'));
const attribMod = fs.existsSync(path.resolve('MiffAttributionPure'));
let ok = true;
if(!lic){ console.log('⚠️ LICENSE.md missing (dual license expected)'); ok=false; }
if(!attribMod){ console.log('⚠️ MiffAttributionPure module missing'); ok=false; }
if(ok) console.log('✅ Attribution and license present');
process.exit(0);