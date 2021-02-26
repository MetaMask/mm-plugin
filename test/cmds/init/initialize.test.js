/* eslint-disable jest/prefer-strict-equal */
const { promises: fs } = require('fs');
const initUtils = require('../../../dist/src/cmds/init/initutils');
const readlineUtils = require('../../../dist/src/utils/readline');
const miscUtils = require('../../../dist/src/utils/misc');
const { initHandler } = require('../../../dist/src/cmds/init/initialize');

describe('initialize', () => {
  describe('initHandler', () => {

    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    const mockPackage = {
      name: 'foo',
      version: '1.0.0',
      description: '',
      main: 'index.js',
      scripts: { test: 'echo "Error: no test specified" && exit 1' },
      author: '',
      license: 'ISC',
    };

    const mockArgv = {
      _: ['init'],
      verboseErrors: false,
      v: false,
      'verbose-errors': false,
      suppressWarnings: false,
      sw: false,
      'suppress-warnings': false,
      src: 'index.js',
      s: 'index.js',
      dist: 'dist',
      d: 'dist',
      outfileName: 'bundle.js',
      n: 'bundle.js',
      'outfile-name': 'bundle.js',
      port: 8081,
      p: 8081,
      '$0': '/usr/local/bin/mm-snap',
    };

    const mockWallet = [
      {
        bundle: {
          local: 'dist/bundle.js',
          url: 'http://localhost:8081/dist/bundle.js',
        },
        initialPermissions: { alert: {} },
      },
      { dist: 'dist', outfileName: 'bundle.js', port: 8081 },
    ];

    const expectedReturnValue = {
      _: ['init'],
      verboseErrors: false,
      v: false,
      'verbose-errors': false,
      suppressWarnings: false,
      sw: false,
      'suppress-warnings': false,
      src: 'index.js',
      s: 'index.js',
      dist: 'dist',
      d: 'dist',
      outfileName: 'bundle.js',
      n: 'bundle.js',
      'outfile-name': 'bundle.js',
      port: 8081,
      p: 8081,
      '$0': '/usr/local/bin/mm-snap',
    };

    it('function successfully executes under normal conditions', async () => {
      jest.spyOn(console, 'log').mockImplementation();
      const fsWriteMock = jest.spyOn(fs, 'writeFile').mockImplementation(() => true);
      const asyncPackageInitMock = jest.spyOn(initUtils, 'asyncPackageInit').mockImplementation(() => mockPackage);
      const validateEmptyDirMock = jest.spyOn(initUtils, 'validateEmptyDir').mockImplementation();
      const buildWeb3WalletMock = jest.spyOn(initUtils, 'buildWeb3Wallet').mockImplementation(() => mockWallet);
      const closePromptMock = jest.spyOn(readlineUtils, 'closePrompt').mockImplementation(() => mockPackage);
      expect(await initHandler(mockArgv)).toStrictEqual(expectedReturnValue);
      expect(global.console.log).toHaveBeenCalledTimes(6);
      expect(fsWriteMock).toHaveBeenCalledTimes(4);
      expect(asyncPackageInitMock).toHaveBeenCalledTimes(1);
      expect(validateEmptyDirMock).toHaveBeenCalledTimes(1);
      expect(closePromptMock).toHaveBeenCalledTimes(1);
      expect(buildWeb3WalletMock).toHaveBeenCalledWith(mockArgv);
    });

    it('function logs error when writefile is unsuccessful', async () => {
      global.snaps = {
        verboseErrors: false,
      };
      jest.spyOn(console, 'log').mockImplementation();
      const errorMock = jest.spyOn(miscUtils, 'logError').mockImplementation();
      const fsWriteMock = jest.spyOn(fs, 'writeFile').mockImplementation(() => {
        throw new Error('error message');
      });
      jest.spyOn(process, 'exit').mockImplementation(() => undefined);
      const asyncPackageInitMock = jest.spyOn(initUtils, 'asyncPackageInit').mockImplementation(() => mockPackage);
      const validateEmptyDirMock = jest.spyOn(initUtils, 'validateEmptyDir').mockImplementation();
      const buildWeb3WalletMock = jest.spyOn(initUtils, 'buildWeb3Wallet').mockImplementation(() => mockWallet);
      const closePromptMock = jest.spyOn(readlineUtils, 'closePrompt').mockImplementation(() => mockPackage);
      expect(await initHandler(mockArgv)).toStrictEqual(expectedReturnValue);
      expect(global.console.log).toHaveBeenCalledTimes(3);
      expect(errorMock).toHaveBeenCalledTimes(4);
      expect(fsWriteMock).toHaveBeenCalledTimes(4);
      expect(asyncPackageInitMock).toHaveBeenCalledTimes(1);
      expect(validateEmptyDirMock).toHaveBeenCalledTimes(1);
      expect(closePromptMock).toHaveBeenCalledTimes(1);
      expect(buildWeb3WalletMock).toHaveBeenCalledWith(mockArgv);
      expect(process.exit).toHaveBeenCalledWith(1);
      expect(process.exit).toHaveBeenCalledTimes(3);
    });

    it('function does not write to main if undefined', async () => {
      const mockPackageWithoutMain = {
        name: 'foo',
        version: '1.0.0',
        description: '',
        scripts: { test: 'echo "Error: no test specified" && exit 1' },
        author: '',
        license: 'ISC',
      };
      jest.spyOn(console, 'log').mockImplementation();
      const fsWriteMock = jest.spyOn(fs, 'writeFile').mockImplementation(() => true);
      const asyncPackageInitMock = jest.spyOn(initUtils, 'asyncPackageInit').mockImplementation(() => mockPackageWithoutMain);
      const validateEmptyDirMock = jest.spyOn(initUtils, 'validateEmptyDir').mockImplementation();
      const buildWeb3WalletMock = jest.spyOn(initUtils, 'buildWeb3Wallet').mockImplementation(() => mockWallet);
      const closePromptMock = jest.spyOn(readlineUtils, 'closePrompt').mockImplementation(() => mockPackageWithoutMain);
      expect(await initHandler(mockArgv)).toStrictEqual(expectedReturnValue);
      expect(global.console.log).toHaveBeenCalledTimes(5);
      expect(fsWriteMock).toHaveBeenCalledTimes(3);
      expect(asyncPackageInitMock).toHaveBeenCalledTimes(1);
      expect(validateEmptyDirMock).toHaveBeenCalledTimes(1);
      expect(closePromptMock).toHaveBeenCalledTimes(1);
      expect(buildWeb3WalletMock).toHaveBeenCalledWith(mockArgv);
    });
  });
});