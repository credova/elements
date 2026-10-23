export default function FooterLink({
  label,
  href,
  description,
}: {
  label: string;
  href: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="group flex flex-col items-center justify-center rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-white lg:mx-4 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/30"
      target="_blank"
      rel="noopener noreferrer"
    >
      <h2 className="mb-3 text-2xl font-semibold">
        {label}{' '}
        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
            />
          </svg>
        </span>
      </h2>
      <p className="m-0 max-w-[30ch] text-center text-sm opacity-50">{description}</p>
    </a>
  );
}
