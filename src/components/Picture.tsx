interface Props {
  picture: ImagePicture;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
}

/** vite-imagetools 產生的 AVIF / WebP / 備援格式 */
export default function Picture({ picture, alt, className, sizes = '100vw', loading = 'lazy' }: Props) {
  const { avif, webp } = picture.sources;
  return (
    <picture>
      {avif && <source srcSet={avif} type="image/avif" sizes={sizes} />}
      {webp && <source srcSet={webp} type="image/webp" sizes={sizes} />}
      <img
        src={picture.img.src}
        width={picture.img.w}
        height={picture.img.h}
        alt={alt}
        loading={loading}
        decoding="async"
        className={className}
      />
    </picture>
  );
}
