export default function ProgressIndicator() {
  return (
    <nav aria-label="진행 단계">
      <ol className="flex items-center gap-6">
        {/* 1단계 */}
        <li className="flex items-center">
          {/* 완료, 진행, 대기 */}
          <span className="sr-only">1단계: </span>
          <span
            className="data-[state=completed]:bg-key-color-primary data-[state=current]:bg-key-color-primary block h-2 w-24 rounded-full"
            aria-hidden="true"
            data-state="completed"
          ></span>
        </li>

        {/* 2단계 */}
        <li className="flex items-center">
          {/* 완료, 진행, 대기 */}
          <span className="sr-only">2단계: </span>
          <span
            className="data-[state=completed]:bg-key-color-primary data-[state=current]:bg-key-color-primary block h-2 w-24 rounded-full data-[state=upcoming]:bg-gray-200"
            aria-hidden="true"
            data-state="current"
          ></span>
        </li>

        {/* 3단계 */}
        <li className="flex items-center">
          {/* 완료, 진행, 대기 */}
          <span className="sr-only">3단계: </span>
          <span
            className="data-[state=completed]:bg-key-color-primary data-[state=current]:bg-key-color-primary block h-2 w-24 rounded-full data-[state=upcoming]:bg-gray-200"
            aria-hidden="true"
            data-state="upcoming"
          ></span>
        </li>
      </ol>
    </nav>
  );
}
