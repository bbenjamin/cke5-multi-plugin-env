import DrupalMediaEditing from './drupalmediaediting';
import DrupalMediaUI from './drupalmediaui';
import { Plugin } from 'ckeditor5/src/core';

export default class DrupalMedia extends Plugin {
  static get requires() {
    return [DrupalMediaEditing, DrupalMediaUI];
  }
}
