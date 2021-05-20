# Plugin development environment

Built on top of https://github.com/Reinmar/ckeditor5-plugin-env with
customizations for Drupal use.

1. Run `yarn install`.

## Plugin development
This part not completed.ls
1. ~~Run `yarn start` (that builds a micro app defined in `sample/sample-dev.js`).~~
1. ~~Open the `sample/sample-dev.html` file in your browser.~~

## Building DLL

1. Clone the https://github.com/ckeditor/ckeditor5 repo next to the plugin repo. This step is necessary for now because the base DLL and manifest are not published on npm yet. However, it could be made invisible for plugin developer (happen under the hood of this task).
1. `cd ckeditor5 && yarn install && yarn dll:build`
1. `cd ../ckeditor5-plugin-env && yarn build`
1. Open the `sample/sample-dll.html` file in your browser.