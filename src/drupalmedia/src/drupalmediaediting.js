import { Plugin } from 'ckeditor5/src/core';
import { toWidget } from 'ckeditor5/src/widget';
import { Widget } from 'ckeditor5/src/widget';

import InsertDrupalMediaCommand from './insertdrupalmedia';

export default class DrupalMediaEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this.attrs = ['alt', 'data-align', 'data-caption', 'data-entity-type', 'data-entity-uuid', 'data-view-mode'];
    const options = this.editor.config.get('drupalMedia');
    if (!options) {
			return;
    }
    const { previewURL, themeError } = options;
    this.previewURL = previewURL;
    this.themeError = themeError || `
      <p>${this.editor.t(
        'An error occurred while trying to preview the media. Please save your work and reload this page.'
      )}<p>
    `;

    this._defineSchema();
    this._defineConverters();

    this.editor.commands.add('insertDrupalMedia', new InsertDrupalMediaCommand(this.editor));
  }

  /**
   * MediaFilterController::preview requires the saved element.
   * @todo: is there a better way to get the rendered dataDowncast string?
   */
  _renderElement(modelElement) {
    const attrs = modelElement.getAttributes();
    let element = '<drupal-media';
    for (let attr of attrs) {
      element += ` ${attr[0]}="${attr[1]}"`;
    }
    element += '></drupal-media>';

    return element;
  };

  async _fetchPreview(url, query) {
    const response = await fetch(`${url}?${new URLSearchParams(query)}`);
    if (response.ok) {
      const label = response.headers.get('drupal-media-label');
      const preview = await response.text();
      return { label, preview };
    }

    return this.themeError;
  }

  _defineSchema() {
    const schema = this.editor.model.schema;
    schema.register('drupalMedia', {
      allowWhere: '$block',
      isObject: true,
      isContent: true,
      allowAttributes: this.attrs,
    });
  }

  _defineConverters() {
    const conversion = this.editor.conversion;
    conversion.for('upcast').elementToElement({
      view: {
        name: 'drupal-media',
      },
      model: 'drupalMedia',
    });

    conversion.for('dataDowncast').elementToElement({
      model: 'drupalMedia',
      view: {
        name: 'drupal-media'
      }
    });

    conversion.for('editingDowncast').elementToElement({
      model: 'drupalMedia',
      view: (modelElement, { writer: viewWriter }) => {
        const container = viewWriter.createContainerElement('div', {
          class: 'drupal-media',
        });
        const media = viewWriter.createRawElement('div', {}, (domElement) => {
          if (this.previewURL) {
            this._fetchPreview(this.previewURL, {
              text: this._renderElement(modelElement),
              uuid: modelElement.getAttribute('data-entity-uuid'),
            }).then(({ label, preview }) => {
              domElement.innerHTML = preview;
              domElement.setAttribute('aria-label', label);
            });
          } else {
            domElement.innerHTML = this.themeError;
            domElement.setAttribute('aria-label', 'drupal-media');
          }
        });
        viewWriter.insert(viewWriter.createPositionAt(container, 0), media);

        return toWidget(container, viewWriter, { label: 'media widget' });
      }
    });

    this.attrs.forEach((attr) => {
      conversion.attributeToAttribute({ model: attr, view: attr });
    });
  }
}
