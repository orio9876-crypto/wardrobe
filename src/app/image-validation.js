export const SUPPORTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];

export const hasSupportedImageExtension = (name = "") => {
  const normalizedName = name.toLowerCase();
  return SUPPORTED_IMAGE_EXTENSIONS.some((extension) => normalizedName.endsWith(extension));
};

export const isSupportedImage = ({ name = "", type = "" }) => {
  const normalizedType = type.toLowerCase();
  return normalizedType.startsWith("image/") || hasSupportedImageExtension(name);
};
