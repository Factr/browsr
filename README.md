# browsr
Browser extension for [Factr](https://factr.com) supporting Firefox, Safari, Chrome.  Factr is customized, real-time knowledge-sharing, letting your organization know more and act faster.

## Signing inline Javascript

[W3 Documentation](https://www.w3.org/TR/2015/CR-CSP2-20150721/#script-src-hash-usage)

This command signs the javascript: `echo -n "alert('Hello, world.');" | openssl dgst -sha256 -binary | openssl enc -base64`

This will return the hash for inline script.  Do not include the <script> tags themselves just what's inside