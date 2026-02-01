const { MakerZIP } = require('@electron-forge/maker-zip');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: './icon',
    overwrite: true,
    platform: 'win32'
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
