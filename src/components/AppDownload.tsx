import Image from "next/image";
import Link from "next/link";

export default function AppDownload() {
  return (
    <div className="mt-8 text-center">
      <p className="text-[#3D2817] text-base md:text-lg mb-3 font-medium">
        Download the app here
      </p>
      <Link
        href="https://apps.apple.com/us/app/pray-it-forward/id6757207986"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
        aria-label="Download on the App Store"
      >
        <Image
          src="/395837460.png"
          alt="Download on the App Store"
          width={150}
          height={50}
          className="h-auto w-auto object-contain mx-auto"
          unoptimized
        />
      </Link>
    </div>
  );
}

