const DEVICE_ID_KEY = 'gimlee_device_id';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback for non-secure contexts or older browsers
  // https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
  return (([1e7] as unknown as string) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (char: string) => {
    const c = parseInt(char);
    const cryptoObj = typeof crypto !== 'undefined' ? crypto : (window as Window & { msCrypto?: Crypto }).msCrypto;
    const array = new Uint8Array(1);
    if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
      cryptoObj.getRandomValues(array);
    } else {
      array[0] = Math.floor(Math.random() * 256);
    }
    return (c ^ (array[0] & (15 >> (c / 4)))).toString(16);
  });
}

export function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = generateUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}
