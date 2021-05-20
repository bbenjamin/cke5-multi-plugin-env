// Generates a manifest if one is not available.
// @todo the generated manifest can potentially be deleted if a dependency
//   changes. Copying to another directory could mitigate this, but it also
//   increases the risk of the manifest being out of sync with the CKEditor 5
//   manifest.
//
// @todo there should be a way of enforcing version consistency between the
//    Github CKEditor 5 used to create the manifest and the CKEditor version
//    being used. Maybe this could happen in Drupal test coverage.

const fs = require('fs');
const { exec } = require("child_process");
const manifestPath = './node_modules/dllCkeditor5/build/ckeditor5-dll.manifest.json'

if (!fs.existsSync(manifestPath)){
  console.log('CKEditor manifest not available. Generating one now. This takes a while, but should only need to happen once.')
  exec('yarn --cwd ./node_modules/dllCkeditor5 install', (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }

    console.log(stdout);
    exec('yarn --cwd ./node_modules/dllCkeditor5 dll:build', (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }

      console.log(stdout);
      if (fs.existsSync(manifestPath)) {
        console.log(`Manifest created at  ${manifestPath}`);
      } else {
        console.log('error: Unable to create manifest.');
      }
    });
  });
} else {
  console.log(`Manifest present at ${manifestPath}`);
}
