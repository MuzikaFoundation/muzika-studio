export class IPCUtil {
  public static EVENT_FILE_UPLOAD = 'File:IPFSUpload';
  public static EVENT_PDF_VIEWER_OPEN = 'PDFViewer:open';
  public static EVENT_CHECK_FOR_UPDATE = 'checkForUpdate';
  public static EVENT_QUIT_AND_UPDATE = 'quitAndUpdate';

  static readonly uuid = (): string => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  static readonly wrap = (eventName: string, uuid?: string) => {
    if (!uuid) {
      uuid = IPCUtil.uuid();
    }

    return `${eventName}::${uuid}`;
  }
}
