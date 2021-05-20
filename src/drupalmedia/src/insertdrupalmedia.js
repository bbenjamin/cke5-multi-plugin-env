import { Command } from 'ckeditor5/src/core';

export default class InsertDrupalMediaCommand extends Command {
  execute(attributes) {
    this.editor.model.change((writer) => {
      this.editor.model.insertContent(createDrupalMedia(writer, attributes));
    });
  }

  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), 'drupalMedia');
    this.isEnabled = allowedIn !== null;
  }
}

function createDrupalMedia(writer, attributes) {
  const drupalMedia = writer.createElement('drupalMedia', attributes);
  return drupalMedia;
}
