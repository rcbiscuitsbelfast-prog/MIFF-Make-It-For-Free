/**
 * Shared Export Utilities for Pure Modules
 * 
 * This module provides standardized export functionality across all Pure modules.
 * It supports JSON, CSV, Markdown, and HTML export formats.
 * 
 * @module exportUtils
 * @version 1.0.0
 * @license MIT
 */

export type ExportFormat = 'json' | 'csv' | 'markdown' | 'html';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  includeTimestamp?: boolean;
  title?: string;
  description?: string;
}

/**
 * Standardized export function for any data structure
 */
export function exportDataToFormat(data: any, options: ExportOptions): string {
  switch (options.format) {
    case 'json':
      return exportToJSON(data, options);
    case 'csv':
      return exportToCSV(data, options);
    case 'markdown':
      return exportToMarkdown(data, options);
    case 'html':
      return exportToHTML(data, options);
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

/**
 * Export data as JSON
 */
function exportToJSON(data: any, options: ExportOptions): string {
  const exportData = {
    ...(options.includeMetadata && {
      metadata: {
        exportedAt: new Date().toISOString(),
        format: 'json',
        version: '1.0'
      }
    }),
    data
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Export data as CSV
 */
function exportToCSV(data: any, options: ExportOptions): string {
  if (Array.isArray(data)) {
    return exportArrayToCSV(data, options);
  } else if (typeof data === 'object' && data !== null) {
    return exportObjectToCSV(data, options);
  } else {
    return String(data);
  }
}

function exportArrayToCSV(array: any[], options: ExportOptions): string {
  if (array.length === 0) return '';
  
  const firstItem = array[0!];
  if (typeof firstItem === 'object' && firstItem !== null) {
    // Object array - use keys as headers
    const headers = Object.keys(firstItem);
    let csv = headers.join(',') + '\n';
    
    array.forEach((item: any) => {
      const row = headers.map((header: any) => {
        const value = item[header!];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value).replace(/,/g, ';'); // Escape commas
      });
      csv += row.join(',') + '\n';
    });
    
    return csv;
  } else {
    // Simple array
    return array.join('\n');
  }
}

function exportObjectToCSV(obj: any, options: ExportOptions): string {
  const entries = Object.entries(obj);
  let csv = 'Key,Value\n';
  
  entries.forEach(([key, value]) => {
    const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
    csv += `${key},${valueStr.replace(/,/g, ';')}\n`;
  });
  
  return csv;
}

/**
 * Export data as Markdown
 */
function exportToMarkdown(data: any, options: ExportOptions): string {
  const title = options.title || 'Data Export';
  const description = options.description || 'Exported data from MIFF module';
  
  let markdown = `# ${title}\n\n`;
  
  if (description) {
    markdown += `${description}\n\n`;
  }
  
  if (options.includeMetadata) {
    markdown += `**Exported:** ${new Date().toISOString()}\n`;
    markdown += `**Format:** Markdown\n\n`;
  }
  
  if (Array.isArray(data)) {
    markdown += exportArrayToMarkdown(data);
  } else if (typeof data === 'object' && data !== null) {
    markdown += exportObjectToMarkdown(data);
  } else {
    markdown += `\`\`\`\n${String(data)}\n\`\`\`\n`;
  }
  
  return markdown;
}

function exportArrayToMarkdown(array: any[]): string {
  if (array.length === 0) return 'No data available.\n';
  
  const firstItem = array[0!];
  if (typeof firstItem === 'object' && firstItem !== null) {
    // Object array - create table
    const headers = Object.keys(firstItem);
    let markdown = '| ' + headers.join(' | ') + ' |\n';
    markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
    
    array.forEach((item: any) => {
      const row = headers.map((header: any) => {
        const value = item[header!];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      });
      markdown += '| ' + row.join(' | ') + ' |\n';
    });
    
    return markdown + '\n';
  } else {
    // Simple array - create list
    return array.map((item: any) => `- ${String(item)}`).join('\n') + '\n';
  }
}

function exportObjectToMarkdown(obj: any): string {
  let markdown = '';
  
  Object.entries(obj).forEach(([key, value]) => {
    markdown += `## ${key}\n\n`;
    
    if (typeof value === 'object' && value !== null) {
      markdown += '```json\n' + JSON.stringify(value, null, 2) + '\n```\n\n';
    } else {
      markdown += `${String(value)}\n\n`;
    }
  });
  
  return markdown;
}

/**
 * Export data as HTML
 */
function exportToHTML(data: any, options: ExportOptions): string {
  const title = options.title || 'Data Export';
  const description = options.description || 'Exported data from MIFF module';
  
  let html = `<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .metadata { background-color: #f9f9f9; padding: 10px; margin-bottom: 20px; }
        pre { background-color: #f5f5f5; padding: 10px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <p>${description}</p>`;
  
  if (options.includeMetadata) {
    html += `
    <div class="metadata">
        <strong>Exported:</strong> ${new Date().toISOString()}<br>
        <strong>Format:</strong> HTML
    </div>`;
  }
  
  if (Array.isArray(data)) {
    html += exportArrayToHTML(data);
  } else if (typeof data === 'object' && data !== null) {
    html += exportObjectToHTML(data);
  } else {
    html += `<pre>${String(data)}</pre>`;
  }
  
  html += `
</body>
</html>`;
  
  return html;
}

function exportArrayToHTML(array: any[]): string {
  if (array.length === 0) return '<p>No data available.</p>';
  
  const firstItem = array[0!];
  if (typeof firstItem === 'object' && firstItem !== null) {
    // Object array - create table
    const headers = Object.keys(firstItem);
    let html = '<table>\n<tr>';
    headers.forEach((header: any) => {
      html += `<th>${header}</th>`;
    });
    html += '</tr>\n';
    
    array.forEach((item: any) => {
      html += '<tr>';
      headers.forEach((header: any) => {
        const value = item[header!];
        let cellContent = '';
        if (value === null || value === undefined) {
          cellContent = '';
        } else if (typeof value === 'object') {
          cellContent = `<pre>${JSON.stringify(value, null, 2)}</pre>`;
        } else {
          cellContent = String(value);
        }
        html += `<td>${cellContent}</td>`;
      });
      html += '</tr>\n';
    });
    
    html += '</table>';
    return html;
  } else {
    // Simple array - create list
    let html = '<ul>\n';
    array.forEach((item: any) => {
      html += `<li>${String(item)}</li>\n`;
    });
    html += '</ul>';
    return html;
  }
}

function exportObjectToHTML(obj: any): string {
  let html = '';
  
  Object.entries(obj).forEach(([key, value]) => {
    html += `<h2>${key}</h2>`;
    
    if (typeof value === 'object' && value !== null) {
      html += `<pre>${JSON.stringify(value, null, 2)}</pre>`;
    } else {
      html += `<p>${String(value)}</p>`;
    }
  });
  
  return html;
}

/**
 * Helper function to add export functionality to CLI harnesses
 */
export function addExportSupport(
  result: any,
  format?: string,
  title?: string,
  description?: string
): { result: any; exportData?: string } {
  if (!format || format === 'json') {
    return { result };
  }
  
  const exportData = exportDataToFormat(result, {
    format: format as ExportFormat,
    includeMetadata: true,
    includeTimestamp: true,
    title,
    description
  });
  
  return { result, exportData };
}