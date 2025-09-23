module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: { node: 'current' },
      modules: 'commonjs'
    }],
    '@babel/preset-typescript'
  ],
  plugins: [
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }]
  ]
};