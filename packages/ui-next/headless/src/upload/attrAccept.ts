import { warning } from '../util';

const attrAccept = (
  file: File,
  acceptedFiles: string | string[] | undefined,
) => {
  if (file && acceptedFiles) {
    const acceptedFilesArray = Array.isArray(acceptedFiles)
      ? acceptedFiles
      : acceptedFiles.split(',');
    const fileName = file.name || '';
    const mimeType = file.type || '';
    const baseMimeType = mimeType.replace(/\/.*$/, '');

    return acceptedFilesArray.some((type) => {
      const validType = type.trim();
      // This is something like */*,*  allow all files
      if (/^\*(\/\*)?$/.test(type)) {
        return true;
      }

      // like .jpg, .png
      if (validType.charAt(0) === '.') {
        const lowerFileName = fileName.toLowerCase();
        const lowerType = validType.toLowerCase();

        const affixList =
          lowerType === '.jpg' || lowerType === '.jpeg'
            ? ['.jpg', '.jpeg']
            : [lowerType];

        return affixList.some((affix) => lowerFileName.endsWith(affix));
      }

      // This is something like a image/* mime type
      if (validType.endsWith('/*')) {
        return baseMimeType === validType.replace(/\/.*$/, '');
      }

      // Full match
      if (mimeType === validType) {
        return true;
      }

      // Invalidate type should skip
      if (/^\w+$/.test(validType)) {
        warning(
          false,
          `Upload takes an invalidate 'accept' type '${validType}'.Skip for check.`,
        );
        return true;
      }

      return false;
    });
  }
  return true;
};
export default attrAccept;
