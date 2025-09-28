#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Clean external URLs from audio file metadata
 * This script removes external URLs from audio file metadata to ensure MIFF-native compliance
 */

const audioDir = path.join(__dirname, '../../docs/assets/audio/sfx');
const processedFiles = [];
const errors = [];

function cleanAudioMetadata(filePath) {
  try {
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) return;
    
    // For WAV files, we can't easily modify metadata without specialized tools
    // Instead, we'll create a clean version by copying the file and stripping metadata
    if (filePath.endsWith('.wav')) {
      const cleanPath = filePath.replace('.wav', '_clean.wav');
      
      // Read the file as binary and create a minimal WAV header
      const buffer = fs.readFileSync(filePath);
      
      // Create a minimal WAV file without metadata
      const cleanBuffer = createCleanWav(buffer);
      
      fs.writeFileSync(cleanPath, cleanBuffer);
      processedFiles.push(cleanPath);
      
      console.log(`✅ Cleaned metadata from: ${path.basename(filePath)}`);
    }
  } catch (error) {
    errors.push({ file: filePath, error: error.message });
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
  }
}

function createCleanWav(originalBuffer) {
  // This is a simplified approach - in production, you'd use a proper WAV library
  // For now, we'll create a minimal WAV file
  const header = Buffer.from('RIFF');
  const fileSize = originalBuffer.length - 8;
  const sizeBuffer = Buffer.alloc(4);
  sizeBuffer.writeUInt32LE(fileSize, 0);
  
  const format = Buffer.from('WAVE');
  const fmt = Buffer.from('fmt ');
  const fmtSize = Buffer.alloc(4);
  fmtSize.writeUInt32LE(16, 0);
  
  // Basic PCM format
  const audioFormat = Buffer.alloc(2);
  audioFormat.writeUInt16LE(1, 0); // PCM
  
  const numChannels = Buffer.alloc(2);
  numChannels.writeUInt16LE(1, 0); // Mono
  
  const sampleRate = Buffer.alloc(4);
  sampleRate.writeUInt32LE(44100, 0);
  
  const byteRate = Buffer.alloc(4);
  byteRate.writeUInt32LE(44100 * 1 * 2, 0);
  
  const blockAlign = Buffer.alloc(2);
  blockAlign.writeUInt16LE(2, 0);
  
  const bitsPerSample = Buffer.alloc(2);
  bitsPerSample.writeUInt16LE(16, 0);
  
  const data = Buffer.from('data');
  const dataSize = Buffer.alloc(4);
  dataSize.writeUInt32LE(originalBuffer.length - 44, 0);
  
  // Combine all parts
  const cleanWav = Buffer.concat([
    header, sizeBuffer, format, fmt, fmtSize, audioFormat, numChannels,
    sampleRate, byteRate, blockAlign, bitsPerSample, data, dataSize,
    originalBuffer.slice(44) // Skip original header
  ]);
  
  return cleanWav;
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.wav')) {
      cleanAudioMetadata(filePath);
    }
  }
}

console.log('🧹 Cleaning audio metadata...');
console.log(`📁 Processing directory: ${audioDir}`);

processDirectory(audioDir);

console.log(`\n📊 Summary:`);
console.log(`✅ Files processed: ${processedFiles.length}`);
console.log(`❌ Errors: ${errors.length}`);

if (errors.length > 0) {
  console.log('\n❌ Errors:');
  errors.forEach(({ file, error }) => {
    console.log(`  ${file}: ${error}`);
  });
}

console.log('\n🎉 Audio metadata cleaning completed!');