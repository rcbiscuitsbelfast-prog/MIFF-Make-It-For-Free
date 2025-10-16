/**
 * BuildOptimizer - Comprehensive build optimization and bundle size analysis
 * Optimizes TypeScript compilation, bundle size, and production builds
 */

export interface BuildConfig {
  target: 'es5' | 'es2015' | 'es2017' | 'es2018' | 'es2019' | 'es2020' | 'es2021' | 'es2022';
  module: 'commonjs' | 'amd' | 'system' | 'umd' | 'es6' | 'es2015' | 'es2020' | 'esnext' | 'node16' | 'nodenext';
  outDir: string;
  rootDir: string;
  sourceMap: boolean;
  declaration: boolean;
  removeComments: boolean;
  minify: boolean;
  treeShaking: boolean;
  codeSplitting: boolean;
  compression: 'gzip' | 'brotli' | 'both' | 'none';
}

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  brotliSize: number;
  modules: Array<{
    name: string;
    size: number;
    dependencies: string[];
  }>;
  chunks: Array<{
    name: string;
    size: number;
    modules: string[];
  }>;
  duplicates: string[];
  unused: string[];
}

export class BuildOptimizer {
  private static instance: BuildOptimizer;
  private config: BuildConfig;
  private analysis: BundleAnalysis | null = null;

  private constructor(config: Partial<BuildConfig> = {}) {
    this.config = {
      target: 'es2020',
      module: 'commonjs',
      outDir: 'dist',
      rootDir: 'miff/pure',
      sourceMap: true,
      declaration: true,
      removeComments: true,
      minify: true,
      treeShaking: true,
      codeSplitting: true,
      compression: 'both',
      ...config
    };
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<BuildConfig>): BuildOptimizer {
    if (!BuildOptimizer.instance) {
      BuildOptimizer.instance = new BuildOptimizer(config);
    }
    return BuildOptimizer.instance;
  }

  /**
   * Optimize TypeScript configuration
   */
  optimizeTypeScriptConfig(): any {
    return {
      compilerOptions: {
        target: this.config.target,
        module: this.config.module,
        lib: ['es2020', 'dom'],
        outDir: this.config.outDir,
        rootDir: this.config.rootDir,
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: this.config.declaration,
        sourceMap: this.config.sourceMap,
        removeComments: this.config.removeComments,
        noImplicitAny: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        exactOptionalPropertyTypes: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
        noUncheckedIndexedAccess: true,
        noImplicitOverride: true,
        allowUnusedLabels: false,
        allowUnreachableCode: false,
        ...(this.config.treeShaking && {
          moduleResolution: 'node',
          allowSyntheticDefaultImports: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: true
        })
      },
      include: [
        'miff/pure/**/*',
        'scripts/**/*',
        '*.ts'
      ],
      exclude: [
        'node_modules',
        'dist',
        'coverage',
        '**/*.test.ts',
        '**/*.spec.ts'
      ]
    };
  }

