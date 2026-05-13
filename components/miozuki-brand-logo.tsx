import Image from 'next/image';

export type MiozukiBrandLogoVariant = 'light' | 'dark';

/** Full lockup: `light` for crimson header; `dark` for cream backgrounds. */
export function MiozukiBrandLogo({
  variant,
  className,
  priority = false,
}: {
  variant: MiozukiBrandLogoVariant;
  className?: string;
  priority?: boolean;
}) {
  const src =
    variant === 'light'
      ? '/miozuki-logo-full-light.svg'
      : '/miozuki-logo-full-dark.svg';

  return (
    <Image
      src={src}
      alt="Miozuki"
      width={1000}
      height={1000}
      priority={priority}
      unoptimized
      className={className}
    />
  );
}
