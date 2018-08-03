/**
 * This represents IPFS files or directory as a flat array. It's the
 * same structure with the object in the array returned by `ipfs.files.add`
 * method.
 */
export interface RawIpfsObject {
  path: string;                         // path in ipfs
  hash: string;                         // object hash
  size: number;                         // size of the object
}

/**
 * This represents IPFS files or directories as a tree. To convert flat
 * array that is returned by `ipfs.files.add` method into tree object,
 * use `IpfsUtil.flatArray2Tree`
 */
export interface IpfsObject {
  path: string;                           // path in ipfs
  hash: string;                           // object hash
  childObjects: {                         // child objects of this object
    [hash: string]: IpfsObject;
  };
  size?: number;                          // size of the object
  content?: Buffer | ReadableStream;      // content of the object
}
