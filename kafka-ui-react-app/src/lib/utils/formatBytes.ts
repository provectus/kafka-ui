function formatBytes(bytes: number, decimals = 0) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  if (bytes === 0) return [0, sizes[0]];

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return [parseFloat((bytes / k ** i).toFixed(dm)), sizes[i]];
}

export default formatBytes;