  /**
   * Optimize Webpack configuration
   */
  optimizeWebpackConfig(): any {
    return {
      mode: 'production',
      entry: './miff/pure/index.ts',
      output: {
        path: require('path').resolve(__dirname, this.config.outDir),
        filename: this.config.codeSplitting ? '[name!].[contenthash!].js' : 'bundle.js',
        chunkFilename: this.config.codeSplitting ? '[name!].[contenthash!].chunk.js' : undefined,
        clean: true,
        ...(this.config.treeShaking && {
          library: {
            type: 'umd',
            name: 'MIFF'
          }
        })
      },
      resolve: {
        extensions: ['.ts', '.js', '.json'],
        alias: {
          '@': require('path').resolve(__dirname, 'miff/pure'),
          '@shared': require('path').resolve(__dirname, 'miff/pure/shared'),
          '@managers': require('path').resolve(__dirname, 'miff/pure/managers'),
          '@tests': require('path').resolve(__dirname, 'miff/pure/tests')
        }
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            use: {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                configFile: 'tsconfig.json'
              }
            },
            exclude: /node_modules/
          }
        ]
      },
      optimization: {
        minimize: this.config.minify,
        ...(this.config.treeShaking && {
          usedExports: true,
          sideEffects: false
        }),
        ...(this.config.codeSplitting && {
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all'
              },
              shared: {
                test: /[\\/]miff[\\/]pure[\\/]shared[\\/]/,
                name: 'shared',
                chunks: 'all'
              }
            }
          }
        })
      },
      plugins: [
        ...(this.config.compression !== 'none' ? [
          require('compression-webpack-plugin')({
            algorithm: this.config.compression === 'gzip' ? 'gzip' : 'brotli',
            test: /\.(js|css|html|svg)$/,
            threshold: 10240,
            minRatio: 0.8
          })
        ] : [])
      ]
    };
  }

  /**
   * Analyze bundle size
   */
  async analyzeBundleSize(): Promise<BundleAnalysis> {
    // This would integrate with webpack-bundle-analyzer in a real implementation
    const mockAnalysis: BundleAnalysis = {
      totalSize: 1024 * 1024, // 1MB
      gzippedSize: 256 * 1024, // 256KB
      brotliSize: 200 * 1024, // 200KB
      modules: [
        {
          name: 'miff-core',
          size: 512 * 1024,
          gzippedSize: 128 * 1024,
          dependencies: ['lodash', 'moment']
        },
        {
          name: 'miff-shared',
          size: 256 * 1024,
          gzippedSize: 64 * 1024,
          dependencies: ['axios']
        }
      ],
      chunks: [
        {
          name: 'main',
          size: 768 * 1024,
          modules: ['miff-core', 'miff-shared']
        }
      ],
      duplicates: ['lodash'],
      unused: ['moment']
    };

    this.analysis = mockAnalysis;
    return mockAnalysis;
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];

    if (!this.config.treeShaking) {
      recommendations.push('Enable tree shaking to reduce bundle size');
    }

    if (!this.config.codeSplitting) {
      recommendations.push('Enable code splitting for better loading performance');
    }

    if (this.config.compression === 'none') {
      recommendations.push('Enable compression (gzip/brotli) to reduce transfer size');
    }

    if (!this.config.minify) {
      recommendations.push('Enable minification to reduce bundle size');
    }

    if (this.analysis) {
      if (this.analysis.duplicates.length > 0) {
        recommendations.push(`Remove duplicate dependencies: ${this.analysis.duplicates.join(', ')}`);
      }

      if (this.analysis.unused.length > 0) {
        recommendations.push(`Remove unused dependencies: ${this.analysis.unused.join(', ')}`);
      }

      const compressionRatio = this.analysis.gzippedSize / this.analysis.totalSize;
      if (compressionRatio > 0.5) {
        recommendations.push('Bundle size is large, consider further optimization');
      }
    }

    return recommendations;
  }

  /**
   * Generate build report
   */
  generateBuildReport(): string {
    const recommendations = this.getOptimizationRecommendations();
    const analysis = this.analysis;

    return `
🔧 MIFF Build Optimization Report
================================
Configuration:
- Target: ${this.config.target}
- Module: ${this.config.module}
- Minify: ${this.config.minify}
- Tree Shaking: ${this.config.treeShaking}
- Code Splitting: ${this.config.codeSplitting}
- Compression: ${this.config.compression}

${analysis ? `
Bundle Analysis:
- Total Size: ${(analysis.totalSize / 1024).toFixed(2)} KB
- Gzipped Size: ${(analysis.gzippedSize / 1024).toFixed(2)} KB
- Brotli Size: ${(analysis.brotliSize / 1024).toFixed(2)} KB
- Compression Ratio: ${((1 - analysis.gzippedSize / analysis.totalSize) * 100).toFixed(2)}%
- Modules: ${analysis.modules.length}
- Chunks: ${analysis.chunks.length}
` : 'No bundle analysis available'}

Recommendations:
${recommendations.length > 0 ? recommendations.map((r: any) => `- ${r}`).join('\n') : '- No recommendations'}

================================
    `.trim();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<BuildConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): BuildConfig {
    return { ...this.config };
  }
}

// Export convenience functions
export const buildOptimizer = BuildOptimizer.getInstance();
export const optimizeBuild = () => buildOptimizer.optimizeTypeScriptConfig();
export const analyzeBundle = () => buildOptimizer.analyzeBundleSize();