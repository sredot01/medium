const maxDataLength = 420000;
export const postImageTypes = 'image/jpeg,image/png,image/webp,image/gif,image/avif,image/bmp,image/heic,image/heif';

export async function readPostImage(file) {
  if (!postImageTypes.split(',').includes(file.type)) {
    throw new Error('Choose a supported image, such as JPG, PNG, WebP, or GIF.');
  }
  if (file.size <= 300000) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Could not read the image.'));
      reader.readAsDataURL(file);
    });
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('Your browser could not open this image. Try exporting it as JPG or PNG.');
  }
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not prepare the image.');
    const scale = Math.min(1, 1440 / Math.max(bitmap.width, bitmap.height));
    for (const size of [scale, scale * 0.7, scale * 0.45]) {
      canvas.width = Math.max(1, Math.round(bitmap.width * size));
      canvas.height = Math.max(1, Math.round(bitmap.height * size));
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL('image/webp', 0.8);
      if (data.startsWith('data:image/webp;') && data.length <= maxDataLength) return data;
      const jpeg = canvas.toDataURL('image/jpeg', 0.75);
      if (jpeg.length <= maxDataLength) return jpeg;
    }
    throw new Error('This image is too large. Try a smaller image.');
  } finally {
    bitmap.close();
  }
}

export function postImagesFit(content, coverImage = '') {
  return new Blob([content, coverImage]).size <= 1700000;
}

export function insertPostImage(editor, data, index) {
  const position = Math.min(index, editor.getLength() - 1);
  editor.insertEmbed(position, 'image', data, 'user');
  editor.setSelection(position + 1);
}

export async function optimizePostImages(content, coverImage = '') {
  if (postImagesFit(content, coverImage)) return { content, coverImage };
  const article = document.createElement('template');
  article.innerHTML = content;

  async function optimize(source) {
    if (!/^data:image\/[a-z0-9.+-]+;base64,/i.test(source) || source.length <= maxDataLength) return source;
    const blob = await (await fetch(source)).blob();
    return readPostImage(blob);
  }

  for (const image of article.content.querySelectorAll('img[src]')) {
    const source = image.getAttribute('src');
    const optimized = await optimize(source);
    if (optimized !== source) image.setAttribute('src', optimized);
  }

  return { content: article.innerHTML, coverImage: await optimize(coverImage) };
}
