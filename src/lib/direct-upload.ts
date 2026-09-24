import axiosInstance from '@/redux/axios-instance';

/**
 * Uploads episode files straight from the browser to storage.
 *
 * Posting every page through `/api/quiva` cannot work in production: that route is a serverless
 * function whose request body is capped at 4.5 MB and rejected at the edge before any of our
 * code runs, which is the `413 Request Entity Too Large` creators were hitting. Local `next dev`
 * has no such cap, which is why it only ever failed once deployed.
 *
 * So the bytes skip our API entirely. The backend mints a one-time upload URL per file - the
 * storage credentials stay on the server - the browser uploads to it directly, and only the
 * resulting CIDs are sent on to create the episode. Request size then has nothing to do with
 * how many pages an episode has.
 */

export interface UploadedFile {
  imageUrl: string;
  imageCid: string;
  mimeType: string;
  pageNumber?: number;
}

export interface UploadProgress {
  /** Files finished so far, out of `total`. */
  completed: number;
  total: number;
  currentFileName: string;
}

const IPFS_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud';

const gatewayUrl = (cid: string) => `${IPFS_GATEWAY.replace(/\/$/, '')}/ipfs/${cid}`;

/** One short-lived, single-use upload URL, scoped to this file's type. */
const requestUploadUrl = async (file: File): Promise<string> => {
  const response = await axiosInstance.post('/comics/upload-url', {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
  });

  const url = response?.data?.data?.url;
  if (!url) throw new Error('The server did not return an upload URL.');
  return url;
};

export const uploadFileDirect = async (file: File): Promise<UploadedFile> => {
  const uploadUrl = await requestUploadUrl(file);

  const body = new FormData();
  body.append('file', file);

  const response = await fetch(uploadUrl, { method: 'POST', body });
  if (!response.ok) {
    throw new Error(`Upload failed for ${file.name} (${response.status}).`);
  }

  const result = await response.json();
  const cid = result?.data?.cid || result?.cid;
  if (!cid) throw new Error(`Storage did not return a CID for ${file.name}.`);

  return {
    imageUrl: gatewayUrl(cid),
    imageCid: cid,
    mimeType: file.type || 'application/octet-stream',
  };
};

/**
 * Uploads files one at a time so progress is truthful and a failure names the file that broke.
 * Sequential on purpose: a creator on a domestic connection uploading twenty pages at once
 * tends to stall them all rather than finish any.
 */
export const uploadFilesDirect = async (
  files: File[],
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedFile[]> => {
  const uploaded: UploadedFile[] = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    onProgress?.({ completed: index, total: files.length, currentFileName: file.name });

    const result = await uploadFileDirect(file);
    uploaded.push({ ...result, pageNumber: index + 1 });
  }

  onProgress?.({ completed: files.length, total: files.length, currentFileName: '' });
  return uploaded;
};
