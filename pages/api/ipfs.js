import * as IPFS from "ipfs-core";

class IpfsNftStorage {
  constructor() {
    if (window.ipfsApi) {
      this.ipfs = window.ipfsApi;
      return;
    }
    this.ipfs = null;
  }
  async create() {
    if (!window.ipfsApi) {
      this.ipfs = await IPFS.create();
      window.ipfsApi = this.ipfs;
    }
  }

  async add(file) {
    return await this.ipfs.add(file);
  }

  async cat(cid) {
    return await this.ipfs.cat(cid);
  }
  async loadMeta(cid) {
    if (cid == "" || cid == null || cid == undefined || this.ipfs === null) {
      return;
    }
    let result = null;
    for await (const file of this.ipfs.cat(cid)) {
      let str = String.fromCharCode.apply(null, file);
      result = JSON.parse(str);
    }
    return result;
  }

  async loadImgURL(cid, mime) {
    if (cid == "" || cid == null || cid == undefined) {
      return;
    }
    let result = null;
    for await (const file of this.ipfs.cat(cid)) {
      if (file.buffer) {
        let binary = "";
        for (let i = 0; i < file.byteLength; i++) {
          binary += String.fromCharCode(file[i]);
        }
        result = `data:image/png;base64,${window.btoa(binary)}`;
      }
    }
    return result;
  }
}

export default IpfsNftStorage;
