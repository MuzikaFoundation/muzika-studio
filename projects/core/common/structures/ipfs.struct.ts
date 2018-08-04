
import * as path from 'path';
import * as assert from 'assert';
import { IpfsObject } from '../models';

export class IpfsUtil {

  /**
   * path util for ipfs. Since functions in node module `path` is dependent
   * on the platform and ipfs use posix path, use this path instead of
   * path in node module.
   */
  static path = {
    ...path.posix,                  // ipfs use posix path

    /**
     * Splits ipfs path into ipfs path segment.
     * @param {string} filePath ipfs file path.
     * @returns {string[]} split ipfs path array.
     */
    split: (filePath: string): string[] => {
      // split by posix separator
      const splitPath = filePath.split(path.posix.sep);

      // if the root starts with '/', remove first one because it would
      // be empty name.
      return (splitPath[0] === '') ? splitPath.slice(1) : splitPath;
    },

    /**
     * normalize the file path. It overrides path.posix.normalize function for
     * removing the last character if it is separator `/`.
     * @param {string} filePath file path to normalize.
     * @returns {string} normalized path.
     */
    normalize: (filePath: string): string => {
      // if empty string, return it instead of '.'
      if (filePath === '') {
        return '';
      }

      const normPath = path.posix.normalize(filePath);
      // remove the last character if it is separator and return
      return (normPath.length > 0 && normPath[normPath.length - 1] === path.posix.sep) ? normPath.slice(-1) : normPath;
    }
  };

  /**
   * Converts an flat array from `ipfs.files.add` to tree structure.
   */
  static flatArray2Tree(files: IpfsObject[]): IpfsObject {
    let objects = files.map(file => <any>{
      // convert flat IpfsObject
      object: <IpfsObject>{
        path: IpfsUtil.path.normalize(file.path),
        hash: file.hash,
        childObjects: {},
        size: file.size,
        content: file.content,
      },
      // calculate split path for sorting faster
      depth: IpfsUtil.path.split(file.path).length,
    });

    // if file array is empty,
    if (objects.length === 0) {
      throw new Error('no ipfs objects');
    }

    // if file array length is just one, return the object itself since
    // it is just root.
    if (objects.length <= 1) {
      return objects[0].object;
    }

    // sort by depth
    objects = objects.sort((a, b) => a.depth - b.depth);
    console.log(objects);

    const root = objects[0];

    // the first object should be root.
    assert.notEqual(root.object.depth, 0);

    objects.forEach((obj, index) => {
      // ignore root index
      if (index === 0) {
        return;
      }

      let i = index - 1;
      const rootPath = IpfsUtil.path.dirname(obj.object.path);
      for (; i >= 1; --i) {
        // if finding the parent node, register to the parent node.
        if (objects[i].object.path === rootPath) {
          break;
        }
      }

      objects[i].object.childObjects[obj.object.hash] = obj.object;
    });

    return root.object;
  }

  /**
   * Converts an tree structure to flat array structure.
   */
  static tree2flatArray(obj: IpfsObject, filter?: (obj: IpfsObject) => boolean): IpfsObject[] {
    const queue = [obj];
    const flatArr = [];

    if (filter === undefined || filter === null) {
      filter = (_) => true;
    }

    // search tree by BFS
    while (queue.length > 0) {
      const node = queue.pop();
      if (filter(node)) {
        flatArr.push({path: node.path, hash: node.hash, size: node.size, content: node.content});
      }

      // push child object to the object
      Object.keys(node.childObjects).forEach((childHash) => {
        queue.push(node.childObjects[childHash]);
      });
    }

    return flatArr;
  }

  /**
   * Get roots object in the flat array structure.
   */
  static getRootObject(objs: IpfsObject[]): IpfsObject {
    // if object length is 1, it is just the root object
    if (objs.length === 1) {
      return objs[0];
    }

    for (const obj of objs) {
      // root object path is '' or '/'
      if (['', '/'].includes(obj.path)) {
        return obj;
      }
    }

    // cannot find root object
    return null;
  }

  /**
   * Returns only directories in the ipfs object tree. Empty directory
   * will be ignored.
   * @param obj root object.
   */
  static getDirectoriesOnly(obj: IpfsObject): IpfsObject[] {
    return this.tree2flatArray(obj, (o) => {
      // directory has child objects (file)
      return (o.childObjects !== undefined && Object.keys(o.childObjects).length > 0);
    });
  }

  /**
   * Returns only files (leaf nodes) in the ipfs object tree.
   * @param obj root object.
   */
  static getFilesOnly(obj: IpfsObject): IpfsObject[] {
    return this.tree2flatArray(obj, (o) => {
      return (o.childObjects === undefined || Object.keys(o.childObjects).length === 0);
    })
  }
}
