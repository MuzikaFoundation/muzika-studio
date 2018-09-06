
/**
 * This represents IPFS files or directories as a tree. To convert flat
 * array that is returned by `ipfs.files.add` method into tree object,
 * use `IpfsUtil.flatArray2Tree`
 */
export interface IpfsObject {
  path: string;                           // path in ipfs
  hash: string;                           // object hash
  childObjects?: {                         // child objects of this object
    [basename: string]: IpfsObject;
  };
  size?: number;                          // size of the object
  content?: Buffer | ReadableStream;      // content of the object
}
