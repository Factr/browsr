# browsr
Browser extension for [Factr](https://factr.com) supporting Firefox, Safari, Chrome.  Factr is customized, real-time knowledge-sharing, letting your organization know more and act faster.

## Development

Run `npm run watch` to build for development.  This will put output into `output/chrome` which can be added to chrome://extensions

Run `npm run build prod` to build with production configuration. Config files can be found in `app/config`

## Signing inline Javascript

[W3 Documentation](https://www.w3.org/TR/2015/CR-CSP2-20150721/#script-src-hash-usage)

This command signs the javascript: `echo -n "alert('Hello, world.');" | openssl dgst -sha256 -binary | openssl enc -base64`

This will return the hash for inline script.  Do not include the `<script>` tags themselves just what's inside the tags.

Place the hash in kango/src/js/chrome/manifest.json and rebuild.

## Build for Chrome WebStore

`npm run release` will build the final extension file. Make sure you update `src/common/extension_info.json` with the new version so that new files are generated.
