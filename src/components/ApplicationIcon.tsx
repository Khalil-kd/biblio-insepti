import Image from "next/image";
import { APPLICATIONS } from "@/lib/applications-data";
import { CustomPromptIcon } from "./CustomPromptIcon";

export function ApplicationIcon({
  slug,
  customIconKey,
  size = 32,
}: {
  slug: string;
  customIconKey?: string | null;
  size?: number;
}) {
  const application = APPLICATIONS.find((item) => item.slug === slug);
  if (slug === "other" || !application?.iconPath) {
    return (
      <CustomPromptIcon
        iconKey={customIconKey}
        className=""
        size={size}
      />
    );
  }

  return (
    <Image
      src={application.iconPath}
      alt=""
      width={size}
      height={size}
      className="object-contain"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
