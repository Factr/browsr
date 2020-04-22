# browsr
Browser extension for [Factr](https://factr.com) supporting Firefox and Chrome.  Factr is customized, real-time knowledge-sharing, letting your organization know more and act faster.

Requirements:
1. Node version - >= 6.9.1
2. NPM version >= 6.13.0

## Steps to build for production:
1. Run `npm run build [dev/staging]` to start. To run with production config leave out `[dev/staging]`. Config files can be found in `src/config`

## Development

Run `npm run watch` to build for development.  This will put output into `output` folder which can be added to chrome://extensions (Load unpacked) for Chrome or about:debugging (Load Temporary Add-on...) in Mozilla.

### Hot Reloading
To enable hot reloading for chrome you can install the Extensions Reloader extension at https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid?hl=en. The extension will reload every time you open it.

For hot reloading on Firefox you need to install web-ext command line tools and run web-ext run in the output folder. For more information see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Getting_started_with_web-ext.

### Updating static files
Some files aren't bundled by webpack but still must be present in the output folder when uploading an unpacked extension. These files are stored in the static folder and include the icons used for the extension, manifest.json file, and popup.html. A custom line of code is written in the webpack config to copy the contents of the static folder into the output folder after every build. When files in the static directory are changed webpack must recompile for the changes to take affect.
