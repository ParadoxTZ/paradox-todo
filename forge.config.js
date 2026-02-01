const { MakerZIP } = require('@electron-forge/maker-zip');
const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: './icon',
    overwrite: true,
    platform: 'win32',
    out: path.join(__dirname, 'dist')
  },
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'],
      config: {
        name: 'paradox-todo'
      }
    }
  ]
};
